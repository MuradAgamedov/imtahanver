import { useState, useEffect, useRef } from "react";
import { Link, useLoaderData, redirect, useBlocker } from "react-router";
import { sessionCookie, type UserSession } from "../lib/session";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];
const isProd = typeof window !== "undefined"
  ? window.location.hostname.endsWith("imtahanver.online")
  : true;
const STORAGE_BASE = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";
const API_BASE = "http://backend:80";
const CLIENT_API_BASE = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";

function withImageUrl(questions: any[]): any[] {
  return questions.map((q) => ({
    ...q,
    image_url: q.image ? `${STORAGE_BASE}/${q.image.replace(/^\/+/, "")}` : null,
    audio_url: q.audio ? `${STORAGE_BASE}/${q.audio.replace(/^\/+/, "")}` : null,
    passage: q.passage
      ? { ...q.passage, audio_url: q.passage.audio ? `${STORAGE_BASE}/${q.passage.audio.replace(/^\/+/, "")}` : null }
      : null,
  }));
}

export function meta({ data }: any) {
  const ep = (data as any)?.exampage;
  return [
    { title: ep ? `${ep.title} — Magistratura İmtahanı` : "Magistratura İmtahanı — İmtahanVer" },
  ];
}

export async function loader({ request, params }: any) {
  const { exampageId } = params;

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const [exampagesRes, subjectsRes, questionsRes] = await Promise.all([
      fetch(`${API_BASE}/api/front/magistratura-exampages`),
      fetch(`${API_BASE}/api/front/magistratura-exampages/${exampageId}/subjects`),
      fetch(`${API_BASE}/api/front/magistratura-exampages/${exampageId}/questions`),
    ]);

    const [exampagesData, subjectsData, questionsData] = await Promise.all([
      exampagesRes.json(),
      subjectsRes.json(),
      questionsRes.json(),
    ]);

    const exampage = exampagesData.success
      ? exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null
      : null;

    const subjects = subjectsData.success ? subjectsData.data : [];

    const url = new URL(request.url);
    const sessionIdParam = url.searchParams.get("session_id");

    let examSessionData = null;
    let remainingSeconds = 0;
    let initialAnswers = {};
    let review: Record<string, any> = {};

    if (sessionIdParam) {
      const resultsRes = await fetch(`${API_BASE}/api/front/exam-sessions/${sessionIdParam}/results`, {
        headers: {
          "Authorization": `Bearer ${session.token}`,
          "Accept": "application/json",
        },
      });
      const resultsData = await resultsRes.json();
      if (resultsData.success) {
        examSessionData = resultsData.session;
        initialAnswers = resultsData.answers || {};
        review = resultsData.review || {};
        remainingSeconds = 0;
      }
    }

    if (!examSessionData) {
      const sessionRes = await fetch(`${API_BASE}/api/front/exam-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          magistratura_exampage_id: Number(exampageId),
        }),
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.success) {
        return {
          exampage: null,
          subjects: [],
          questions: [],
          examSession: null,
          remainingSeconds: 0,
          initialAnswers: {},
          review: {},
          token: session.token,
          exampageId,
          errorMessage: sessionData.message || "Sessiya yaradılmadı.",
        };
      }

      examSessionData = sessionData.session;
      remainingSeconds = sessionData.remaining_seconds;
      initialAnswers = sessionData.answers || {};
    }

    return {
      exampage,
      subjects,
      questions: questionsData.success ? withImageUrl(questionsData.data) : [],
      examSession: examSessionData,
      remainingSeconds,
      initialAnswers,
      review,
      token: session.token,
      exampageId,
    };
  } catch {
    return {
      exampage: null,
      subjects: [],
      questions: [],
      examSession: null,
      remainingSeconds: 0,
      initialAnswers: {},
      review: {},
      token: session.token,
      exampageId,
    };
  }
}

function useCountdown(totalSeconds: number, onExpired?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(totalSeconds);

  useEffect(() => {
    ref.current = totalSeconds;
    setRemaining(totalSeconds);

    if (totalSeconds <= 0) return;

    const id = setInterval(() => {
      ref.current -= 1;
      setRemaining(ref.current);
      if (ref.current <= 0) {
        clearInterval(id);
        if (onExpired) onExpired();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 300;
  const isDone = remaining <= 0;
  const formatted = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return { formatted, isLow, isDone };
}

export default function MagistraturaExam() {
  const {
    exampage,
    subjects,
    questions,
    examSession,
    remainingSeconds,
    initialAnswers,
    review,
    token,
    exampageId,
    errorMessage,
  } = useLoaderData<any>();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>(initialAnswers || {});
  const openAnswerTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const [sessionState, setSessionState] = useState<any>(examSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(
    examSession?.status === "completed" ? examSession : null
  );

  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(() => {
    return subjects?.[0]?.id || null;
  });

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !completedSession && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (completedSession) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [completedSession]);

  const { formatted: timerDisplay, isLow } = useCountdown(
    completedSession ? 0 : remainingSeconds,
    () => {
      handleTimeExpired();
    }
  );

  const handleSelectClosed = async (questionId: number, optionId: number) => {
    if (completedSession) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [`option_${questionId}`]: optionId,
    }));

    try {
      await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          magistratura_question_id: questionId,
          magistratura_question_option_id: optionId,
        }),
      });
    } catch {
      showToast("Cavab sinxronlaşdırıla bilmədi.");
    }
  };

  const handleOpenAnswerChange = (questionId: number, text: string) => {
    if (completedSession) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [`text_${questionId}`]: text,
    }));

    if (openAnswerTimers.current[questionId]) {
      clearTimeout(openAnswerTimers.current[questionId]);
    }

    openAnswerTimers.current[questionId] = setTimeout(async () => {
      try {
        await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/written-answers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
          body: JSON.stringify({
            magistratura_question_id: questionId,
            written_answer: text,
          }),
        });
      } catch {
        showToast("Yazılı cavab yadda saxlanılmadı.");
      }
    }, 600);
  };

  const handleTimeExpired = async () => {
    if (completedSession) return;
    showToast("İmtahan vaxtınız bitdi! Nəticəniz yekunlaşdırılır...");
    await finishExam();
  };

  const finishExam = async () => {
    if (isSubmitting || completedSession) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setCompletedSession(data.session);
        setSessionState(data.session);
      } else {
        showToast(data.message || "İmtahanı bitirmək mümkün olmadı.");
      }
    } catch {
      showToast("Şəbəkə xətası baş verdi.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!exampage || !sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center p-8 bg-paper rounded-2xl shadow-sm border border-ink/10">
          <p className="text-red-500 font-semibold">{errorMessage || "Məlumatlar yüklənə bilmədi."}</p>
          <Link to="/magistratura-exampages" className="mt-4 inline-block text-xs font-bold text-emerald-600 hover:underline">
            Geri qayıt
          </Link>
        </div>
      </div>
    );
  }

  // Filter questions by active subject if subjects exist
  const displayedQuestions = activeSubjectId
    ? questions.filter((q: any) => q.magistratura_subject_id === activeSubjectId)
    : questions;

  // ─── RENDER RESULTS PAGE ────────────────────────────────────────────────────
  if (completedSession) {
    const answeredCount = questions.filter((q: any) => {
      if (q.question_type === 1) return !!selectedAnswers[`option_${q.id}`];
      return !!selectedAnswers[`text_${q.id}`];
    }).length;
    const unansweredCount = questions.length - answeredCount;
    const gradingApproved = completedSession?.grading_approved !== false;
    const reviewMap: Record<string, any> = (review as Record<string, any>) || {};
    const breakdown: any[] = completedSession?.magistratura_breakdown || [];

    return (
      <div className="min-h-screen bg-paper text-ink font-sans pb-16">
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              to="/magistratura-exampages"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              İmtahan Vərəqlərinə Qayıt
            </Link>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              İmtahan Başa Çatdı
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-6 mt-8 space-y-6">
          <div className="bg-paper border border-ink/10 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              MAGİSTRATURA İMTAHANI (DİM)
            </span>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {exampage.title}
            </h2>
            <p className="text-xs text-ink-soft mt-1">Maksimum nəticə: 100 bal</p>

            {gradingApproved ? (
              <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-emerald-50 border border-emerald-200 px-8 py-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Yekun Balınız</span>
                <span className="text-4xl font-extrabold text-emerald-800 mt-1">
                  {completedSession.score ?? 0}{" "}
                  <span className="text-lg font-semibold text-emerald-600">/ 100 bal</span>
                </span>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                <strong>Yazılı cavablarınız yoxlanılır.</strong> Müəllim qiymətləndirməsindən sonra yekun balınız görünəcək.
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-b border-ink/10 py-5">
              <div>
                <span className="text-xs text-ink-soft block">Ümumi Sual</span>
                <span className="text-lg font-bold text-ink">{questions.length}</span>
              </div>
              <div>
                <span className="text-xs text-ink-soft block">Cavablandırılan</span>
                <span className="text-lg font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-xs text-ink-soft block">Boş Buraxılan</span>
                <span className="text-lg font-bold text-ink-soft">{unansweredCount}</span>
              </div>
            </div>

            {/* Fənlər üzrə bal bölgüsü (Breakdown) */}
            {breakdown.length > 0 && (
              <div className="mt-6 text-left">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Fənlər üzrə nəticələr:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {breakdown.map((b: any) => (
                    <div key={b.subject_id} className="p-3.5 rounded-2xl bg-paper-2 border border-ink/5 space-y-1">
                      <p className="text-xs font-bold text-ink truncate">{b.subject_title}</p>
                      <p className="text-lg font-extrabold text-emerald-700">
                        {b.earned} <span className="text-xs font-normal text-ink-soft">/ {b.max} bal</span>
                      </p>
                      <div className="text-[11px] text-ink-soft flex justify-between pt-1 border-t border-ink/5">
                        <span>Düzgün: {b.correct}</span>
                        <span>Səhv: {b.incorrect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sualların ətraflı icmalı */}
          <div className="bg-paper border border-ink/10 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-ink">Sualların Ətraflı İcmalı</h3>
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => {
                const isClosed = q.question_type === 1;
                const userOptId = selectedAnswers[`option_${q.id}`];
                const userTextAns = selectedAnswers[`text_${q.id}`];
                const isAnswered = isClosed ? !!userOptId : !!userTextAns;

                return (
                  <div key={q.id} className="p-4 rounded-2xl border border-ink/10 bg-paper-2/40 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 text-xs text-ink font-medium">
                        <div dangerouslySetInnerHTML={{ __html: q.title || "(Başlıq yoxdur)" }} />
                        {q.image_url && <img src={q.image_url} alt="Sual" className="mt-2 max-h-36 rounded-lg object-contain bg-white border" />}
                        {q.audio_url && <audio controls src={q.audio_url} className="mt-2 h-8 w-full max-w-sm" />}
                      </div>
                    </div>

                    {isClosed ? (
                      <div className="space-y-1.5 pl-9">
                        {q.options?.map((opt: any, oIdx: number) => {
                          const isSelected = userOptId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border text-xs flex items-center gap-2 ${
                                isSelected ? "border-emerald-500 bg-emerald-50/70 font-bold text-emerald-950" : "border-ink/5 bg-white text-ink-soft"
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-paper-2 flex items-center justify-center font-bold text-[11px]">
                                {OPTION_LABELS[oIdx] || oIdx + 1}
                              </span>
                              <span>{opt.text}</span>
                              {isSelected && <span className="text-[10px] ml-auto text-emerald-700 font-bold">(Sizin cavabınız)</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pl-9 text-xs">
                        <p className="text-ink-soft">Sizin cavabınız: <strong className="text-ink">{userTextAns || "—"}</strong></p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              to="/magistratura-exampages"
              className="mt-6 block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center transition-colors"
            >
              Sınaq Vərəqlərinə Qayıt
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ─── RENDER EXAM TAKING UI ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-16">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-xl">
          {toastMessage}
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">İmtahanı bitirmək istəyirsiniz?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cavablarınız yadda saxlanılacaq və nəticəniz yekunlaşacaq. Əminsiniz?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Davam et
              </button>
              <button
                onClick={finishExam}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Bitirilir..." : "Bəli, Bitir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-paper border-b border-ink/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block leading-none mb-1">
              MAGİSTRATURA İMTAHANI (DİM)
            </span>
            <h1 className="text-sm font-bold text-ink leading-none">{exampage.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              isLow ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-paper-2 text-ink border-ink/10"
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timerDisplay}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              İmtahanı Bitir
            </button>
          </div>
        </div>

        {/* Fənn Tabs */}
        {subjects.length > 0 && (
          <div className="border-t border-ink/5 bg-paper-2/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveSubjectId(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSubjectId === null ? "bg-emerald-600 text-white shadow-sm" : "text-ink-soft hover:bg-paper"
                }`}
              >
                Bütün Fənlər ({questions.length})
              </button>
              {subjects.map((s: any) => {
                const count = questions.filter((q: any) => q.magistratura_subject_id === s.id).length;
                const isAct = activeSubjectId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSubjectId(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isAct ? "bg-emerald-600 text-white shadow-sm" : "text-ink-soft hover:bg-paper"
                    }`}
                  >
                    {s.title} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suallar siyahısı */}
        <div className="lg:col-span-3 space-y-4">
          {displayedQuestions.length === 0 ? (
            <div className="bg-paper border border-ink/10 rounded-2xl p-8 text-center text-xs text-ink-soft">
              Bu fənn üzrə sual yoxdur.
            </div>
          ) : (
            displayedQuestions.map((q: any, idx: number) => {
              const isClosed = q.question_type === 1;
              const globalIdx = questions.findIndex((item: any) => item.id === q.id);
              const qNum = globalIdx !== -1 ? globalIdx + 1 : idx + 1;
              const selectedOptId = selectedAnswers[`option_${q.id}`];
              const textVal = selectedAnswers[`text_${q.id}`] ?? "";

              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className="bg-paper border border-ink/10 rounded-2xl p-6 shadow-sm space-y-4 hover:border-emerald-200 transition-colors"
                >
                  {/* Keçid mətni / audiosu varsa */}
                  {q.passage && (
                    <div className="p-4 rounded-xl bg-paper-2 border border-ink/5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Ümumi Mətn / Dinləmə</span>
                      {q.passage.text && (
                        <div className="text-xs text-ink font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: q.passage.text }} />
                      )}
                      {q.passage.audio_url && (
                        <audio controls src={q.passage.audio_url} className="mt-2 h-8 w-full max-w-sm" />
                      )}
                    </div>
                  )}

                  {/* Sual Başlığı */}
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {qNum}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-ink font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: q.title || "(Başlıq yoxdur)" }} />
                      {q.image_url && (
                        <img src={q.image_url} alt="Sual" className="max-h-48 rounded-xl object-contain bg-white border" />
                      )}
                      {q.audio_url && (
                        <audio controls src={q.audio_url} className="h-8 w-full max-w-sm" />
                      )}
                    </div>
                  </div>

                  {/* Sual Cavab Bölməsi */}
                  {isClosed ? (
                    <div className="space-y-2 pl-10">
                      {q.options?.map((opt: any, oIdx: number) => {
                        const isChosen = selectedOptId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectClosed(q.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition-all cursor-pointer ${
                              isChosen
                                ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-950 shadow-sm"
                                : "border-ink/10 bg-paper hover:bg-paper-2 text-ink"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isChosen ? "bg-emerald-600 text-white" : "bg-paper-2 text-ink-soft"
                            }`}>
                              {OPTION_LABELS[oIdx] || oIdx + 1}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="pl-10 space-y-2">
                      <label className="block text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                        Cavabınızı daxil edin (Açıq sual):
                      </label>
                      <input
                        type="text"
                        value={textVal}
                        onChange={(e) => handleOpenAnswerChange(q.id, e.target.value)}
                        placeholder="Cavabı yazın..."
                        className="w-full p-3 rounded-xl border border-ink/15 bg-paper text-xs text-ink outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sual Naviqatoru (Sağ panel) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-paper border border-ink/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Sual Xəritəsi</h4>
              <span className="text-[11px] font-bold text-emerald-600">
                {Object.keys(selectedAnswers).length} / {questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-96 overflow-y-auto pr-1">
              {questions.map((q: any, i: number) => {
                const isAnswered = q.question_type === 1
                  ? !!selectedAnswers[`option_${q.id}`]
                  : !!selectedAnswers[`text_${q.id}`];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      if (activeSubjectId && q.magistratura_subject_id !== activeSubjectId) {
                        setActiveSubjectId(q.magistratura_subject_id);
                      }
                      setTimeout(() => {
                        const el = document.getElementById(`q-${q.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 50);
                    }}
                    className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isAnswered
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-paper-2 text-ink-soft hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-ink/10 flex items-center justify-between text-[11px] text-ink-soft">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                <span>Cavablanıb</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-paper-2 border border-ink/10" />
                <span>Boşdur</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
