import type { Route } from "./+types/results";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nəticələr — İmtahanVer Admin" }];
}

export default function ResultsPage() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">Nəticələr modulu</p>
        <p className="mt-1 text-xs text-gray-400">Tezliklə hazır olacaq</p>
      </div>
    </div>
  );
}
