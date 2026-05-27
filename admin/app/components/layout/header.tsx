import { useLocation } from "react-router";

const ROUTE_TITLES: Record<string, string> = {
  "/": "İdarə paneli",
  "/users": "İstifadəçilər",
  "/exams": "İmtahanlar",
  "/questions": "Suallar",
  "/results": "Nəticələr",
  "/settings": "Ayarlar",
};

export function Header() {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] ?? "Admin Panel";

  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Bildirişlər"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

        {/* Date */}
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("az-AZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
