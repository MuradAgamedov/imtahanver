import { Link, useLoaderData, redirect } from "react-router";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({ data }: any) {
  const ep = (data as any)?.exampage;
  return [{ title: ep ? `${ep.title} — Fənlər` : "Fənlər — Admin" }];
}

export async function loader({ request, params }: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;
  if (!session || !session.token) return redirect("/login");

  const { id } = params;
  const headers = { Accept: "application/json", Authorization: `Bearer ${session.token}` };

  const [epRes, subjRes] = await Promise.all([
    fetch(`http://backend:80/api/adminapi/magistratura-exampages`, { headers }),
    fetch(`http://backend:80/api/adminapi/magistratura-exampages/${id}/subjects`, { headers }),
  ]);

  const [epData, subjData] = await Promise.all([epRes.json(), subjRes.json()]);

  const exampage = epData.success
    ? epData.data.find((e: any) => e.id === Number(id)) ?? null
    : null;

  return { exampage, subjects: subjData.success ? subjData.data : (exampage?.subjects ?? []) };
}

export default function MagistraturaExampageSubjectsPage() {
  const { exampage, subjects } = useLoaderData<any>();

  if (!exampage) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Vərəq tapılmadı.</p>
        <Link to="/magistratura-exampages" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">Geri qayıt</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-center justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/magistratura-exampages" className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Vərəqlər
          </Link>
          <span className="text-gray-300">/</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{exampage.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fənni seçin və sualları idarə edin</p>
          </div>
        </div>

        <Link
          to="/magistratura-exampages"
          className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Fənləri redaktə et
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="py-20 text-center bg-white border border-gray-150 rounded-2xl">
          <p className="text-sm text-gray-400 font-semibold">Bu vərəqə hələ fənn təyin edilməyib.</p>
          <Link to="/magistratura-exampages" className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline">
            Vərəqə qayıdıb fənləri seçin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject: any) => (
            <Link
              key={subject.id}
              to={`/magistratura-exampages/${exampage.id}/subjects/${subject.id}/questions`}
              className="group flex flex-col rounded-2xl border border-gray-150 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-base">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Suallar
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {subject.title}
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                {subject.identify === 'mentiq' ? '50 sual (45 qapalı, 5 açıq)' : '25 sual (20 qapalı, 5 açıq)'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
