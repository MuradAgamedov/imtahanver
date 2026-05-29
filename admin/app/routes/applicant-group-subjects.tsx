import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/applicant-group-subjects";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({ data }: Route.MetaArgs) {
  const g = (data as any)?.group;
  return [{ title: g ? `Qrup ${g.title} — Fənlər` : "Fənlər — Admin" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id, groupId } = params;
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  const [epRes, groupRes] = await Promise.all([
    fetch(`http://backend:80/api/adminapi/applicant-exampages`, { headers }),
    fetch(`http://backend:80/api/adminapi/applicant-groups`, { headers }),
  ]);

  const [epData, groupData] = await Promise.all([epRes.json(), groupRes.json()]);

  const exampage = epData.success ? epData.data.find((e: any) => e.id === Number(id)) ?? null : null;
  const group = groupData.success ? groupData.data.find((g: any) => g.id === Number(groupId)) ?? null : null;

  return { exampage, group, exampageId: id, groupId };
}

export default function ApplicantGroupSubjectsPage() {
  const { exampage, group, exampageId, groupId } = useLoaderData<typeof loader>();

  if (!exampage || !group) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Məlumat tapılmadı.</p>
        <Link to="/applicant-exampages" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Geri qayıt</Link>
      </div>
    );
  }

  const subjects = group.subjects ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-3 flex-wrap bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <Link to="/applicant-exampages" className="text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors">Vərəqlər</Link>
        <span className="text-gray-300">/</span>
        <Link to={`/applicant-exampages/${exampageId}/groups`} className="text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors">
          {exampage.title}
        </Link>
        <span className="text-gray-300">/</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Qrup {group.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Fənni seçin</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
          <p className="text-sm text-gray-400 font-semibold">Bu qrupa fənn əlavə edilməyib.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject: any) => (
            <Link
              key={subject.id}
              to={`/applicant-exampages/${exampageId}/groups/${groupId}/subjects/${subject.id}/questions`}
              className="group flex items-center justify-between rounded-2xl border border-gray-150 bg-white p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex-shrink-0">
                  {subject.title[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{subject.title}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{subject.identify}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
