"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";

export default function SettingsTab() {
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await apiFetch("/customers/me/preferences");

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
      const res = await apiFetch("/customers/me/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          marketingEmails: nextValue,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Preferences updated");
    } catch {
      setMarketingEmails(!nextValue);

      toast.error("Unable to update preferences");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <p className="text-neutral-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <p className="mt-2 text-sm text-neutral-500">
        Manage your account preferences.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <p className="font-medium">Marketing Emails</p>

            <p className="mt-1 text-sm text-neutral-500">
              Receive updates, product launches and exclusive offers.
            </p>
          </div>

          <button
            onClick={toggleMarketingEmails}
            className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${
              marketingEmails
                ? "bg-white text-black"
                : "border border-white/10 text-white"
            }`}
          >
            {marketingEmails ? "Enabled" : "Disabled"}
          </button>
        </div>
        <div className="rounded-2xl border border-red-500/20 p-5">
          <p className="font-medium text-white">Deactivate Account</p>

          <p className="mt-1 text-sm text-neutral-500">
            Deactivate your account and sign out from all devices. You can
            reactivate it anytime by signing in again.
          </p>

          <button
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to deactivate your account?",
              );

              if (!confirmed) return;

              const secondConfirm = window.confirm(
                "You can reactivate your account later by signing in again. Continue?",
              );

              if (!secondConfirm) return;

              try {
                const res = await apiFetch("/auth/deactivate-account", {
                  method: "POST",
                });

                if (!res || !res.ok) {
                  throw new Error();
                }

                localStorage.removeItem("orderEmail");
                localStorage.removeItem("orderEmailOrderId");
                localStorage.removeItem("checkoutData");

                toast.success("Account deactivated successfully.");

                window.location.href = "/";
              } catch {
                toast.error("Unable to deactivate account.");
              }
            }}
            className="mt-5 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white cursor-pointer"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
}
