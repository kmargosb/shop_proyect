'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/shared/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const containerRef = useRef<HTMLDivElement>(null);

  const initialized = useRef(false);

  const [loading, setLoading] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await apiFetch('/auth/google', {
          method: 'POST',
          body: JSON.stringify({
            idToken: response.credential,
          }),
        });

        if (!res || !res.ok) {
          setLoading(false);
          return;
        }

        if (onSuccess) {
          onSuccess();
          return;
        }

        window.location.replace(redirect);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [loading, onSuccess, redirect],
  );

  useEffect(() => {
    let cancelled = false;

    const waitForGoogle = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        setTimeout(waitForGoogle, 100);
        return;
      }

      if (!containerRef.current) {
        setTimeout(waitForGoogle, 100);
        return;
      }

      if (!initialized.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });

        initialized.current = true;
      }

      containerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: 300,
      });
    };

    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    if (!script) {
      const s = document.createElement('script');

      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;

      s.onload = waitForGoogle;

      document.body.appendChild(s);
    } else {
      waitForGoogle();
    }

    return () => {
      cancelled = true;
    };
  }, [handleCredentialResponse]);

  return (
    <div className="flex h-[44px] items-center justify-center">
      {loading ? (
        <div className="flex h-[44px] w-[300px] items-center justify-center rounded-md border border-white/10 bg-neutral-900 text-sm text-neutral-400">
          Iniciando sesión...
        </div>
      ) : (
        <div ref={containerRef} id="google-btn" />
      )}
    </div>
  );
}
