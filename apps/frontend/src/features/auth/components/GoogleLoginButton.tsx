'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/shared/lib/api';

declare global {
  interface Window {
    google: any;
    __googleInitialized?: boolean;
  }
}

export default function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) return;

      if (!window.__googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });

        window.__googleInitialized = true;
      }

      window.google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'outline',
        size: 'large',
        width: 300,
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    if (existing) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;

    document.body.appendChild(script);
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    const res = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (!res) {
      alert('LOGIN: apiFetch devolvió null');
      return;
    }

    alert(`LOGIN STATUS: ${res.status}`);

    if (!res.ok) {
      alert('LOGIN FAILED');
      return;
    }

    // 🔥 IMPORTANTE: usar fetch nativo, NO apiFetch
    try {
      const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      alert(`ME FETCH STATUS: ${me.status}`);

      const text = await me.text();

      alert(text);

      // ⚠️ NO REDIRECCIONAR
    } catch (err: any) {
      alert(`FETCH ERROR: ${err?.message ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="flex h-[44px] items-center justify-center">
      <div id="google-btn" />
    </div>
  );
}
