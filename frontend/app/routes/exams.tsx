import { Link, Form, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/exams";
import { sessionCookie, type UserSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İmtahanlar — İmtahanVer" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");
  return { userProfile: session.user };
}

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) as UserSession | null;
  if (!session || !session.token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "logout") {
    const clearCookie = await sessionCookie.serialize("", { maxAge: 0 });
    return redirect("/login", { headers: { "Set-Cookie": clearCookie } });
  }

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
    color: "bg-amber-brand",
    ctaText: "text-white",
    lightBg: "bg-amber-brand/10",
    textColor: "text-amber-brand-deep",
    badge: "Müəllim",
    badgeBg: "bg-amber-brand/15 text-amber-brand-deep",
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
    color: "bg-emerald-600",
    ctaText: "text-white",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-600",
    badge: "DİM",
    badgeBg: "bg-emerald-100 text-emerald-700",
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
    color: "bg-orange-600",
    ctaText: "text-white",
    lightBg: "bg-orange-50",
    textColor: "text-orange-600",
    badge: "Magistr",
    badgeBg: "bg-orange-100 text-orange-700",
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
    color: "bg-rose-600",
    ctaText: "text-white",
    lightBg: "bg-rose-50",
    textColor: "text-rose-600",
    badge: "11-ci sinif",
    badgeBg: "bg-rose-100 text-rose-700",
    active: false,
  },
];

export default function ExamsPage() {
  const { userProfile } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-16">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-paper/80 border-b border-ink/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:h-16 sm:py-0 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 font-serif-brand">
              <span className="text-lg font-bold text-ink">İmtahan</span>
              <span className="text-lg font-bold text-amber-brand-deep">Ver</span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 bg-amber-brand/10 text-amber-brand-deep rounded-full ml-1">Portal</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-ink">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
              <span className="text-xs text-ink-soft">
                {userProfile?.email}
              </span>
            </div>

            <div className="h-9 w-9 rounded-full bg-board text-chalk flex items-center justify-center font-bold text-sm shadow shrink-0">
              {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
            </div>

            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/55 transition-all cursor-pointer"
              >
                Çıxış
              </button>
            </Form>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 bg-paper-2 p-1 rounded-xl w-full sm:w-auto overflow-x-auto order-3 sm:order-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/"
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 text-ink-soft hover:text-ink"
            >
              İmtahan Portalı
            </Link>
            <Link
              to="/exams"
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 bg-paper shadow-sm text-amber-brand-deep"
            >
              İmtahanlar
            </Link>
            <Link
              to="/settings"
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 text-ink-soft hover:text-ink"
            >
              Hesab Tənzimləmələri
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">İmtahan Növü Seçin</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Başlamaq istədiyiniz imtahan növünü seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXAM_TYPES.map((exam) => {
            const inner = (
              <>
                <div className={`h-1.5 w-full ${exam.color}`} />
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
                        <span className="text-xs text-ink-soft/70 font-medium">Tezliklə</span>
                      )}
                    </div>
                  </div>
                  <h4 className={`text-base font-bold text-ink transition-colors ${exam.active ? "group-hover:text-amber-brand-deep " : ""}`}>
                    {exam.title}
                  </h4>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">
                    {exam.desc}
                  </p>
                  {exam.active ? (
                    <div className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center ${exam.color} ${exam.ctaText} opacity-90 group-hover:opacity-100 shadow-sm hover:shadow-md transition-all`}>
                      Seç &rarr;
                    </div>
                  ) : (
                    <div className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center text-ink-soft/70 bg-paper-2">
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
                className="group relative flex flex-col rounded-2xl border border-ink/10 bg-paper overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={exam.key}
                className="group relative flex flex-col rounded-2xl border border-ink/10 bg-paper overflow-hidden shadow-sm opacity-60"
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
