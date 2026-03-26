"use client";

import { GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No Google credential received");
      }

      const idToken = credentialResponse.credential;

      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 CLAVE AHORA
        body: JSON.stringify({ idToken }),
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ Invalid JSON:", text);
        return;
      }

      if (!res.ok) {
        console.error("❌ Backend error:", data);
        return;
      }

      /* =========================
         🔥 NUEVO SISTEMA
      ========================= */

      if (!data?.user) {
        console.error("❌ Missing user:", data);
        return;
      }

      // ✔ solo guardamos user (opcional)
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔥 NO guardamos token
      // 🔥 NO usamos localStorage para auth

      window.location.href = "/";
    } catch (error) {
      console.error("🔥 Google login error:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.error("❌ Google Login Failed");
        }}
      />
    </div>
  );
}