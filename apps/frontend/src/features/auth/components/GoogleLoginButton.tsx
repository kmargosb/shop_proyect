'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/shared/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

type GoogleLoginButtonProps = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
};

export default function GoogleLoginButton({
  loading,
  setLoading,
  onSuccess,
}: GoogleLoginButtonProps) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

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
    [loading, onSuccess, redirect, setLoading],
  );

  useEffect(() => {
    let cancelled = false;

    const renderButton = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        setTimeout(renderButton, 100);
        return;
      }

      if (!containerRef.current) {
        setTimeout(renderButton, 100);
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

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    if (!existing) {
      const script = document.createElement('script');

      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;

      document.body.appendChild(script);
    } else {
      renderButton();
    }

    return () => {
      cancelled = true;
    };
  }, [handleCredentialResponse]);

  return (
    <div className="flex h-[44px] items-center justify-center">
      <div ref={containerRef} />
    </div>
  );
}
