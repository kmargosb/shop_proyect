'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/features/auth/components/GoogleLoginButton';
import { request } from '@/shared/lib/request';
import { ApiError, ApiErrorCode } from '@/shared/api';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import LoadingOverlay from '@/components/loader/LoadingOverlay';
import { useAuth } from '@/features/auth/context/AuthContext';

function LoginContent() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { t } = useLanguage();

  /* =========================
     🔥 REDIRECT LOGIC
  ========================= */
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  /* =========================
     EMAIL LOGIN
  ========================= */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await request(mode === 'login' ? '/auth/login' : '/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          email,
          password,
        }),
      });

      await refreshUser();

      window.location.replace(redirect);
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.code) {
          case ApiErrorCode.UNAUTHORIZED:
            setError(t.auth.invalidCredentials);
            break;

          case ApiErrorCode.NETWORK:
          case ApiErrorCode.TIMEOUT:
          case ApiErrorCode.SERVER:
          case ApiErrorCode.OFFLINE:
            setError(t.auth.connectionError);
            break;

          default:
            setError(error.message);
        }
      } else {
        setError(t.auth.connectionError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingOverlay open text="Comprobando sesión..." />;
  }

  useEffect(() => {
    if (user) {
      window.location.replace(redirect);
    }
  }, [user, redirect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6 text-white">
      <LoadingOverlay
        open={loading}
        text={mode === 'login' ? t.auth.signingIn : t.auth.creatingAccount}
      />

      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-semibold">
          {showEmailLogin
            ? mode === 'login'
              ? t.auth.signIn
              : t.auth.createAccount
            : t.auth.signIn}
        </h1>

        <p className="text-sm text-neutral-400">
          {showEmailLogin
            ? mode === 'login'
              ? t.auth.accessAccount
              : t.auth.createYourAccount
            : t.auth.continueGoogle}
        </p>

        {/* GOOGLE LOGIN */}
        {!showEmailLogin && <GoogleLoginButton loading={loading} setLoading={setLoading} />}

        {/* DIVIDER */}
        {!showEmailLogin && (
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <div className="h-px flex-1 bg-white/10" />
            {t.common.or}
            <div className="h-px flex-1 bg-white/10" />
          </div>
        )}

        {/* BOTÓN EMAIL */}
        {!showEmailLogin && (
          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full rounded-xl border border-white/10 py-3 text-sm transition hover:bg-white/5"
          >
            {t.auth.continueEmail}
          </button>
        )}

        {/* FORM EMAIL */}

        {showEmailLogin && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <input
              type="email"
              placeholder={t.auth.email}
              className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder={t.auth.password}
              className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === 'login' && (
              <div className="flex justify-end">
                <a
                  href={loading ? '#' : '/login/forgot-password'}
                  onClick={(e) => {
                    if (loading) e.preventDefault();
                  }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  {t.auth.forgotPassword}
                </a>
              </div>
            )}

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 text-sm font-medium text-black"
            >
              {loading
                ? mode === 'login'
                  ? t.auth.signingIn
                  : t.auth.creatingAccount
                : mode === 'login'
                  ? t.auth.signIn
                  : t.auth.createAccount}
            </button>

            <div className="text-center text-sm">
              {mode === 'login' ? (
                <>
                  {t.auth.noAccount}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-white underline"
                  >
                    {t.auth.createAccount}
                  </button>
                </>
              ) : (
                <>
                  {t.auth.alreadyAccount}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-white underline"
                  >
                    {t.auth.signIn}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowEmailLogin(false)}
              className="w-full text-xs text-neutral-400 hover:text-white"
            >
              ← {t.auth.back}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
