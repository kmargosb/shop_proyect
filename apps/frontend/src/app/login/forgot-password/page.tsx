'use client';

import { useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">{t.forgotPassword.title}</h1>

        <p className="mt-3 text-neutral-400">{t.forgotPassword.description}</p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm text-neutral-300">
            {t.forgotPassword.emailSent}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder={t.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent p-3"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 font-medium text-black"
            >
              {loading ? t.forgotPassword.sending : t.forgotPassword.sendLink}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
