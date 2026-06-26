'use client';

import { useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginInline({ onSuccess }: { onSuccess?: () => void }) {
  const [showEmail, setShowEmail] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res) {
      setError('Connection error');
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error || 'Invalid credentials');
      return;
    }

    // 🔥 NO REDIRECT
    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-4">
      {/* GOOGLE */}
      {!showEmail && (
        <div className="flex justify-center">
          <GoogleLoginButton onSuccess={onSuccess} />
        </div>
      )}

      {/* DIVIDER */}
      {!showEmail && (
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>
      )}

      {/* SHOW EMAIL */}
      {!showEmail && (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full rounded-lg border border-white/10 py-2 text-sm hover:bg-white/5"
        >
          Continue with Email
        </button>
      )}

      {/* EMAIL FORM */}
      {showEmail && (
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-white/10 bg-transparent p-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <a href="/login/forgot-password" className="text-xs text-neutral-400 hover:text-white">
              Forgot your password?
            </a>
          </div>

          {error && <p className="text-center text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2 text-sm text-black"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setShowEmail(false)}
            className="w-full text-xs text-neutral-400"
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
