'use client';

import { useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);
  const { t } = useLanguage();

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error(t.security.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res) {
        throw new Error(t.security.updatePasswordError);
      }

      if (!res.ok) {
        const data = await res.json();

        throw new Error(data?.error || t.security.updatePasswordError);
      }

      toast.success(t.security.passwordUpdated);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      window.location.href = '/login';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.security.updatePasswordError);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    const confirmed = window.confirm(t.security.logoutAllConfirm);

    if (!confirmed) {
      return;
    }

    setLoadingLogoutAll(true);

    try {
      await apiFetch('/auth/logout-all', {
        method: 'POST',
      });

      localStorage.removeItem('orderEmail');
      localStorage.removeItem('orderEmailOrderId');
      localStorage.removeItem('checkoutData');

      window.location.href = '/login';
    } finally {
      setLoadingLogoutAll(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">{t.security.title}</h2>

      <p className="mt-2 text-sm text-neutral-500">{t.security.description}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-sm font-medium">{t.security.password}</p>

          <p className="mt-2 text-sm text-neutral-500">{t.security.passwordDescription}</p>

          <div className="mt-5 space-y-3">
            <input
              type="password"
              placeholder={t.security.currentPassword}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <input
              type="password"
              placeholder={t.security.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <input
              type="password"
              placeholder={t.security.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <button
              onClick={handlePasswordChange}
              disabled={loadingPassword}
              className="w-full cursor-pointer rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
            >
              {loadingPassword ? t.security.updating : t.security.changePassword}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 p-5">
          <p className="text-sm font-medium">{t.security.sessions}</p>

          <p className="mt-2 text-sm text-neutral-500">{t.security.sessionsDescription}</p>

          <button
            onClick={handleLogoutAll}
            disabled={loadingLogoutAll}
            className="mt-5 w-full cursor-pointer rounded-xl border border-red-500/20 bg-red-500 px-4 py-3 text-sm font-medium text-white"
          >
            {loadingLogoutAll ? t.security.signingOut : t.security.signOutEverywhere}
          </button>
          <p className="mt-2 text-sm text-neutral-500">{t.security.sessionsFooter}</p>
        </div>
      </div>
    </div>
  );
}
