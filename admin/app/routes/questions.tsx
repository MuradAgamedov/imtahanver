import type { Route } from "./+types/questions";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Suallar — İmtahanVer Admin" }];
}

export default function QuestionsPage() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">Suallar modulu</p>
        <p className="mt-1 text-xs text-gray-400">Tezliklə hazır olacaq</p>
      </div>
    </div>
  );
}
