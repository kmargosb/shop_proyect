'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function SettingsTab() {
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await apiFetch('/customers/me/preferences');

        if (!res || !res.ok) {
          return;
        }

        const data = await res.json();

        setMarketingEmails(data.marketingEmails);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const toggleMarketingEmails = async () => {
    const nextValue = !marketingEmails;

    setMarketingEmails(nextValue);

    try {
      const res = await apiFetch('/customers/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          marketingEmails: nextValue,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success(t.settings.preferencesUpdated);
    } catch {
      setMarketingEmails(!nextValue);

      toast.error(t.settings.preferencesError);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-3 md:p-6">
        <p className="text-neutral-500">{t.settings.loading}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-3 md:p-6">
      <h2 className="text-xl font-bold md:text-2xl">{t.settings.title}</h2>

      <p className="mt-1 text-xs md:mt-2 md:text-sm text-neutral-500">{t.settings.description}</p>

      <div className="mt-4 space-y-2 md:mt-8 md:space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3 md:rounded-2xl md:p-5">
          <div>
            <p className="font-medium">{t.settings.marketingEmails}</p>

            <p className="mt-1 text-sm text-neutral-500">{t.settings.marketingDescription}</p>
          </div>

          <button
            onClick={toggleMarketingEmails}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
              marketingEmails ? 'bg-white text-black' : 'border border-white/10 text-white'
            }`}
          >
            {marketingEmails ? t.settings.enabled : t.settings.disabled}
          </button>
        </div>
        <div className="rounded-xl border border-red-500/20 p-3 md:rounded-2xl md:p-5">
          <p className="font-medium text-white">{t.settings.deactivateAccount}</p>

          <p className="mt-1 text-sm text-neutral-500">{t.settings.deactivateDescription}</p>

          <button
            onClick={() => setShowDeactivateModal(true)}
            className="mt-3 cursor-pointer rounded-xl bg-red-500 px-3 py-2.5 md:mt-5 md:px-4 md:py-3 text-sm font-medium text-white"
          >
            {t.settings.deactivateAccount}
          </button>
        </div>
      </div>
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-3 md:p-6">
            <h3 className="text-xl font-semibold text-white">{t.settings.deactivateAccount}</h3>

            <p className="mt-3 text-sm text-neutral-400">{t.settings.modalDescription}</p>

            <p className="mt-1 text-xs md:mt-2 md:text-sm text-neutral-400">{t.settings.modalDescription2}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivating}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white"
              >
                {t.settings.cancel}
              </button>

              <button
                disabled={deactivating}
                onClick={async () => {
                  try {
                    setDeactivating(true);

                    const res = await apiFetch('/auth/deactivate-account', {
                      method: 'POST',
                    });

                    if (!res || !res.ok) {
                      throw new Error();
                    }

                    localStorage.removeItem('orderEmail');
                    localStorage.removeItem('orderEmailOrderId');
                    localStorage.removeItem('checkoutData');

                    toast.success(t.settings.deactivated);

                    window.location.href = '/';
                  } catch {
                    toast.error(t.settings.deactivateError);
                  } finally {
                    setDeactivating(false);
                  }
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white"
              >
                {deactivating ? t.settings.deactivating : t.settings.deactivate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
