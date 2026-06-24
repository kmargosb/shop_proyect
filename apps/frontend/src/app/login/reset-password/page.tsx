'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/shared/lib/api';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (password.length < 8) {
      setError(t.resetPassword.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.resetPassword.passwordsDontMatch);
      return;
    }

    setLoading(true);

    const res = await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        password,
      }),
    });

    setLoading(false);

    if (!res || !res.ok) {
      const data = await res?.json();

      setError(data?.error || t.resetPassword.invalidLink);

      return;
    }

    setSuccess(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">{t.resetPassword.title}</h1>

        <p className="mt-3 text-neutral-400">{t.resetPassword.description}</p>

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              {t.resetPassword.success}
            </div>

            <a
              href="/login"
              className="block w-full rounded-xl bg-white py-3 text-center font-medium text-black"
            >
              {t.auth.signIn}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              placeholder={t.resetPassword.newPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent p-3"
              required
            />

            <input
              type="password"
              placeholder={t.resetPassword.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent p-3"
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 font-medium text-black"
            >
              {loading ? t.resetPassword.updating : t.resetPassword.update}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
