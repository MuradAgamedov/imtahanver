import { Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/miq-question-types";
import { sessionCookie, type AdminSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sual Növləri — İmtahanVer Admin" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as AdminSession | null;

  if (!session || !session.token) {
    return redirect("/login");
  }

  const exampageId = params.id;

  try {
    const res = await fetch(`http://backend:80/api/adminapi/miq-exampages/${exampageId}/question-types`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    if (res.status === 401) {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 })
        }
      });
    }

    if (!res.ok) {
      throw new Error("Failed to fetch question types");
    }

    const data = await res.json();
    return { 
      exampage: data.exampage,
      questionTypes: data.data || [],
      session 
    };
  } catch (err) {
    console.error("Miq question types loader error:", err);
    return redirect("/miq-exampages");
  }
}

export default function MiqQuestionTypesPage() {
  const { exampage, questionTypes } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Back link & Header */}
      <div className="space-y-4">
        <Link 
          to="/miq-exampages" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          MİQ Vərəqlərinə Qayıt
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{exampage?.title || "Vərəq"} — Sual Növləri</h2>
            <p className="text-xs text-gray-500 mt-1">Bu imtahan vərəqi üçün təyin edilmiş sual növlərinin siyahısı. Bu növlər sistem tərəfindən avtomatik idarə olunur.</p>
          </div>
        </div>
      </div>

      {/* Grid of Question Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questionTypes.map((qt: any, index: number) => (
          <div key={qt.id} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-600 mb-2">
                  Tip #{index + 1}
                </span>
                <h3 className="text-base font-bold text-gray-900">{qt.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Eyniləşdirici: {qt.identify}</p>
              </div>

              <div className="bg-indigo-50/70 p-2.5 rounded-xl text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Növ Statusu: Aktiv</span>
              <span className="text-indigo-600 font-semibold">Sistem tərəfindən idarə olunur</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
