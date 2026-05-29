import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/miq-exampages";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({}: Route.MetaArgs) {
  return [{ title: "MİQ Vərəqləri — İmtahanVer" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
  };

  const [exampagesRes, sessionsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/miq-exampages`),
    fetch(`${API_BASE}/api/front/exam-sessions`, { headers: authHeaders }),
  ]);

  const [exampagesData, sessionsData] = await Promise.all([
    exampagesRes.json(),
    sessionsRes.json(),
  ]);

  const rawExampages: any[] = exampagesData.success ? exampagesData.data : [];

  const miqExampages = await Promise.all(
    rawExampages.map(async (ep: any) => {
      const subRes = await fetch(`${API_BASE}/api/front/miq-exampages/${ep.id}/subjects`);
      const subData = await subRes.json();
      const subjects = subData.success ? subData.data.map((d: any) => d.subject).filter(Boolean) : [];
      return { ...ep, subjects };
    })
  );

  const sessions: any[] = sessionsData.success ? sessionsData.data : [];
  const sessionByExampage: Record<number, any> = sessions.reduce((acc, s) => {
    if (!acc[s.miq_exampage_id]) acc[s.miq_exampage_id] = s;
    return acc;
  }, {});

  return { miqExampages, sessionByExampage };
}

export default function MiqExampagesPage() {
  const { miqExampages, sessionByExampage } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/exams"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Link to="/exams" className="hover:text-indigo-500 transition-colors">İmtahanlar</Link>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">MİQ İmtahanı</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Vərəq Seçimi
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            İmtahan vərəqini seçin.
          </p>
        </div>

        {miqExampages.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            <p className="text-sm">Vərəq tapılmadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {miqExampages.map((ep: any) => {
              const existingSession = sessionByExampage[ep.id];
              const isParticipated = !!existingSession;
              const href = isParticipated
                ? `/exam/${existingSession.miq_exampage_id}/${existingSession.miq_subject_id}?session_id=${existingSession.id}`
                : `/miq-exampages/${ep.id}/subjects`;

              return (
                <Link
                  key={ep.id}
                  to={href}
                  className={`group flex flex-col rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-300 ${
                    isParticipated
                      ? "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"
                      : "border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isParticipated
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      {isParticipated ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    {isParticipated ? (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        existingSession.status === "completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse"
                      }`}>
                        {existingSession.status === "completed" ? "Tamamlanıb" : "Davam edir"}
                      </span>
                    ) : (
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>

                  <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${
                    isParticipated
                      ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }`}>
                    {ep.title}
                  </h4>

                  {isParticipated ? (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Fənn: <span className="font-semibold text-slate-700 dark:text-slate-300">{existingSession.subject?.title ?? "—"}</span>
                      {existingSession.status === "completed" && (
                        <> · Bal: <span className="font-bold text-emerald-600 dark:text-emerald-400">{existingSession.score}</span></>
                      )}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {ep.subjects.length} fənn mövcuddur
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {isParticipated ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        existingSession.status === "completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                      }`}>
                        {existingSession.status === "completed" ? "Nəticəyə bax →" : "Davam et →"}
                      </span>
                    ) : (
                      <>
                        {ep.subjects.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {s.title}
                          </span>
                        ))}
                        {ep.subjects.length > 4 && (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                            +{ep.subjects.length - 4}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
