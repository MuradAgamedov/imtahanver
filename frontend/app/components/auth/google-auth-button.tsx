import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAuthButton({ clientId }: { clientId?: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    function handleCredential(response: { credential: string }) {
      setError(null);
      fetch('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            window.location.href = '/';
          } else {
            setError(data.message || 'Google ilə giriş uğursuz oldu.');
          }
        })
        .catch(() => {
          setError('Google ilə əlaqə qurularkən xəta baş verdi.');
        });
    }

    function init() {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 340,
        text: 'continue_with',
        locale: 'az',
      });
    }

    if (window.google) {
      init();
    } else {
      const existing = document.getElementById('google-identity-script');
      if (existing) {
        existing.addEventListener('load', init);
      } else {
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = init;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="space-y-2">
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-ink-soft/15" />
        <span className="mx-3 text-xs font-medium text-ink-soft/60">və ya</span>
        <div className="flex-1 border-t border-ink-soft/15" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
