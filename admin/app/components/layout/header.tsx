import { useLocation, Form } from "react-router";
import type { AdminSession } from "../../lib/session";

const ROUTE_TITLES: Record<string, string> = {
  "/": "İdarə paneli",
  "/users": "İstifadəçilər",
  "/user-categories": "Kateqoriyalar",
  "/exams": "İmtahanlar",
  "/questions": "Suallar",
  "/results": "Nəticələr",
  "/settings": "Ayarlar",
};

interface HeaderProps {
  session?: AdminSession | null;
}

export function Header({ session }: HeaderProps) {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] ?? "Admin Panel";

  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

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
