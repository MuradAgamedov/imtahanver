import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/applicant-group-subjects";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Fənn Seçimi — İmtahanVer" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { exampageId, groupId } = params;
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    Accept: "application/json",
  };

  const [exampagesRes, groupsRes, subjectsRes, sessionsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/applicant-exampages`),
    fetch(`${API_BASE}/api/front/applicant-exampages/${exampageId}/groups`),
    fetch(`${API_BASE}/api/front/applicant-exampages/${exampageId}/groups/${groupId}/subjects`),
    fetch(`${API_BASE}/api/front/exam-sessions`, { headers: authHeaders }),
  ]);

  const [exampagesData, groupsData, subjectsData, sessionsData] = await Promise.all([
    exampagesRes.json(),
    groupsRes.json(),
    subjectsRes.json(),
    sessionsRes.json(),
  ]);

  const exampage = exampagesData.success
    ? exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null
    : null;

  const group = groupsData.success
    ? groupsData.data.find((g: any) => g.id === Number(groupId)) ?? null
    : null;

  const subjects: any[] = subjectsData.success ? subjectsData.data : [];
  const sessions: any[] = sessionsData.success ? sessionsData.data : [];

  // Find sessions corresponding to this page & group
  const groupSessions = sessions.filter(
    (s) =>
      s.applicant_exampage_id === Number(exampageId) &&
      s.applicant_group_id === Number(groupId)
  );

  const sessionBySubject: Record<number, any> = groupSessions.reduce((acc, s) => {
    acc[s.applicant_subject_id] = s;
    return acc;
  }, {});

  return { exampage, group, subjects, sessionBySubject, exampageId, groupId };
}

export default function ApplicantGroupSubjectsPage() {
  const { exampage, group, subjects, sessionBySubject, exampageId, groupId } = useLoaderData<typeof loader>();

  if (!exampage || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-red-500 font-semibold">Məlumat tapılmadı.</p>
          <Link to="/applicant-exampages" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Geri qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to={`/applicant-exampages/${exampageId}/groups`}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Link to="/exams" className="hover:text-emerald-500 transition-colors">İmtahanlar</Link>
            <span>›</span>
            <Link to="/applicant-exampages" className="hover:text-emerald-500 transition-colors">Abituriyent</Link>
            <span>›</span>
            <Link to={`/applicant-exampages/${exampageId}/groups`} className="hover:text-emerald-500 transition-colors">{exampage.title}</Link>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{group.title}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Fənn Seçimi
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sınağa başlamaq istədiyiniz fənni seçin.
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            <p className="text-sm">Fənn tapılmadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const session = sessionBySubject[subject.id];
              const isParticipated = !!session;
              const isCompleted = session?.status === "completed";
              
              const href = isParticipated
                ? `/exam/applicant/${exampageId}/${groupId}/${subject.id}?session_id=${session.id}`
                : `/exam/applicant/${exampageId}/${groupId}/${subject.id}`;

              return (
                <Link
                  key={subject.id}
                  to={href}
                  className={`group flex flex-col rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-300 ${
                    isParticipated
                      ? isCompleted
                        ? "border-slate-200 dark:border-slate-750 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"
                        : "border-slate-200 dark:border-slate-750 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg"
                      : "border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isCompleted
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : isParticipated
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                      )}
                    </div>

                    {isParticipated && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse"
                      }`}>
                        {isCompleted ? "Tamamlanıb" : "Davam edir"}
                      </span>
                    )}
                  </div>

                  <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400`}>
                    {subject.title}
                  </h4>

                  {isCompleted ? (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Nəticə balı: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{session.score}</strong>
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Sınaq imtahanına başla
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isCompleted
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : isParticipated
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {isCompleted ? "Nəticəyə bax →" : isParticipated ? "Davam et →" : "Başla →"}
                    </span>
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
