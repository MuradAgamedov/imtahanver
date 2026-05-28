import { useLocation, Form } from "react-router";
import type { AdminSession } from "../../lib/session";

const ROUTE_TITLES: Record<string, string> = {
  "/": "İdarə paneli",
  "/users": "İstifadəçilər",
  "/user-categories": "Kateqoriyalar",
  "/miq-subjects": "MİQ Fənləri",
  "/miq-exampages": "MİQ Vərəqləri",
  "/exams": "İmtahanlar",
  "/questions": "Suallar",
  "/results": "Nəticələr",
  "/settings": "Ayarlar",
};

interface HeaderProps {
  session?: AdminSession | null;
  onMenuClick?: () => void;
}

export function Header({ session, onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();
  let title = ROUTE_TITLES[pathname] ?? "Admin Panel";
  if (pathname.includes("/question-types")) {
    if (pathname.includes("/questions")) {
      title = "Sualları İdarə Et";
    } else if (pathname.includes("/subjects")) {
      title = "Fənn Proqramı Fənləri";
    } else {
      title = "Sual Növləri";
    }
  }

  return (
    <header className="fixed left-0 lg:left-60 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-655 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Menyu aç"
        >
          <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-sm lg:text-lg font-bold text-gray-900 truncate max-w-[180px] sm:max-w-xs">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Date */}
        <span className="text-sm text-gray-500 font-medium">
          {new Date().toLocaleDateString("az-AZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

        {/* Header Logout Button */}
        <Form method="post" action="/login">
          <input type="hidden" name="intent" value="logout" />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl border border-red-100 hover:border-red-200 bg-red-50/50 hover:bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-750 transition-all cursor-pointer shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıxış
          </button>
        </Form>
      </div>
    </header>
  );
}
