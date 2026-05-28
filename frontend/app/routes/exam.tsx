import { useState, useEffect, useRef } from "react";
import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/exam";
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
  const subject = (data as any)?.subject;
  return [
    { title: subject ? `${subject.title} — MİQ İmtahanı` : "İmtahan — İmtahanVer" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { exampageId, subjectId } = params;

  // 1. Enforce Authentication
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    // 2. Fetch Exam Details and Questions
    const [exampagesData, subjectsData, fennData, tedrisData] = await Promise.all([
      fetch(`${API_BASE}/api/front/miq-exampages`).then((r) => r.json()),
      fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/subjects`).then((r) => r.json()),
      fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/question-types/1/subjects/${subjectId}/questions`).then((r) => r.json()),
      fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/question-types/2/direct-questions`).then((r) => r.json()),
    ]);

    const exampage = exampagesData.success
      ? exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null
      : null;

    const subject = subjectsData.success
      ? (subjectsData.data.find((d: any) => d.subject?.id === Number(subjectId))?.subject ?? null)
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
      // 3. Start or Resume Exam Session in the Backend
      const sessionRes = await fetch(`${API_BASE}/api/front/exam-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          miq_exampage_id: Number(exampageId),
          miq_subject_id: Number(subjectId),
        }),
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.success) {
        throw new Error(sessionData.message || "Sessiya yaradılmadı.");
      }

      examSessionData = sessionData.session;
      remainingSeconds = sessionData.remaining_seconds;
      initialAnswers = sessionData.answers || {};
    }

    return {
      exampage,
      subject,
      fennQuestions: fennData.success ? withImageUrl(fennData.data) : [],
      tedrisQuestions: tedrisData.success ? withImageUrl(tedrisData.data) : [],
      examSession: examSessionData,
      remainingSeconds,
      initialAnswers,
      token: session.token,
    };
  } catch (err) {
    console.error("Exam loader error:", err);
    return {
      exampage: null,
      subject: null,
      fennQuestions: [],
      tedrisQuestions: [],
      examSession: null,
      remainingSeconds: 0,
      initialAnswers: {},
      token: session.token,
    };
  }
}

function QuestionCard({
  index,
  question,
  selectedOptionId,
  onSelect,
}: {
  index: number;
  question: any;
  selectedOptionId?: number;
  onSelect: (optionId: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
      <div className="flex gap-3 mb-4">
        <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          {index + 1}
        </span>
        <div
          className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-line [&_i]:italic [&_b]:font-bold [&_u]:underline"
          dangerouslySetInnerHTML={{ __html: question.text ?? "" }}
        />
      </div>

      {question.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <img
            src={question.image_url}
            alt={`Sual ${index + 1}`}
            className="w-full max-h-72 object-contain bg-slate-50 dark:bg-slate-900"
          />
        </div>
      )}

      <div className="space-y-2">
        {question.options.map((opt: any, i: number) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-200 font-semibold"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span
                className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                }`}
              >
                {OPTION_LABELS[i] ?? i + 1}
              </span>
              <span
                className="leading-relaxed [&_i]:italic [&_b]:font-bold [&_u]:underline"
                dangerouslySetInnerHTML={{ __html: opt.text ?? "" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useCountdown(totalSeconds: number, onExpired?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(totalSeconds);

  useEffect(() => {
    ref.current = totalSeconds;
    setRemaining(totalSeconds);
    
    if (totalSeconds <= 0) {
      return;
    }

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
  const isLow = remaining <= 300; // last 5 min
  const isDone = remaining <= 0;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return { formatted, isLow, isDone };
}

export default function Exam() {
  const {
    exampage,
    subject,
    fennQuestions,
    tedrisQuestions,
    examSession,
    remainingSeconds,
    initialAnswers,
    token,
  } = useLoaderData<typeof loader>();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(initialAnswers || {});
  const [sessionState, setSessionState] = useState<any>(examSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(
    examSession?.status === "completed" ? examSession : null
  );
  const [reviewTab, setReviewTab] = useState<"fenn" | "tedris">("fenn");

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Countdown timer setup
  const { formatted: timerDisplay, isLow, isDone } = useCountdown(
    completedSession ? 0 : remainingSeconds,
    () => {
      handleTimeExpired();
    }
  );

  const totalQuestions = fennQuestions.length + tedrisQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = async (prefix: string, questionId: number, optionId: number) => {
    if (completedSession) return;

    const answerKey = `${prefix}_${questionId}`;
    
    // Save to local state optimistically
    setSelectedAnswers((prev) => ({ ...prev, [answerKey]: optionId }));

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/front/exam-sessions/${sessionState.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          miq_question_id: questionId,
          miq_question_option_id: optionId,
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
      console.error("Error saving answer:", err);
      showToast("İnternet əlaqəsində xəta baş verdi.");
    }
  };

  const handleTimeExpired = async () => {
    if (completedSession) return;
    showToast("İmtahan vaxtı bitdi. Nəticələr hesablanır...");
    await finishExam();
  };

  const finishExam = async () => {
    setIsSubmitting(true);
    try {
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
        showToast(data.message || "İmtahan sonlandırıla bilmədi.");
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
      showToast("Xəta baş verdi, yenidən cəhd edin.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // If the loader fails or parameters are invalid
  if (!exampage || !subject || !sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-sm">
          <p className="text-sm font-semibold text-red-500">İmtahan məlumatları tapılmadı və ya giriş icazəniz yoxdur.</p>
          <Link to="/" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  // ─── RENDER RESULTS PAGE ────────────────────────────────────────────────────
  if (completedSession) {
    const specialtyCorrect = completedSession.correct_specialty_count || 0;
    const specialtyIncorrect = completedSession.incorrect_specialty_count || 0;
    const pedagogyCorrect = completedSession.correct_pedagogy_count || 0;
    const pedagogyIncorrect = completedSession.incorrect_pedagogy_count || 0;

    const specialtyPoints = specialtyCorrect * 2 - specialtyIncorrect * 0.5;
    const pedagogyPoints = pedagogyCorrect * 1 - pedagogyIncorrect * 0.25;
    
    const totalAnswered = specialtyCorrect + specialtyIncorrect + pedagogyCorrect + pedagogyIncorrect;
    const totalUnanswered = totalQuestions - totalAnswered;

    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Panellərə Qayıt
            </Link>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              İmtahan Yekunlaşdı
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-6 mt-8">
          {/* Result card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-violet-500/5 rounded-full blur-3xl"></div>

            <div className="text-center relative z-10">
              <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                MİQ SINAQ NƏTİCƏSİ
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {subject.title} Fənni
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{exampage.title}</p>
              
              {/* Score Meter */}
              <div className="mt-8 flex justify-center">
                <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-4 border-indigo-50 dark:border-indigo-950/50 bg-gradient-to-tr from-indigo-50/10 to-violet-50/10 shadow-inner">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {completedSession.score}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mt-0.5">
                      100 Bal Şkalasından
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass/Fail Status Banner */}
              <div className={`mt-6 rounded-2xl p-5 border text-center ${
                specialtyPoints >= 34 && pedagogyPoints >= 6 && completedSession.score >= 40
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' 
                  : 'bg-rose-50/70 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {specialtyPoints >= 34 && pedagogyPoints >= 6 && completedSession.score >= 40 ? (
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-base font-extrabold uppercase tracking-wider">
                    {specialtyPoints >= 34 && pedagogyPoints >= 6 && completedSession.score >= 40 ? "İmtahandan Keçdiniz" : "Kəsildiniz (Keçid balı toplanmadı)"}
                  </span>
                </div>
                
                {/* Requirements breakdown */}
                <div className="mt-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-dashed pt-4 border-current/25">
                  <div>
                    <span className="opacity-80 block mb-1">İxtisas Balı (Min 34)</span>
                    <strong className="text-sm font-black">{specialtyPoints} Bal</strong>
                    <span className="text-[10px] block opacity-70 mt-0.5">
                      {specialtyPoints >= 34 ? "✅ Keçdi" : "❌ Keçmədi"}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-80 block mb-1">Metodika Balı (Min 6)</span>
                    <strong className="text-sm font-black">{pedagogyPoints} Bal</strong>
                    <span className="text-[10px] block opacity-70 mt-0.5">
                      {pedagogyPoints >= 6 ? "✅ Keçdi" : "❌ Keçmədi"}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-80 block mb-1">Ümumi Bal (Min 40)</span>
                    <strong className="text-sm font-black">{completedSession.score} Bal</strong>
                    <span className="text-[10px] block opacity-70 mt-0.5">
                      {completedSession.score >= 40 ? "✅ Keçdi" : "❌ Keçmədi"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-b border-slate-100 dark:border-slate-900 py-6">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">Sual sayı</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{totalQuestions}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">Cavablandırılan</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{totalAnswered}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">Boş buraxılan</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{totalUnanswered}</span>
                </div>
              </div>

              {/* Detail Cards */}
              <div className="mt-8 space-y-4 text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1">
                  Mövzular üzrə bölgü:
                </h4>
                
                {/* Specialty block */}
                <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      İxtisas Mövzusu (Fənn proqramları)
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Hər düzgün cavab <strong className="text-indigo-600 dark:text-indigo-400">+2 bal</strong>, hər səhv <strong className="text-red-500">-0.5 bal</strong> hesablanır.
                    </p>
                  </div>
                  <div className="flex gap-4 sm:text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Düz</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{specialtyCorrect}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-500 block">Səhv</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{specialtyIncorrect}</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                      <span className="text-[10px] uppercase font-bold text-indigo-500 block">Net Bal</span>
                      <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {specialtyPoints > 0 ? `+${specialtyPoints}` : specialtyPoints}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pedagogy block */}
                <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tədris metodikası və təlim strategiyaları
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Hər düzgün cavab <strong className="text-indigo-600 dark:text-indigo-400">+1 bal</strong>, hər səhv <strong className="text-red-500">-0.25 bal</strong> hesablanır.
                    </p>
                  </div>
                  <div className="flex gap-4 sm:text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Düz</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{pedagogyCorrect}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-500 block">Səhv</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{pedagogyIncorrect}</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                      <span className="text-[10px] uppercase font-bold text-indigo-500 block">Net Bal</span>
                      <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {pedagogyPoints > 0 ? `+${pedagogyPoints}` : pedagogyPoints}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Question Analysis Title */}
              <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-8 text-left">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Sualların Analizi və Cavablar
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aşağıdakı bölmələrdən düzgün və sizin verdiyiniz cavabları sual bazasında ətraflı incələyə bilərsiniz.
                </p>

                {/* Question Review Tabs */}
                <div className="flex gap-2 mt-6 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setReviewTab("fenn")}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                      reviewTab === "fenn"
                        ? "bg-white dark:bg-slate-950 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    İxtisas Mövzusu ({fennQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewTab("tedris")}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                      reviewTab === "tedris"
                        ? "bg-white dark:bg-slate-950 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Tədris Metodikası ({tedrisQuestions.length})
                  </button>
                </div>

                {/* Questions List in Review */}
                <div className="space-y-6 mt-6">
                  {(reviewTab === "fenn" ? fennQuestions : tedrisQuestions).map((q: any, idx: number) => {
                    const prefix = reviewTab === "fenn" ? "fenn" : "tedris";
                    const key = `${prefix}_${q.id}`;
                    const userSelectedOptionId = selectedAnswers[key];
                    const correctOption = q.options.find((opt: any) => opt.is_true);
                    const correctOptionId = correctOption?.id;

                    const isAnswered = !!userSelectedOptionId;
                    const isUserCorrect = isAnswered && userSelectedOptionId === correctOptionId;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-300 ${
                          !isAnswered
                            ? "border-slate-100 dark:border-slate-800"
                            : isUserCorrect
                            ? "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/5 dark:bg-emerald-950/5"
                            : "border-red-100 dark:border-red-900/40 bg-red-50/5 dark:bg-red-950/5"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex gap-3">
                            <span className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              !isAnswered
                                ? "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                                : isUserCorrect
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-955 text-red-700 dark:text-red-400"
                            }`}>
                              {idx + 1}
                            </span>
                            <div
                              className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-line [&_i]:italic [&_b]:font-bold [&_u]:underline"
                              dangerouslySetInnerHTML={{ __html: q.text ?? "" }}
                            />
                          </div>

                          {/* Status Badge */}
                          <div>
                            {!isAnswered ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                ⚪ Boş buraxılıb
                              </span>
                            ) : isUserCorrect ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                ✅ Doğru
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-955/50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                                ❌ Yanlış
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Image if exists */}
                        {q.image_url && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                            <img
                              src={q.image_url}
                              alt={`Sual ${idx + 1}`}
                              className="w-full max-h-72 object-contain bg-slate-50 dark:bg-slate-900"
                            />
                          </div>
                        )}

                        {/* Options List */}
                        <div className="space-y-2">
                          {q.options.map((opt: any, oIdx: number) => {
                            const isSelected = userSelectedOptionId === opt.id;
                            const isTrue = !!opt.is_true;

                            let optionStyles = "border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300";
                            let badgeLabel = "";
                            let badgeStyles = "";

                            if (isTrue) {
                              optionStyles = "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold shadow-sm";
                              if (isSelected) {
                                badgeLabel = "Sizin cavabınız (Doğru)";
                                badgeStyles = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
                              } else {
                                badgeLabel = "Doğru cavab";
                                badgeStyles = "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                              }
                            } else if (isSelected) {
                              optionStyles = "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900 dark:text-red-300 font-semibold shadow-sm";
                              badgeLabel = "Sizin cavabınız (Yanlış)";
                              badgeStyles = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
                            } else {
                              optionStyles = "border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 opacity-70";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`w-full flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${optionStyles}`}
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${
                                      isTrue
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : isSelected
                                        ? "border-red-500 bg-red-500 text-white"
                                        : "border-slate-300 dark:border-slate-600 text-slate-500"
                                    }`}
                                  >
                                    {OPTION_LABELS[oIdx] ?? oIdx + 1}
                                  </span>
                                  <span
                                    className="leading-relaxed [&_i]:italic [&_b]:font-bold [&_u]:underline"
                                    dangerouslySetInnerHTML={{ __html: opt.text ?? "" }}
                                  />
                                </div>

                                {badgeLabel && (
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeStyles} whitespace-nowrap`}>
                                    {badgeLabel}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/"
                  className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer text-center"
                >
                  Ana Səhifəyə Qayıt
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
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border bg-slate-900 text-white shadow-lg border-slate-800 animate-in fade-in slide-in-from-bottom-5">
          <svg className="w-5 h-5 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">İmtahanı bitirmək istəyirsiniz?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Hazırkı cavablarınız yadda saxlanılacaq və imtahan nəticələriniz dərhal hesablanacaq. Bu əməliyyatı geri qaytarmaq olmaz.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                İmtahana davam et
              </button>
              <button
                onClick={finishExam}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                {isSubmitting ? "Bitirilir..." : "Bəli, Bitir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 truncate">
              <span>MİQ</span>
              <span>›</span>
              <span>{exampage.title}</span>
              <span>›</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{subject.title}</span>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{answeredCount}</span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{totalQuestions}</span>
              <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 ml-1">cavablanıb</span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold tabular-nums transition-colors ${
              isDone
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                : isLow
                ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 animate-pulse"
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
            }`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timerDisplay}
            </div>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-red-100 dark:shadow-none"
            >
              Bitir
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
            style={{ width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : "0%" }}
          />
        </div>
      </header>

      {/* Questions List */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-8 space-y-10">
        
        {/* Fənn sualları */}
        {fennQuestions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Fənn Sualları — {subject.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fennQuestions.length} sual (Hər sual 2 bal, səhv -0.5 bal)</p>
              </div>
            </div>
            <div className="space-y-5">
              {fennQuestions.map((q: any, idx: number) => (
                <QuestionCard
                  key={q.id}
                  index={idx}
                  question={q}
                  selectedOptionId={selectedAnswers[`fenn_${q.id}`]}
                  onSelect={(optId) => handleSelect("fenn", q.id, optId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tədris sualları */}
        {tedrisQuestions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Tədris Metodikası Sualları
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tedrisQuestions.length} sual (Hər sual 1 bal, səhv -0.25 bal)</p>
              </div>
            </div>
            <div className="space-y-5">
              {tedrisQuestions.map((q: any, idx: number) => (
                <QuestionCard
                  key={q.id}
                  index={fennQuestions.length + idx}
                  question={q}
                  selectedOptionId={selectedAnswers[`tedris_${q.id}`]}
                  onSelect={(optId) => handleSelect("tedris", q.id, optId)}
                />
              ))}
            </div>
          </section>
        )}

        {fennQuestions.length === 0 && tedrisQuestions.length === 0 && (
          <div className="text-center py-24">
            <p className="text-sm text-slate-400 dark:text-slate-600">Bu fənn üçün hələ sual əlavə edilməyib.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
              Ana səhifəyə qayıt
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
