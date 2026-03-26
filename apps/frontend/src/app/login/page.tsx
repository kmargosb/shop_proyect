"use client";

import GoogleLoginButton from "@/features/auth/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      
      <div className="w-full max-w-md space-y-8 text-center">
        
        <h1 className="text-3xl font-semibold">
          Iniciar sesión
        </h1>

        <p className="text-neutral-400 text-sm">
          Accede a tu cuenta o continúa con Google
        </p>

        {/* GOOGLE LOGIN */}
        <GoogleLoginButton />

        {/* DIVIDER */}
        <div className="flex items-center gap-4 text-neutral-500 text-sm">
          <div className="flex-1 h-px bg-white/10" />
          o
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* FUTURO LOGIN EMAIL */}
        <button className="w-full border border-white/10 py-3 rounded-xl text-sm hover:bg-white/5 transition">
          Continuar con email
        </button>

      </div>
    </div>
  );
}