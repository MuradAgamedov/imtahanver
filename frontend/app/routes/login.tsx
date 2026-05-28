import { useState } from 'react';
import { Form, Link, useNavigation, useActionData, redirect } from 'react-router';
import type { Route } from './+types/login';
import { AuthPanel } from '../components/auth/auth-panel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { sessionCookie } from '../lib/session';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Daxil ol — İmtahanVer' },
    { name: 'description', content: 'İmtahanVer hesabınıza daxil olun' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const session = await sessionCookie.parse(cookieHeader);

  if (session && session.token) {
    return redirect('/');
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await fetch('http://backend:80/api/front/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requires_verification) {
        return redirect(`/register?verify=true&email=${encodeURIComponent(email)}`);
      }
      return { error: data.message || 'Giriş uğursuz oldu.' };
    }

    // Success: serialize session and redirect to /
    const cookieHeader = await sessionCookie.serialize({
      token: data.token,
      user: data.user,
    });

    return redirect('/', {
      headers: {
        'Set-Cookie': cookieHeader,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Server ilə əlaqə qurulmadı. Zəhmət olmasa bir az sonra yenidən cəhd edin.' };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormErrors = {
  email?: string;
  password?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!email.trim()) {
    errors.email = 'Email ünvanı daxil edin';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Düzgün email ünvanı daxil edin';
  }

  if (!password) {
    errors.password = 'Şifrə daxil edin';
  } else if (password.length < 6) {
    errors.password = 'Şifrə ən az 6 simvol olmalıdır';
  }

  return errors;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
        clipRule="evenodd"
      />
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const actionData = useActionData() as { error?: string } | undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(email, password));
  }

  function handleSubmit(e: React.FormEvent) {
    const newErrors = validate(email, password);
    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      setTouched({ email: true, password: true });
    }
  }

  return (
    <div className="flex min-h-screen">
      <AuthPanel />

      {/* ── Form panel ── */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-10 flex lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M7 9h14M7 14h10M7 19h12"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="21" cy="19" r="3" fill="#fff" opacity=".9" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              İmtahan<strong>Ver</strong>
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Xoş gəldiniz</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Hesabınıza daxil olmaq üçün məlumatlarınızı daxil edin
            </p>
          </header>

          {actionData?.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-pulse">
              {actionData.error}
            </div>
          )}

          <Form method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email ünvanı"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ad@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              leftIcon={<EmailIcon />}
            />

            <Input
              label="Şifrə"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : undefined}
              leftIcon={<LockIcon />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-gray-300 accent-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Məni xatırla</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Şifrəni unutdunuz?
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
              Daxil ol
            </Button>
          </Form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Hesabınız yoxdur?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Qeydiyyat
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
