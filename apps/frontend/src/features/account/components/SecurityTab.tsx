"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";

export default function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res) {
        throw new Error("Unable to update password.");
      }

      if (!res.ok) {
        const data = await res.json();

        throw new Error(data?.error || "Unable to update password.");
      }

      toast.success("Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      window.location.href = "/login";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    const confirmed = window.confirm(
      "This will sign you out from all devices. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setLoadingLogoutAll(true);

    try {
      await apiFetch("/auth/logout-all", {
        method: "POST",
      });

      localStorage.removeItem("orderEmail");
      localStorage.removeItem("orderEmailOrderId");
      localStorage.removeItem("checkoutData");

      window.location.href = "/login";
    } finally {
      setLoadingLogoutAll(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Security</h2>

      <p className="mt-2 text-sm text-neutral-500">
        Manage your password and account security.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-sm font-medium">Password</p>

          <p className="mt-2 text-sm text-neutral-500">
            Update your password regularly to keep your account secure.
          </p>

          <div className="mt-5 space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <button
              onClick={handlePasswordChange}
              disabled={loadingPassword}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black cursor-pointer"
            >
              {loadingPassword ? "Updating..." : "Change Password"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 p-5">
          <p className="text-sm font-medium">Sessions</p>

          <p className="mt-2 text-sm text-neutral-500">
            Sign out from all devices connected to your account.
          </p>

          <button
            onClick={handleLogoutAll}
            disabled={loadingLogoutAll}
            className="mt-5 w-full rounded-xl border border-red-500/20 bg-red-500 px-4 py-3 text-sm font-medium text-white cursor-pointer"
          >
            {loadingLogoutAll ? "Signing Out..." : "Sign Out Everywhere"}
          </button>
          <p className="mt-2 text-sm text-neutral-500">
            End all active sessions and require a new login on every device.
          </p>
        </div>
      </div>
    </div>
  );
}
