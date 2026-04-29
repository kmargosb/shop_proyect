"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginInline({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [showEmail, setShowEmail] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res) {
      setError("Error de conexión");
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data?.error || "Credenciales inválidas");
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
          <div className="flex-1 h-px bg-white/10" />
          o
          <div className="flex-1 h-px bg-white/10" />
        </div>
      )}

      {/* SHOW EMAIL */}
      {!showEmail && (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full border border-white/10 py-2 rounded-lg text-sm hover:bg-white/5"
        >
          Continuar con email
        </button>
      )}

      {/* EMAIL FORM */}
      {showEmail && (
        <form onSubmit={handleEmailLogin} className="space-y-3">

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent border border-white/10 p-3 rounded-lg text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent border border-white/10 p-3 rounded-lg text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded-lg text-sm"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={() => setShowEmail(false)}
            className="w-full text-xs text-neutral-400"
          >
            ← Volver
          </button>
        </form>
      )}
    </div>
  );
}