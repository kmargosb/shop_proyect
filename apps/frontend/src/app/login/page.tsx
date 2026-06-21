"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/features/auth/components/GoogleLoginButton";
import { apiFetch } from "@/shared/lib/api";

export default function LoginPage() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     🔥 REDIRECT LOGIC
  ========================= */
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  /* =========================
     EMAIL LOGIN
  ========================= */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await apiFetch(
      mode === "login" ? "/auth/login" : "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    setLoading(false);

    if (!res) {
      setError("Connection error");
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error || "Invalid credentials");
      return;
    }

    /* =========================
       🔥 REDIRECT + REFRESH APP
    ========================= */
    window.location.href = redirect;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-semibold">
          {showEmailLogin
            ? mode === "login"
              ? "Sign In"
              : "Create Account"
            : "Sign In"}
        </h1>

        <p className="text-neutral-400 text-sm">
          {showEmailLogin
            ? mode === "login"
              ? "Access your account"
              : "Create your account"
            : "Sign in to your account or continue with Google"}
        </p>

        {/* GOOGLE LOGIN */}
        {!showEmailLogin && <GoogleLoginButton />}

        {/* DIVIDER */}
        {!showEmailLogin && (
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <div className="flex-1 h-px bg-white/10" />
            or
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* BOTÓN EMAIL */}
        {!showEmailLogin && (
          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full border border-white/10 py-3 rounded-xl text-sm hover:bg-white/5 transition"
          >
            Continue with Email
          </button>
        )}

        {/* FORM EMAIL */}

        {showEmailLogin && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-white/10 bg-transparent p-3 rounded-xl text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-white/10 bg-transparent p-3 rounded-xl text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === "login" && (
              <div className="flex justify-end">
                <a
                  href="/login/forgot-password"
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Forgot your password?
                </a>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl text-sm font-medium"
            >
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>

            <div className="text-center text-sm">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className="text-white underline"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="text-white underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowEmailLogin(false)}
              className="w-full text-xs text-neutral-400 hover:text-white"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
