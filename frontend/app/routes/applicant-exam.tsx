import { useState, useEffect, useRef } from "react";
import { Link, useLoaderData, redirect, useBlocker } from "react-router";
import type { Route } from "./+types/applicant-exam";
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
  }));
}

export function meta({ data }: Route.MetaArgs) {
  const group = (data as any)?.group;
  return [
    { title: group ? `${group.title} — Abituriyent İmtahanı` : "İmtahan — İmtahanVer" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { exampageId, groupId } = params;

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const [exampagesRes, groupsRes, questionsRes] = await Promise.all([
      fetch(`${API_BASE}/api/front/applicant-exampages`),
      fetch(`${API_BASE}/api/front/applicant-exampages/${exampageId}/groups`),
      fetch(`${API_BASE}/api/front/applicant-exampages/${exampageId}/groups/${groupId}/questions`),
    ]);

    const [exampagesData, groupsData, questionsData] = await Promise.all([
      exampagesRes.json(),
      groupsRes.json(),
      questionsRes.json(),
    ]);

    const exampage = exampagesData.success
      ? exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null
      : null;

    const group = groupsData.success
      ? groupsData.data.find((g: any) => g.id === Number(groupId)) ?? null
      : null;

    const url = new URL(request.url);
    const sessionIdParam = url.searchParams.get("session_id");

    let examSessionData = null;
    let remainingSeconds = 0;
    let initialAnswers = {};

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
          applicant_exampage_id: Number(exampageId),
          applicant_group_id: Number(groupId),
          applicant_subject_id: null,
        }),
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.success) {
        return {
          exampage: null,
          group: null,
          questions: [],
          examSession: null,
          remainingSeconds: 0,
          initialAnswers: {},
          token: session.token,
          exampageId,
          groupId,
          errorMessage: sessionData.message || "Sessiya yaradılmadı.",
        };
      }

      examSessionData = sessionData.session;
      remainingSeconds = sessionData.remaining_seconds;
      initialAnswers = sessionData.answers || {};
    }

    return {
      exampage,
      group,
      questions: questionsData.success ? withImageUrl(questionsData.data) : [],
      examSession: examSessionData,
      remainingSeconds,
      initialAnswers,
      token: session.token,
      exampageId,
      groupId,
    };
  } catch (err) {
    console.error("Applicant exam loader error:", err);
    return {
      exampage: null,
      group: null,
      questions: [],
      examSession: null,
      remainingSeconds: 0,
      initialAnswers: {},
      token: session.token,
      exampageId,
      groupId,
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

  const minutes = Math.max(0, Math.floor(remaining / 60));
  const seconds = Math.max(0, remaining % 60);
  const isLow = remaining <= 300;
  const isDone = remaining <= 0;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return { formatted, isLow, isDone };
}

export default function ApplicantExam() {
  const {
    exampage,
    group,
    questions,
    examSession,
    remainingSeconds,
    initialAnswers,
    token,
    exampageId,
    groupId,
    errorMessage,
  } = useLoaderData<typeof loader>();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>(initialAnswers || {});
  const openAnswerTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const [sessionState, setSessionState] = useState<any>(examSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(
    examSession?.status === "completed" ? examSession : null
  );

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Block back navigation if exam is in progress
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !completedSession &&
      currentLocation.pathname !== nextLocation.pathname
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
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          applicant_question_id: questionId,
          applicant_question_option_id: optionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.session && data.session.status === "completed") {
          setCompletedSession(data.session);
          showToast(data.message || "İmtahan artıq başa çatıb.");
        } else {
          showToast(data.message || "Cavab yadda saxlanılmadı.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("İnternet xətası baş verdi.");
    }
  };

  const handleSaveOpen = async (questionId: number, text: string) => {
    if (completedSession) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [`text_${questionId}`]: text,
    }));

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          applicant_question_id: questionId,
          written_answer: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Cavab yadda saxlanılmadı.");
      }
    } catch (err) {
      console.error(err);
      showToast("İnternet xətası baş verdi.");
    }
  };

  const scheduleSaveOpen = (questionId: number, text: string) => {
    if (openAnswerTimers.current[questionId]) {
      clearTimeout(openAnswerTimers.current[questionId]);
    }
    openAnswerTimers.current[questionId] = setTimeout(() => {
      delete openAnswerTimers.current[questionId];
      handleSaveOpen(questionId, text);
    }, 800);
  };

  const flushPendingOpenAnswers = async () => {
    const pending = Object.entries(openAnswerTimers.current);
    openAnswerTimers.current = {};
    await Promise.all(
      pending.map(([questionId, timer]) => {
        clearTimeout(timer);
        return handleSaveOpen(Number(questionId), selectedAnswers[`text_${questionId}`] ?? "");
      })
    );
  };

  const handleClearAnswer = async (questionId: number, type: number) => {
    if (completedSession) return;

    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[`option_${questionId}`];
      delete copy[`text_${questionId}`];
      return copy;
    });

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          applicant_question_id: questionId,
          applicant_question_option_id: null,
          written_answer: null,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTimeExpired = async () => {
    if (completedSession) return;
    showToast("İmtahan vaxtı bitdi. Cavablarınız sonlandırılır...");
    await finishExam();
  };

  const finishExam = async () => {
    setIsSubmitting(true);
    try {
      await flushPendingOpenAnswers();
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompletedSession(data.session);
        setSessionState(data.session);
      } else {
        showToast(data.message || "Xəta baş verdi.");
      }
    } catch (err) {
      console.error(err);
      showToast("Gözlənilməz xəta baş verdi.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!exampage || !group || !sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center p-8 bg-paper rounded-2xl shadow-sm border border-ink/10">
          <p className="text-red-500 font-semibold">{errorMessage || "Məlumatlar yüklənə bilmədi."}</p>
          <Link to="/applicant-exampages" className="mt-4 inline-block text-xs font-bold text-amber-brand-deep hover:underline">
            Geri qayıt
          </Link>
        </div>
      </div>
    );
  }

  // ─── RENDER RESULTS PAGE ────────────────────────────────────────────────────
  if (completedSession) {
    const answeredCount = questions.filter((q) => {
      if (q.question_type === 1) {
        return !!selectedAnswers[`option_${q.id}`];
      } else {
        return !!selectedAnswers[`text_${q.id}`];
      }
    }).length;
    const unansweredCount = questions.length - answeredCount;

    return (
      <div className="min-h-screen bg-paper text-ink font-sans pb-16">
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              to={`/applicant-exampages/${exampageId}/groups`}
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Qruplara Qayıt
            </Link>
            <span className="text-xs font-bold text-ink-soft/70 bg-paper-2 px-3 py-1 rounded-full">
              Sınaq Bitib
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-6 mt-8">
          <div className="bg-paper border border-ink/10 rounded-3xl p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-teal-500/5 rounded-full blur-3xl"></div>

            <div className="text-center relative z-10">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                ABİTURİYENT İMTAHANI
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {group.title}
              </h2>
              <p className="text-xs text-ink-soft/70 mt-1">
                {exampage.title}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-b border-ink/10 py-6">
                <div>
                  <span className="text-xs text-ink-soft/70 block">Sual sayı</span>
                  <span className="text-lg font-bold text-ink">{questions.length}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft/70 block">Cavablandırılan</span>
                  <span className="text-lg font-bold text-ink">{answeredCount}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft/70 block">Boş buraxılan</span>
                  <span className="text-lg font-bold text-ink">{unansweredCount}</span>
                </div>
              </div>

              <div className="mt-12 text-left">
                <h4 className="text-lg font-bold text-ink mb-4">
                  Suallara verilmiş cavablar
                </h4>

                <div className="space-y-6">
                  {questions.map((q: any, idx: number) => {
                    const isClosed = q.question_type === 1;
                    const userSelectedOptionId = selectedAnswers[`option_${q.id}`];
                    const userTextAns = selectedAnswers[`text_${q.id}`];
                    const isAnswered = isClosed ? !!userSelectedOptionId : !!userTextAns;

                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl border bg-paper p-6 shadow-sm border-ink/10"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex gap-3">
                            <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold bg-paper-2 text-ink-soft">
                              {idx + 1}
                            </span>
                            <div
                              className="text-sm font-medium text-ink leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: q.title ?? "" }}
                            />
                          </div>

                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isAnswered ? "bg-emerald-50 text-emerald-700" : "bg-paper-2 text-ink-soft"
                          }`}>
                            {isAnswered ? "Cavablandırılıb" : "Boş"}
                          </span>
                        </div>

                        {q.image_url && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-ink/10">
                            <img src={q.image_url} alt="" className="w-full max-h-72 object-contain" />
                          </div>
                        )}

                        {isClosed ? (
                          <div className="space-y-2">
                            {q.options.map((opt: any, oIdx: number) => {
                              const isSelected = userSelectedOptionId === opt.id;
                              let styles = isSelected
                                ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 font-semibold"
                                : "border-ink/10 bg-paper-2/40";

                              return (
                                <div key={opt.id} className={`flex items-start gap-3 px-4 py-2.5 rounded-xl border text-xs ${styles}`}>
                                  <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                                    isSelected ? "bg-emerald-500 text-white border-emerald-500" : "border-ink/20 text-ink-soft"
                                  }`}>
                                    {OPTION_LABELS[oIdx] ?? oIdx + 1}
                                  </span>
                                  <div className="flex-1">
                                    {opt.text && <div dangerouslySetInnerHTML={{ __html: opt.text }} />}
                                    {opt.image && (
                                      <img
                                        src={`${STORAGE_BASE}/${opt.image.replace(/^\/+/, "")}`}
                                        alt="Variant şəkli"
                                        className="mt-2 max-h-24 rounded-lg border border-ink/10 object-contain bg-paper"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 bg-paper-2 rounded-xl space-y-2 text-xs">
                            <p>
                              <span className="text-ink-soft/70 block mb-0.5">Sizin cavabınız:</span>
                              <strong className={isAnswered ? "text-emerald-600 text-sm font-bold" : "text-ink-soft text-sm font-semibold"}>
                                {userTextAns || "—"}
                              </strong>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/applicant-exampages"
                  className="w-full inline-block py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Sınaq Vərəqlərinə Qayıt
                </Link>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── RENDER EXAM TAKING UI ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-16">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border bg-board text-white shadow-lg border-board-deep animate-in fade-in slide-in-from-bottom-5">
          <svg className="w-5 h-5 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-ink">İmtahanı bitirmək istəyirsiniz?</h3>
            <p className="text-xs text-ink-soft mt-2">
              Hazırkı cavablarınız yadda saxlanılacaq və sınaq nəticələriniz dərhal hesablanacaq. Bu əməliyyat geri qaytarılmır.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-ink/10 hover:bg-paper-2 text-ink text-xs font-bold rounded-xl cursor-pointer"
              >
                İmtahana davam et
              </button>
              <button
                onClick={finishExam}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                {isSubmitting ? "Bitirilir..." : "Bəli, Bitir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-paper border border-ink/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-ink leading-snug">
              İmtahandan çıxmaq istəyirsiniz?
            </h3>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              İmtahanı yarımçıq qoysanız, seçdiyiniz cavablar üzrə nəticələr <strong className="text-ink">avtomatik yekunlaşacaq</strong>.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => blocker.reset()}
                className="flex-1 py-3 px-4 border border-ink/10 hover:bg-paper-2 text-ink text-xs font-bold rounded-xl cursor-pointer"
              >
                İmtahana qayıt
              </button>
              <button
                type="button"
                onClick={async () => {
                  await finishExam();
                  blocker.proceed();
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Bəli, nəticəni qeyd et və çıx
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-paper border-b border-ink/10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider block leading-none mb-1">
              ABİTURİYENT İMTAHANI
            </span>
            <h1 className="text-sm font-bold text-ink leading-none">
              {group.title} · <span className="text-xs font-medium text-ink-soft/70">{exampage.title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ink/10 bg-paper-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-extrabold text-ink tabular-nums">
                {timerDisplay}
              </span>
            </div>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Bitir
            </button>
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-8 space-y-10">
          {questions.map((q: any, idx: number) => {
            const userTextAns = selectedAnswers[`text_${q.id}`] || "";
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className="bg-paper border border-ink/10 rounded-3xl p-6 md:p-8 shadow-sm scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-ink-soft/70">
                    {q.question_type === 1 ? "Qapalı sual" : q.question_type === 2 ? "Kodlaşdırıla bilən açıq sual" : "Yazılı açıq sual"}
                  </span>
                </div>

                {/* Title / Question text */}
                <div
                  className="text-base font-medium text-ink leading-relaxed mb-6 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: q.title ?? "" }}
                />

                {/* Question Image if exists */}
                {q.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-ink/10">
                    <img src={q.image_url} alt="" className="w-full max-h-80 object-contain bg-paper-2" />
                  </div>
                )}

                {/* Answers Input Area */}
                <div className="border-t border-ink/10 pt-6">
                  {q.question_type === 1 ? (
                    // Closed Options (A, B, C, D, E)
                    <div className="space-y-3">
                      {q.options.map((opt: any, oIdx: number) => {
                        const isSelected = selectedAnswers[`option_${q.id}`] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectClosed(q.id, opt.id)}
                            className={`w-full flex items-start gap-3 px-5 py-4 rounded-2xl border text-left text-sm transition-all cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                                : "border-ink/10 hover:bg-paper-2/50 text-ink"
                            }`}
                          >
                            <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${
                              isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-ink/20 text-ink-soft"
                            }`}>
                              {OPTION_LABELS[oIdx] ?? oIdx + 1}
                            </span>
                            <div className="flex-1">
                              {opt.text && <div dangerouslySetInnerHTML={{ __html: opt.text }} />}
                              {opt.image && (
                                <img
                                  src={`${STORAGE_BASE}/${opt.image.replace(/^\/+/, "")}`}
                                  alt="Variant şəkli"
                                  className="mt-2 max-h-24 rounded-lg border border-ink/10 object-contain bg-paper"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : q.question_type === 2 ? (
                    // Codeable open question (textarea instead of input text)
                    <div>
                      <label className="text-xs font-bold text-ink-soft/70 block mb-2">
                        Riyazi/Hərfi cavabı daxil edin:
                      </label>
                      <textarea
                        rows={3}
                        value={userTextAns}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [`text_${q.id}`]: newVal,
                          }));
                          scheduleSaveOpen(q.id, newVal);
                        }}
                        onBlur={(e) => {
                          if (openAnswerTimers.current[q.id]) {
                            clearTimeout(openAnswerTimers.current[q.id]);
                            delete openAnswerTimers.current[q.id];
                          }
                          handleSaveOpen(q.id, e.target.value);
                        }}
                        placeholder="Məs. 12,5"
                        className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-paper-2/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
                      />
                    </div>
                  ) : (
                    // Written open question (textarea)
                    <div>
                      <label className="text-xs font-bold text-ink-soft/70 block mb-2">
                        Açıq yazılı cavabınızı daxil edin:
                      </label>
                      <textarea
                        rows={4}
                        value={userTextAns}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [`text_${q.id}`]: newVal,
                          }));
                          scheduleSaveOpen(q.id, newVal);
                        }}
                        onBlur={(e) => {
                          if (openAnswerTimers.current[q.id]) {
                            clearTimeout(openAnswerTimers.current[q.id]);
                            delete openAnswerTimers.current[q.id];
                          }
                          handleSaveOpen(q.id, e.target.value);
                        }}
                        placeholder="Buraya qeyd edin..."
                        className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-paper-2/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Card Navigation */}
                <div className="mt-8 pt-6 border-t border-ink/10 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClearAnswer(q.id, q.question_type)}
                      className="py-2.5 px-4 text-xs font-bold text-ink-soft hover:text-red-500 transition-colors cursor-pointer border border-transparent hover:border-red-200 rounded-xl"
                    >
                      Cavabı Sil
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
      </main>
    </div>
  );
}
