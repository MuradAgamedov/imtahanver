import { Link } from 'react-router';

const STATS = [
  { value: '50K+', label: 'İstifadəçi' },
  { value: '700+', label: 'Unikal test' },
  { value: '98%', label: 'Məmnuniyyət' },
] as const;

export function AuthPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/4 h-48 w-48 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-2xl"
      />

      {/* Logo */}
      <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M7 9h14M7 14h10M7 19h12"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-white">
          İmtahan<strong>Ver</strong>
        </span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 space-y-8">
        <blockquote>
          <p className="text-2xl font-semibold leading-snug text-white">
            "Azərbaycanın aparıcı rəqəmsal imtahan platformasında keyfiyyətli hazırlıq sizi uğura aparır."
          </p>
          <footer className="mt-4 text-sm text-indigo-200">
            MİQ, Abituriyent, Magistr və daha çox imtahan növü
          </footer>
        </blockquote>

        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-xs text-indigo-200">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
