"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setLoading(true);

    const res = await apiFetch(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
        }),
      },
    );

    setLoading(false);

    if (!res || !res.ok) {
      const data = await res?.json();

      setError(
        data?.error ||
          "Invalid or expired reset link.",
      );

      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <h1 className="text-3xl font-semibold">
          Reset Password
        </h1>

        <p className="mt-3 text-neutral-400">
          Choose a new password for your account.
        </p>

        {success ? (
          <div className="mt-6 space-y-4">

            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              Your password has been updated successfully.
            </div>

            <a
              href="/login"
              className="block w-full text-center bg-white text-black py-3 rounded-xl font-medium"
            >
              Sign In
            </a>

          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-white/10 bg-transparent p-3 rounded-xl"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full border border-white/10 bg-transparent p-3 rounded-xl"
              required
            />

            {error && (
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}