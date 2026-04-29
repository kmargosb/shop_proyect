"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: 300 }
      );
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    const res = await apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    if (!res || !res.ok) return;

    /* =========================
       🔥 MODO INTELIGENTE
    ========================= */

    if (onSuccess) {
      // 👉 modo checkout (NO redirect)
      onSuccess();
    } else {
      // 👉 modo login page (REDIRECT)
      window.location.href = redirect;
    }
  };

  return <div id="google-btn" />;
}