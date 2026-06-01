import { Link, redirect } from "react-router";
import type { Route } from "./+types/exams";
import { sessionCookie, type UserSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İmtahanlar — İmtahanVer" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");
  return null;
}

const EXAM_TYPES = [
  {
    key: "miq",
    href: "/miq-exampages",
    title: "MİQ İmtahanı",
    desc: "Müəllimlərin İşə Qəbulu imtahanı. Fənn proqramları, tədris metodikası və pedaqogika üzrə sınaqlar.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 3.866-4.03 7-9 7s-9-3.134-9-7a12.09 12.09 0 012.84-2.422L12 14z" />
      </svg>
    ),
    color: "from-indigo-500 to-violet-600",
    lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    badge: "Müəllim",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
    active: true,
  },
  {
    key: "abituryent",
    href: "/applicant-exampages",
    title: "Abituriyent İmtahanı",
    desc: "Ali məktəblərə qəbul üçün DİM standartlarına uyğun hazırlıq sınaqları.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badge: "DİM",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    active: true,

  },
  {
    key: "magistr",
    href: null,
    title: "Magistr İmtahanı",
    desc: "Magistraturaya qəbul imtahanına hazırlıq. Məntiq, ixtisas fənni və xarici dil sınaqları.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    badge: "Magistr",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    active: false,
  },
  {
    key: "buraxilis",
    href: null,
    title: "Buraxılış İmtahanı",
    desc: "11-ci sinif şagirdləri üçün dövlət buraxılış imtahanına hazırlıq sınaqları.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50 dark:bg-rose-950/30",
    textColor: "text-rose-600 dark:text-rose-400",
    badge: "11-ci sinif",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
    active: false,
  },
];

export default function ExamsPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-4">
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
          <h1 className="text-base font-bold text-slate-900 dark:text-white">İmtahan Növü Seçin</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Başlamaq istədiyiniz imtahan növünü seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXAM_TYPES.map((exam) => {
            const inner = (
              <>
                <div className={`h-1.5 w-full bg-gradient-to-r ${exam.color}`} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${exam.lightBg} ${exam.textColor}`}>
                      {exam.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${exam.badgeBg}`}>
                        {exam.badge}
                      </span>
                      {!exam.active && (
                        <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">Tezliklə</span>
                      )}
                    </div>
                  </div>
                  <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${exam.active ? "group-hover:text-indigo-600 dark:group-hover:text-indigo-400" : ""}`}>
                    {exam.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    {exam.desc}
                  </p>
                  {exam.active ? (
                    <div className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center bg-gradient-to-r ${exam.color} opacity-90 group-hover:opacity-100 shadow-sm hover:shadow-md transition-all`}>
                      Seç &rarr;
                    </div>
                  ) : (
                    <div className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-600">
                      Tezliklə
                    </div>
                  )}
                </div>
              </>
            );

            return exam.active && exam.href ? (
              <Link
                key={exam.key}
                to={exam.href}
                className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={exam.key}
                className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm opacity-60"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
