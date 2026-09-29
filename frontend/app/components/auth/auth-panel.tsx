import { Link } from 'react-router';

const HIGHLIGHTS = [
  { value: '100%', label: 'Pulsuz' },
  { value: '16', label: 'Fənn üzrə suallar' },
  { value: 'MİQ', label: 'Rəsmi format' },
] as const;

function AuthIllustration() {
  return (
    <svg viewBox="0 0 240 220" className="h-auto w-full max-w-[300px]" aria-hidden="true">
      <circle cx="120" cy="110" r="105" className="fill-chalk/5" />

      {/* open book */}
      <path
        d="M30 92 Q78 78 118 92 L118 168 Q78 154 30 168 Z"
        className="fill-paper stroke-amber-brand"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M210 92 Q162 78 122 92 L122 168 Q162 154 210 168 Z"
        className="fill-paper stroke-amber-brand"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M46 104h56M46 120h56M46 136h44" className="stroke-ink-soft/40" strokeWidth="2" strokeLinecap="round" />
      <path d="M138 104h56M138 120h56M138 136h44" className="stroke-ink-soft/40" strokeWidth="2" strokeLinecap="round" />

      {/* graduation cap */}
      <path d="M120 26 L182 54 L120 82 L58 54 Z" className="fill-chalk" />
      <path d="M90 62 v22 q30 14 60 0 v-22" className="stroke-chalk" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M182 54 v28" className="stroke-chalk" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="182" cy="86" r="4" className="fill-amber-brand" />

      {/* sparkles */}
      <path d="M46 56 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" className="fill-amber-brand/70" />
      <path d="M196 130 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5z" className="fill-amber-brand/70" />
    </svg>
  );
}

export function AuthPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-board p-12">
      {/* Decorative texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Logo */}
      <Link to="/" className="relative z-10 flex items-center gap-1 w-fit font-serif-brand">
        <span className="text-lg font-bold text-chalk">İmtahan</span>
        <span className="text-lg font-bold text-amber-brand">Ver</span>
      </Link>

      {/* Illustration */}
      <div className="relative z-10 flex justify-center">
        <AuthIllustration />
      </div>

      {/* Main content */}
      <div className="relative z-10 space-y-8">
        <div>
          <p className="font-serif-brand text-2xl font-semibold leading-snug text-chalk">
            Sual-sual, mövzu-mövzu, imtahana hazır olun.
          </p>
          <p className="mt-4 text-sm text-chalk-soft">
            Fənn proqramları və Tədris metodikası üzrə real sınaq sualları ilə MİQ imtahanına hazırlaşın.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {HIGHLIGHTS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-md border border-chalk/15 bg-chalk/5 p-4"
            >
              <p className="font-serif-brand text-xl font-bold text-amber-brand">{value}</p>
              <p className="mt-0.5 text-xs text-chalk-soft">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
