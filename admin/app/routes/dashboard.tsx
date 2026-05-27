import type { Route } from "./+types/dashboard";
import { formatNumber } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İdarə paneli — İmtahanVer Admin" }];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Cəmi istifadəçi",
    value: 50_234,
    delta: "+1.2K bu həftə",
    positive: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Aktiv imtahanlar",
    value: 742,
    delta: "+23 bu ay",
    positive: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Bu gün keçilən test",
    value: 1_283,
    delta: "+8.4% dünənə nisbət",
    positive: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Orta nəticə",
    value: 72.4,
    delta: "-1.2% keçən həftəyə nisbət",
    positive: false,
    suffix: "%",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: "bg-orange-50 text-orange-600",
  },
];

const RECENT_SESSIONS = [
  { user: "Nigar Əliyeva", exam: "MİQ İmtahanı", score: 88, date: "28.05.2026", status: "Keçdi" },
  { user: "Tural Məmmədov", exam: "Abituriyent — Riyaziyyat", score: 61, date: "28.05.2026", status: "Kəsildi" },
  { user: "Sevinc Həsənova", exam: "Magistr — İngilis dili", score: 94, date: "27.05.2026", status: "Keçdi" },
  { user: "Əli Rəhimov", exam: "Buraxılış — Azərbaycan dili", score: 75, date: "27.05.2026", status: "Keçdi" },
  { user: "Günay İsmayılova", exam: "Müəllim İşə Qəbulu", score: 55, date: "27.05.2026", status: "Kəsildi" },
  { user: "Orxan Babayev", exam: "MİQ İmtahanı", score: 82, date: "26.05.2026", status: "Keçdi" },
];

const POPULAR_EXAMS = [
  { name: "Abituriyent — Riyaziyyat", sessions: 12_340, passRate: 68 },
  { name: "MİQ İmtahanı", sessions: 8_921, passRate: 74 },
  { name: "Müəllim İşə Qəbulu", sessions: 6_450, passRate: 61 },
  { name: "Magistr — İngilis dili", sessions: 4_230, passRate: 82 },
  { name: "Buraxılış — Azərbaycan dili", sessions: 3_870, passRate: 79 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  positive,
  suffix,
  icon,
  color,
}: (typeof STATS)[number]) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {typeof value === "number" && !suffix
              ? formatNumber(value)
              : value}
            {suffix}
          </p>
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
      </div>
      <p
        className={`mt-3 flex items-center gap-1 text-xs font-medium ${
          positive ? "text-green-600" : "text-red-500"
        }`}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          {positive ? (
            <path d="M8 3l4 5H4l4-5z" />
          ) : (
            <path d="M8 13l4-5H4l4 5z" />
          )}
        </svg>
        {delta}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const passed = status === "Keçdi";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        passed
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent sessions */}
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Son test sessiyaları</h2>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Hamısına bax
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">İstifadəçi</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">İmtahan</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Nəticə</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Tarix</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_SESSIONS.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.user}</td>
                    <td className="px-5 py-3.5 text-gray-500">{s.exam}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{s.score}%</td>
                    <td className="px-5 py-3.5 text-gray-500">{s.date}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular exams */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Populyar imtahanlar</h2>
          </div>
          <ul className="divide-y divide-gray-50 px-5">
            {POPULAR_EXAMS.map((exam) => (
              <li key={exam.name} className="py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 leading-tight">{exam.name}</p>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-gray-900">
                    {exam.passRate}%
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${exam.passRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatNumber(exam.sessions)} sessiya
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
