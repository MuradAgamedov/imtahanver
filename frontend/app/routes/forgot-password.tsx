import { useState } from 'react';
import { Form, Link, useNavigation, useActionData } from 'react-router';
import type { Route } from './+types/forgot-password';
import { AuthPanel } from '../components/auth/auth-panel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Şifrəni unutdunuz — İmtahanVer' },
    { name: 'description', content: 'Şifrənizi sıfırlayın' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const step = formData.get('step') as string;

  if (step === 'request') {
    const email = formData.get('email') as string;
    try {
      const response = await fetch('http://backend:80/api/front/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) return { step: 'request', error: data.message || 'Xəta baş verdi.' };
      return { step: 'verify', email };
    } catch {
      return { step: 'request', error: 'Server ilə əlaqə qurulmadı.' };
    }
  }

  if (step === 'verify') {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;
    const password = formData.get('password') as string;
    const password_confirmation = formData.get('password_confirmation') as string;

    try {
      const response = await fetch('http://backend:80/api/front/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, otp, password, password_confirmation }),
      });
      const data = await response.json();
      if (!response.ok) return { step: 'verify', email, error: data.message || 'Xəta baş verdi.' };
      return { step: 'done' };
    } catch {
      return { step: 'verify', email, error: 'Server ilə əlaqə qurulmadı.' };
    }
  }

  return {};
}

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

export default function ForgotPasswordPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const actionData = useActionData() as
    | { step: string; email?: string; error?: string }
    | undefined;

  const [email, setEmail] = useState('');

  // After successful OTP request, server returns step:'verify'
  const currentStep = actionData?.step ?? 'request';
  const serverEmail = actionData?.email ?? email;

  if (currentStep === 'done') {
    return (
      <div className="flex min-h-screen">
        <AuthPanel />
        <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Şifrə yeniləndi!</h1>
            <p className="mt-2 text-sm text-gray-500">Yeni şifrənizlə daxil ola bilərsiniz.</p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Daxil ol
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'verify') {
    return (
      <div className="flex min-h-screen">
        <AuthPanel />
        <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Şifrəni sıfırla</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{serverEmail}</span> ünvanına göndərilən
                6 rəqəmli kodu daxil edin.
              </p>
            </header>

            {actionData?.error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-5">
              <input type="hidden" name="step" value="verify" />
              <input type="hidden" name="email" value={serverEmail} />

              <Input
                label="OTP kod"
                type="text"
                name="otp"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
              />

              <Input
                label="Yeni şifrə"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
              />

              <Input
                label="Şifrəni təkrarlayın"
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<LockIcon />}
              />

              <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
                Şifrəni yenilə
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  // Step: request
  return (
    <div className="flex min-h-screen">
      <AuthPanel />
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Şifrəni unutdunuz?</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Email ünvanınızı daxil edin, şifrə sıfırlama kodu göndərəcəyik.
            </p>
          </header>

          {actionData?.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-5">
            <input type="hidden" name="step" value="request" />

            <Input
              label="Email ünvanı"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ad@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<EmailIcon />}
            />

            <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
              Kod göndər
            </Button>
          </Form>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Geri dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
