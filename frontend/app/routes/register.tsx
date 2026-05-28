import { useState } from 'react';
import { Form, Link, useNavigation, useSearchParams, useActionData, redirect } from 'react-router';
import type { Route } from './+types/register';
import { AuthPanel } from '../components/auth/auth-panel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { sessionCookie } from '../lib/session';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Qeydiyyat — İmtahanVer' },
    { name: 'description', content: 'İmtahanVer-ə pulsuz qeydiyyatdan keçin' },
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
  const intent = formData.get('intent') as string;

  if (intent === 'verify-otp') {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    try {
      const response = await fetch('http://backend:80/api/front/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return { error: resData.message || 'OTP təsdiqləmə xətası.' };
      }

      // Success! Log user in by setting session cookie
      const cookieHeader = await sessionCookie.serialize({
        token: resData.token,
        user: resData.user,
      });

      return redirect('/', {
        headers: {
          'Set-Cookie': cookieHeader,
        },
      });
    } catch (e) {
      console.error(e);
      return { error: 'Server ilə əlaqə xətası.' };
    }
  } else {
    // Normal registration
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('http://backend:80/api/front/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return { error: resData.message || 'Qeydiyyat zamanı xəta baş verdi.' };
      }

      // Redirect to OTP verification mode
      return redirect(
        `/register?verify=true&email=${encodeURIComponent(email)}`
      );
    } catch (e) {
      console.error(e);
      return { error: 'Server ilə əlaqə xətası.' };
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'Ad daxil edin';
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'Ad ən az 2 simvol olmalıdır';
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Soyad daxil edin';
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Soyad ən az 2 simvol olmalıdır';
  }

  if (!form.email.trim()) {
    errors.email = 'Email ünvanı daxil edin';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Düzgün email ünvanı daxil edin';
  }

  if (!form.password) {
    errors.password = 'Şifrə daxil edin';
  } else if (form.password.length < 8) {
    errors.password = 'Şifrə ən az 8 simvol olmalıdır';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Şifrəni təsdiqləyin';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Şifrələr uyğun gəlmir';
  }

  if (!form.terms) {
    errors.terms = 'İstifadə şərtlərini qəbul etməlisiniz';
  }

  return errors;
}

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  level: StrengthLevel;
  label: string;
} {
  if (!password) return { level: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = Math.min(4, score) as StrengthLevel;
  const labels: Record<StrengthLevel, string> = {
    0: '',
    1: 'Çox zəif',
    2: 'Zəif',
    3: 'Orta',
    4: 'Güclü',
  };
  return { level, label: labels[level] };
}

const strengthBarColor: Record<StrengthLevel, string> = {
  0: 'bg-gray-200',
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-500',
};

const strengthLabelColor: Record<StrengthLevel, string> = {
  0: '',
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-yellow-600',
  4: 'text-green-600',
};

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

const INITIAL_FORM: RegisterForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

export default function RegisterPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const actionData = useActionData() as { error?: string } | undefined;
  const [searchParams] = useSearchParams();

  const verify = searchParams.get('verify') === 'true';
  const emailParam = searchParams.get('email') || '';
  const otpDemo = searchParams.get('otp_demo') || '';

  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterForm, boolean>>>({});

  const strength = getPasswordStrength(form.password);

  function update<K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field: keyof RegisterForm) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  }

  function handleSubmit(e: React.FormEvent) {
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        confirmPassword: true,
        terms: true,
      });
    }
  }

  if (verify) {
    return (
      <div className="flex min-h-screen">
        <AuthPanel />

        <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          {/* Mobile logo */}
          <div className="mb-8 flex lg:hidden">
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
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Emaili təsdiqləyin</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                <strong>{emailParam}</strong> ünvanına 6 rəqəmli OTP təsdiqləmə kodu göndərildi.
              </p>
            </header>



            {actionData?.error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="verify-otp" />
              <input type="hidden" name="email" value={emailParam} />
              
              <Input
                label="OTP Kodu"
                type="text"
                name="otp"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />

              <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
                Təsdiqlə və Daxil ol
              </Button>
            </Form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Kodu almadınız?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Yenidən qeydiyyatdan keçin
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AuthPanel />

      {/* ── Form panel ── */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 flex lg:hidden">
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
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Hesab yaradın</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Pulsuz başlamaq üçün məlumatlarınızı daxil edin
            </p>
          </header>

          {actionData?.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {actionData.error}
            </div>
          )}

          <Form method="post" onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Ad + Soyad */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ad"
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="Adınız"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                error={touched.firstName ? errors.firstName : undefined}
              />
              <Input
                label="Soyad"
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Soyadınız"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                error={touched.lastName ? errors.lastName : undefined}
              />
            </div>

            <Input
              label="Email ünvanı"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ad@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              leftIcon={<EmailIcon />}
            />

            {/* Password + strength meter */}
            <div className="space-y-1.5">
              <Input
                label="Şifrə"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : undefined}
                leftIcon={<LockIcon />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                }
              />

              {form.password && (
                <div className="space-y-1 px-0.5">
                  <div className="flex gap-1" role="meter" aria-label="Şifrə gücü">
                    {([1, 2, 3, 4] as const).map((bar) => (
                      <div
                        key={bar}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors duration-300',
                          strength.level >= bar
                            ? strengthBarColor[strength.level]
                            : 'bg-gray-200',
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-500">
                      Şifrə gücü:{' '}
                      <span className={cn('font-medium', strengthLabelColor[strength.level])}>
                        {strength.label}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Şifrəni təsdiqlə"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              leftIcon={<LockIcon />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={showConfirm ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeOpenIcon />}
                </button>
              }
            />

            {/* Terms */}
            <div className="space-y-1">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={(e) => update('terms', e.target.checked)}
                  onBlur={() => handleBlur('terms')}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">
                  <Link
                    to="/terms"
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    İstifadə şərtlərini
                  </Link>{' '}
                  və{' '}
                  <Link
                    to="/privacy"
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Gizlilik siyasətini
                  </Link>{' '}
                  qəbul edirəm
                </span>
              </label>

              {touched.terms && errors.terms && (
                <p role="alert" className="flex items-center gap-1 pl-6 text-xs text-red-600">
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 3a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                  </svg>
                  {errors.terms}
                </p>
              )}
            </div>

            <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
              Hesab yarat
            </Button>
          </Form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Artıq hesabınız var?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Daxil olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
