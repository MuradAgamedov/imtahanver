import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/exam-subjects";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({ data }: Route.MetaArgs) {
  const exampage = (data as any)?.exampage;
  return [
    { title: exampage ? `${exampage.title} — Fənn Seçimi` : "Fənn Seçimi — İmtahanVer" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { exampageId } = params;

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
  };

  const [exampagesRes, subjectsRes, sessionsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/miq-exampages`),
    fetch(`${API_BASE}/api/front/miq-exampages/${exampageId}/subjects`),
    fetch(`${API_BASE}/api/front/exam-sessions`, { headers: authHeaders }),
  ]);

  const [exampagesData, subjectsData, sessionsData] = await Promise.all([
    exampagesRes.json(),
    subjectsRes.json(),
    sessionsRes.json(),
  ]);

  const exampage = exampagesData.success
    ? (exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null)
    : null;

  const subjects: any[] = subjectsData.success
    ? subjectsData.data.map((d: any) => d.subject).filter(Boolean)
    : [];

  const sessions: any[] = sessionsData.success ? sessionsData.data : [];
  const existingSession = sessions.find(
    (s: any) => s.miq_exampage_id === Number(exampageId)
  ) ?? null;

  return { exampage, subjects, existingSession };
}

export default function ExamSubjectsPage() {
  const { exampage, subjects, existingSession } = useLoaderData<typeof loader>();

  if (!exampage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-sm">
          <p className="text-sm font-semibold text-red-500">İmtahan vərəqi tapılmadı.</p>
          <Link to="/" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  const resultsUrl = existingSession
    ? `/exam/${existingSession.miq_exampage_id}/${existingSession.miq_subject_id}?session_id=${existingSession.id}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>MİQ İmtahanı</span>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{exampage.title}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-10">

        {/* Already participated — locked state */}
        {existingSession ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-6 ${
              existingSession.status === "completed"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
            }`}>
              {existingSession.status === "completed" ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {existingSession.status === "completed"
                ? "Bu vərəqdə artıq iştirak etmisiniz"
                : "Bu vərəqdə aktiv imtahanınız var"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {existingSession.status === "completed"
                ? `Hər vərəqdə yalnız bir dəfə iştirak etmək mümkündür. Nəticələrinizə aşağıdan baxa bilərsiniz.`
                : "İmtahanınız hələ davam edir. Davam etmək üçün aşağıdakı düyməyə basın."}
            </p>

            {existingSession.status === "completed" && (
              <div className="mt-6 flex items-center gap-6 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Fənn</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {existingSession.subject?.title ?? "—"}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Nəticə</p>
                  <p className={`text-sm font-bold ${existingSession.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {existingSession.passed ? "Keçdi" : "Kəsildi"}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Bal</p>
                  <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {existingSession.score}
                  </p>
                </div>
              </div>
            )}

            <Link
              to={resultsUrl!}
              className="mt-8 inline-flex items-center gap-2 py-3 px-8 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
            >
              {existingSession.status === "completed" ? "Nəticəyə bax" : "Davam et"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Subject selection grid */
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Fənn Seçimi
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                İmtahana başlamaq üçün fənninizi seçin. Seçimdən sonra geri qayıtmaq mümkün olmayacaq.
              </p>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                <p className="text-sm">Bu vərəqə bağlı fənn tapılmadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="group flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                        {subject.title[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {subject.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Fənn imtahanı
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/exam/${exampage.id}/${subject.id}`}
                      className="flex-shrink-0 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-sm hover:shadow-md hover:opacity-90 transition-all"
                    >
                      Başla
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
