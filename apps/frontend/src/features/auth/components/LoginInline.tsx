"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";

export default function LoginInline({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res || !res.ok) {
        throw new Error("Login failed");
      }

      onSuccess(); // 🔥 recarga checkout
    } catch (err) {
      alert("Error en login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">

      <input
        className="w-full p-2 bg-black border border-neutral-700 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-2 bg-black border border-neutral-700 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-white text-black py-2 rounded"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

    </div>
  );
}