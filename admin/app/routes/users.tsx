import { useState } from "react";
import type { Route } from "./+types/users";
import { cn, formatDate, formatNumber } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İstifadəçilər — İmtahanVer Admin" }];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type UserStatus = "Aktiv" | "Bloklandı" | "Gözləmədə";

interface User {
  id: number;
  name: string;
  email: string;
  plan: "Pulsuz" | "Premium";
  status: UserStatus;
  tests: number;
  joined: string;
}

const USERS: User[] = [
  { id: 1, name: "Nigar Əliyeva", email: "nigar@example.com", plan: "Premium", status: "Aktiv", tests: 34, joined: "2025-09-12" },
  { id: 2, name: "Tural Məmmədov", email: "tural@example.com", plan: "Pulsuz", status: "Aktiv", tests: 12, joined: "2025-11-03" },
  { id: 3, name: "Sevinc Həsənova", email: "sevinc@example.com", plan: "Premium", status: "Aktiv", tests: 58, joined: "2025-08-20" },
  { id: 4, name: "Əli Rəhimov", email: "ali@example.com", plan: "Pulsuz", status: "Bloklandı", tests: 7, joined: "2026-01-15" },
  { id: 5, name: "Günay İsmayılova", email: "gunay@example.com", plan: "Pulsuz", status: "Gözləmədə", tests: 0, joined: "2026-05-27" },
  { id: 6, name: "Orxan Babayev", email: "orxan@example.com", plan: "Premium", status: "Aktiv", tests: 91, joined: "2025-07-08" },
  { id: 7, name: "Lala Mustafayeva", email: "lala@example.com", plan: "Pulsuz", status: "Aktiv", tests: 21, joined: "2026-02-19" },
  { id: 8, name: "Kamran Hüseynov", email: "kamran@example.com", plan: "Premium", status: "Aktiv", tests: 43, joined: "2025-10-30" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<UserStatus, string> = {
  Aktiv: "bg-green-100 text-green-700",
  Bloklandı: "bg-red-100 text-red-700",
  Gözləmədə: "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[status])}>
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Hamısı" | UserStatus>("Hamısı");

  const filtered = USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Hamısı" || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Ad və ya email axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["Hamısı", "Aktiv", "Bloklandı", "Gözləmədə"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">
        Cəmi <span className="font-semibold text-gray-900">{formatNumber(filtered.length)}</span> istifadəçi tapıldı
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Ad Soyad</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Testlər</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Qeydiyyat</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      user.plan === "Premium"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-600",
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-900">
                    {user.tests}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(user.joined)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Bax"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Redaktə et"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">Nəticə tapılmadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
