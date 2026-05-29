import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/applicant-exampage-groups";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({ data }: Route.MetaArgs) {
  const ep = (data as any)?.exampage;
  return [{ title: ep ? `${ep.title} — Qruplar` : "Qruplar — Admin" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id } = params;
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  const epRes = await fetch("http://backend:80/api/adminapi/applicant-exampages", { headers });
  const epData = await epRes.json();

  const exampage = epData.success
    ? epData.data.find((e: any) => e.id === Number(id)) ?? null
    : null;

  // groups are eagerly loaded with the exampage via with('groups')
  return { exampage, groups: exampage?.groups ?? [] };
}

export default function ApplicantExampageGroupsPage() {
  const { exampage, groups } = useLoaderData<typeof loader>();

  if (!exampage) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Vərəq tapılmadı.</p>
        <Link to="/applicant-exampages" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Geri qayıt</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-4 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <Link to="/applicant-exampages" className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Vərəqlər
        </Link>
        <span className="text-gray-300">/</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{exampage.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Qrupları seçin</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
          <p className="text-sm text-gray-400 font-semibold">Bu vərəqə hələ qrup təyin edilməyib.</p>
          <Link to="/applicant-exampages" className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Vərəqə qayıdıb qrup əlavə et
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group: any) => (
            <Link
              key={group.id}
              to={`/applicant-exampages/${exampage.id}/groups/${group.id}/subjects`}
              className="group flex flex-col rounded-2xl border border-gray-150 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-base">
                  {group.title}
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Qrup {group.title}
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(group.subjects ?? []).slice(0, 4).map((s: any) => (
                  <span key={s.id} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {s.title}
                  </span>
                ))}
                {(group.subjects ?? []).length > 4 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    +{group.subjects.length - 4}
                  </span>
                )}
                {(group.subjects ?? []).length === 0 && (
                  <span className="text-xs text-gray-400 italic">Fənn yoxdur</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
