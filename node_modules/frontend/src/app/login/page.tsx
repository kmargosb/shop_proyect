"use client";

import { useState } from "react";
import GoogleLoginButton from "@/features/auth/components/GoogleLoginButton";
import { apiFetch } from "@/shared/lib/api";

export default function LoginPage() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);

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

    // 🔥 CLAVE
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-semibold">Iniciar sesión</h1>

        <p className="text-neutral-400 text-sm">
          Accede a tu cuenta o continúa con Google
        </p>

        {/* GOOGLE LOGIN */}
        {!showEmailLogin && <GoogleLoginButton />}

        {/* DIVIDER */}
        {!showEmailLogin && (
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <div className="flex-1 h-px bg-white/10" />
            o
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* BOTÓN MOSTRAR EMAIL */}
        {!showEmailLogin && (
          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full border border-white/10 py-3 rounded-xl text-sm hover:bg-white/5 transition"
          >
            Continuar con email
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

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl text-sm font-medium"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailLogin(false)}
              className="w-full text-xs text-neutral-400 hover:text-white"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}