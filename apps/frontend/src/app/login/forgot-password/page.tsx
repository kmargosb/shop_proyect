"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setLoading(true);

    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <h1 className="text-3xl font-semibold">
          Forgot Password
        </h1>

        <p className="mt-3 text-neutral-400">
          Enter your email address and we’ll send you a password reset link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm text-neutral-300">
            If an account exists with this email, a reset link has been sent.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border border-white/10 bg-transparent p-3 rounded-xl"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}