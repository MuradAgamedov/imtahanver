import { NavLink, Form } from "react-router";
import { cn } from "../../lib/utils";
import type { AdminSession } from "../../lib/session";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/users",
    label: "İstifadəçilər",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/admins",
    label: "Adminlər",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    to: "/user-categories",
    label: "Kateqoriyalar",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white",
  );
}

interface SidebarProps {
  session?: AdminSession | null;
}

export function Sidebar({ session }: SidebarProps) {
  const adminName = session?.admin?.name || "Admin";
  const initials = adminName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M7 9h14M7 14h10M7 19h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">İmtahanVer</p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Əsas naviqasiya">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={navLinkClass}>
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-slate-800 px-3 py-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {initials || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{adminName}</p>
            <p className="truncate text-xs text-slate-500">{session?.admin?.email || "admin@imtahanver.az"}</p>
          </div>
        </div>

        <Form method="post" action="/login">
          <input type="hidden" name="intent" value="logout" />
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıxış
          </button>
        </Form>
      </div>
    </aside>
  );
}
