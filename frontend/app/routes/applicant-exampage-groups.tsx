import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/applicant-exampage-groups";
import { sessionCookie, type UserSession } from "../lib/session";

const API_BASE = "http://backend:80";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İxtisas Qrupu Seçimi — İmtahanVer" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { exampageId } = params;
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const [exampageRes, groupsRes] = await Promise.all([
    fetch(`${API_BASE}/api/front/applicant-exampages`),
    fetch(`${API_BASE}/api/front/applicant-exampages/${exampageId}/groups`),
  ]);

  const [exampagesData, groupsData] = await Promise.all([
    exampageRes.json(),
    groupsRes.json(),
  ]);

  const exampage = exampagesData.success
    ? exampagesData.data.find((e: any) => e.id === Number(exampageId)) ?? null
    : null;

  const groups: any[] = groupsData.success ? groupsData.data : [];

  return { exampage, groups, exampageId };
}

export default function ApplicantExampageGroupsPage() {
  const { exampage, groups, exampageId } = useLoaderData<typeof loader>();

  if (!exampage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-red-500 font-semibold">Sınaq vərəqi tapılmadı.</p>
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
            to="/applicant-exampages"
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
            <span className="font-semibold text-slate-700 dark:text-slate-300">{exampage.title}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            İxtisas Qrupu Seçimi
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            İmtahan vermək istədiyiniz ixtisas qrupunu seçin.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600">
            <p className="text-sm">Bu vərəq üçün ixtisas qrupu tapılmadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/applicant-exampages/${exampageId}/groups/${group.id}/subjects`}
                className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <span className="text-lg font-bold">{group.title.split(' ')[0]}</span>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {group.title}
                </h4>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Bu qrupa daxil olan fənlər üzrə sınaq imtahanı.
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
