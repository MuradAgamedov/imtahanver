import { useState } from "react";
import type { Route } from "./+types/exams";
import { cn, formatNumber } from "../lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "İmtahanlar — İmtahanVer Admin" }];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type Category = "MİQ" | "Müəllim İşə Qəbulu" | "Abituriyent" | "Buraxılış" | "Magistr";
type ExamStatus = "Aktiv" | "Qaralama" | "Arxiv";

interface Exam {
  id: number;
  name: string;
  category: Category;
  subject: string;
  questions: number;
  duration: number;
  sessions: number;
  passRate: number;
  status: ExamStatus;
}

const EXAMS: Exam[] = [
  { id: 1, name: "MİQ — Ümumi hazırlıq I", category: "MİQ", subject: "Ümumi", questions: 80, duration: 90, sessions: 4_230, passRate: 74, status: "Aktiv" },
  { id: 2, name: "Abituriyent — Riyaziyyat tam kurs", category: "Abituriyent", subject: "Riyaziyyat", questions: 120, duration: 180, sessions: 12_340, passRate: 68, status: "Aktiv" },
  { id: 3, name: "Müəllim — Pedaqogika I", category: "Müəllim İşə Qəbulu", subject: "Pedaqogika", questions: 60, duration: 75, sessions: 2_100, passRate: 61, status: "Aktiv" },
  { id: 4, name: "Magistr — İngilis dili B2", category: "Magistr", subject: "İngilis dili", questions: 100, duration: 120, sessions: 4_230, passRate: 82, status: "Aktiv" },
  { id: 5, name: "Buraxılış IX — Azərbaycan dili", category: "Buraxılış", subject: "Azərbaycan dili", questions: 50, duration: 60, sessions: 3_870, passRate: 79, status: "Aktiv" },
  { id: 6, name: "MİQ — Psixologiya sınaq testi", category: "MİQ", subject: "Psixologiya", questions: 40, duration: 45, sessions: 890, passRate: 0, status: "Qaralama" },
  { id: 7, name: "Abituriyent — Fizika 2023", category: "Abituriyent", subject: "Fizika", questions: 80, duration: 90, sessions: 1_240, passRate: 59, status: "Arxiv" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ExamStatus, string> = {
  Aktiv: "bg-green-100 text-green-700",
  Qaralama: "bg-yellow-100 text-yellow-700",
  Arxiv: "bg-gray-100 text-gray-500",
};

const CATEGORY_STYLE: Record<Category, string> = {
  "MİQ": "bg-blue-100 text-blue-700",
  "Müəllim İşə Qəbulu": "bg-teal-100 text-teal-700",
  "Abituriyent": "bg-violet-100 text-violet-700",
  "Buraxılış": "bg-orange-100 text-orange-700",
  "Magistr": "bg-pink-100 text-pink-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Hamısı" | ExamStatus>("Hamısı");

  const filtered = EXAMS.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "Hamısı" || e.status === status;
    return matchSearch && matchStatus;
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
            placeholder="İmtahan axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["Hamısı", "Aktiv", "Qaralama", "Arxiv"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                status === f
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              {f}
            </button>
          ))}

          <button
            type="button"
            className="ml-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni imtahan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">İmtahan adı</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Kateqoriya</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Suallar</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Müddət</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Sessiya</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Keçmə %</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{exam.name}</p>
                    <p className="text-xs text-gray-400">{exam.subject}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      CATEGORY_STYLE[exam.category],
                    )}>
                      {exam.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-900">{exam.questions}</td>
                  <td className="px-5 py-4 text-right text-gray-500">{exam.duration} dəq</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900">
                    {formatNumber(exam.sessions)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {exam.status === "Qaralama" ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className={cn(
                        "font-semibold",
                        exam.passRate >= 75 ? "text-green-600" : exam.passRate >= 60 ? "text-yellow-600" : "text-red-500",
                      )}>
                        {exam.passRate}%
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLE[exam.status],
                    )}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Redaktə et">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button type="button" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Sil">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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
