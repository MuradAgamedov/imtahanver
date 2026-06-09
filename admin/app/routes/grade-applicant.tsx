import { useState } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/grade-applicant";
import { sessionCookie, type AdminSession } from "../lib/session";
import { cn } from "../lib/utils";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export function meta({}: Route.MetaArgs) {
  return [{ title: "Yazılı Cavabları Qiymətləndir — İmtahanVer Admin" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id } = params;
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  try {
    const res = await fetch(`http://backend:80/api/adminapi/exam-results/${id}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return redirect("/login", {
          headers: {
            "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }),
          },
        });
      }
      throw new Error("Sessiya məlumatları tapılmadı.");
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Xəta baş verdi.");
    }

    return {
      sessionData: data.session,
      questions: data.questions || [],
      token: session.token,
    };
  } catch (err: any) {
    console.error("Grade loader error:", err);
    return redirect("/results");
  }
}

export default function GradeApplicantPage() {
  const { sessionData, questions, token } = useLoaderData<typeof loader>();
  const [examSession, setExamSession] = useState<any>(sessionData);
  const [activeSubjectId, setActiveSubjectId] = useState<number>(
    examSession.applicant_group?.subjects?.[0]?.id || 0
  );
  const [gradingQuestionId, setGradingQuestionId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGrade = async (questionId: number, isCorrect: boolean) => {
    setGradingQuestionId(questionId);
    try {
      const isProd = typeof window !== "undefined" && window.location.hostname.endsWith("imtahanver.online");
      const apiBase = isProd ? "https://api.imtahanver.online" : "http://localhost:8000";

      const res = await fetch(`${apiBase}/api/adminapi/exam-results/${examSession.id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicant_question_id: questionId,
          is_correct: isCorrect,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setExamSession(data.session);
        showToast("Qiymət uğurla yadda saxlanıldı!");
      } else {
        showToast(data.message || "Qiymət yadda saxlanılarkən xəta baş verdi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("İnternet və ya server xətası baş verdi.", "error");
    } finally {
      setGradingQuestionId(null);
    }
  };

  const subjects = examSession.applicant_group?.subjects || [];
  const activeSubject = subjects.find((s: any) => s.id === activeSubjectId) || subjects[0];
  const filteredQuestions = questions.filter(
    (q: any) => q.applicant_subject_id === activeSubject?.id
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border shadow-xl animate-in fade-in slide-in-from-bottom-5 text-sm font-semibold text-white",
          toast.type === "success" ? "bg-slate-900 border-slate-800" : "bg-red-650 border-red-700"
        )}>
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/results"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-650 hover:border-indigo-150 transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider block uppercase leading-none mb-1">
                Abituriyent İmtahanının Yoxlanılması
              </span>
              <h2 className="text-lg font-bold text-gray-900 leading-none">
                {examSession.user?.first_name} {examSession.user?.last_name}
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-10">
            Email: <span className="font-semibold">{examSession.user?.email}</span> · 
            İmtahan: <span className="font-semibold">{examSession.applicant_exampage?.title}</span> · 
            Qrup: <span className="font-semibold">{examSession.applicant_group?.title}</span>
          </p>
        </div>

        {/* Global Total Score Box */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 sm:self-center">
          <div>
            <span className="text-[10px] font-bold text-emerald-650 uppercase tracking-wider block">Yekun Bal</span>
            <span className="text-2xl font-black text-emerald-800 leading-none">{examSession.score} <span className="text-sm font-semibold text-emerald-650">/ 400</span></span>
          </div>
        </div>
      </div>

      {/* Navigation and Questions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Subject tabs and relative weights */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">
              Fənlər
            </h3>
            {subjects.map((subj: any) => {
              const breakdown = examSession.applicant_breakdown?.find(
                (b: any) => b.subject_id === subj.id
              );
              const isActive = subj.id === activeSubjectId;
              const ungradedCount = breakdown?.written_ungraded || 0;

              return (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubjectId(subj.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer relative overflow-hidden",
                    isActive
                      ? "bg-indigo-650 border-indigo-650 text-white shadow-md shadow-indigo-100"
                      : "bg-white border-gray-150 hover:bg-slate-50 text-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{subj.title}</span>
                    {ungradedCount > 0 && (
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full",
                        isActive ? "bg-white text-indigo-650" : "bg-red-500 text-white"
                      )}>
                        {ungradedCount} yoxla
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] w-full opacity-80 mt-1">
                    <span>Əmsal: {breakdown?.weight || 1.0}</span>
                    <span className="font-extrabold">{breakdown?.subject_score || 0} / 100 Bal</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions list for active subject */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-750 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              {activeSubject?.title} fənni üzrə suallar ({filteredQuestions.length})
            </h3>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-400">Bu fənn üzrə sual tapılmadı.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((q: any, idx: number) => {
                const isClosed = q.question_type === 1;
                const isCodeable = q.question_type === 2;
                const isWritten = q.question_type === 3;

                // Retrieve answers
                let answerObj: any = null;
                let isAnswered = false;

                if (isClosed) {
                  answerObj = examSession.answers?.find((a: any) => a.applicant_question_id === q.id);
                  isAnswered = !!answerObj?.applicant_question_option_id;
                } else {
                  answerObj = examSession.applicant_written_answers?.find(
                    (a: any) => a.applicant_question_id === q.id
                  );
                  isAnswered = !!answerObj?.written_answer;
                }

                const points = parseFloat(answerObj?.points || 0);

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-150 text-slate-700 text-xs font-extrabold">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                          {isClosed ? "Qapalı" : isCodeable ? "Kodlaşdırıla bilən" : "Yazılı Açıq"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAnswered ? (
                          <span className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border",
                            points > 0 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : points < 0 
                                ? "bg-red-50 text-red-700 border-red-100" 
                                : "bg-gray-50 text-gray-650 border-gray-150"
                          )}>
                            Cavablandırılıb: {points >= 0 ? `+${points}` : points} Bal
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-gray-50 text-gray-400 px-2 py-0.5 text-[10px] font-bold border border-gray-150">
                            Boş buraxılıb
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-4 mb-5">
                      <div 
                        className="text-sm text-gray-800 font-medium leading-relaxed" 
                        dangerouslySetInnerHTML={{ __html: q.title || "" }}
                      />
                      
                      {q.image && (
                        <div className="max-w-md border border-gray-100 rounded-xl overflow-hidden bg-slate-50">
                          <img
                            src={q.image.startsWith("http") ? q.image : `http://localhost:8000/${q.image.replace(/^\/+/, "")}`}
                            alt=""
                            className="max-h-60 object-contain w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* Options / Student Answer Area */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                      {isClosed ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Seçimlər</p>
                          {q.options?.map((opt: any, oIdx: number) => {
                            const isCorrectOpt = !!opt.is_true;
                            const isSelected = answerObj?.applicant_question_option_id === opt.id;
                            
                            return (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-center gap-2.5 px-4.5 py-3 rounded-xl border text-xs leading-normal",
                                  isCorrectOpt
                                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold"
                                    : isSelected
                                      ? "bg-red-50/70 border-red-200 text-red-800"
                                      : "bg-white border-gray-150 text-gray-750"
                                )}
                              >
                                <span className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border",
                                  isCorrectOpt
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isSelected
                                      ? "bg-red-500 border-red-500 text-white"
                                      : "border-gray-300 text-gray-500"
                                )}>
                                  {OPTION_LABELS[oIdx] || oIdx + 1}
                                </span>
                                <div dangerouslySetInnerHTML={{ __html: opt.text }} />
                                {isSelected && <span className="ml-auto text-[9px] font-black uppercase text-red-650">Tələbənin seçimi</span>}
                                {isCorrectOpt && !isSelected && <span className="ml-auto text-[9px] font-black uppercase text-emerald-650">Düzgün Cavab</span>}
                                {isCorrectOpt && isSelected && <span className="ml-auto text-[9px] font-black uppercase text-emerald-650">Tələbə Düzgün Tapıb</span>}
                              </div>
                            );
                          })}
                        </div>
                      ) : isCodeable ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Tələbənin Cavabı:</span>
                              <strong className={cn(
                                "text-sm",
                                points > 0 ? "text-emerald-600" : "text-red-500"
                              )}>
                                {answerObj?.written_answer || "—"}
                              </strong>
                            </div>
                            <div className="text-right sm:text-right">
                              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Düzgün Cavab:</span>
                              <strong className="text-sm text-gray-800">
                                {q.options?.find((o: any) => o.is_true)?.text || "Təyin edilməyib"}
                              </strong>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 italic">
                            * Kodlaşdırıla bilən açıq suallar sistem tərəfindən avtomatik yoxlanılır.
                          </p>
                        </div>
                      ) : (
                        // Type 3: Written Open question
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Tələbənin Cavabı:</span>
                            <div className="bg-white border border-gray-150 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap font-medium">
                              {answerObj?.written_answer || <span className="text-gray-300 italic">Tələbə bu suala heç bir cavab yazmayıb.</span>}
                            </div>
                          </div>

                          {/* Grading controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-500">Qiymət:</span>
                              {answerObj?.is_correct === true ? (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-150">
                                  Düzgün (+2 Bal)
                                </span>
                              ) : answerObj?.is_correct === false ? (
                                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-150">
                                  Səhv (0 Bal)
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-150 animate-pulse">
                                  Yoxlanılmayıb
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={gradingQuestionId === q.id || !isAnswered}
                                onClick={() => handleGrade(q.id, false)}
                                className={cn(
                                  "px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all disabled:opacity-50",
                                  answerObj?.is_correct === false
                                    ? "bg-rose-50 border-rose-200 text-rose-700"
                                    : "bg-white border-gray-250 text-gray-700 hover:bg-slate-50"
                                )}
                              >
                                Səhv İşarələ (0 Bal)
                              </button>
                              
                              <button
                                type="button"
                                disabled={gradingQuestionId === q.id || !isAnswered}
                                onClick={() => handleGrade(q.id, true)}
                                className={cn(
                                  "px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all disabled:opacity-50",
                                  answerObj?.is_correct === true
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-emerald-600 border-transparent text-white hover:bg-emerald-700 shadow-sm"
                                )}
                              >
                                {gradingQuestionId === q.id ? "Yadda saxlanılır..." : "Düzgün İşarələ (+2 Bal)"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
