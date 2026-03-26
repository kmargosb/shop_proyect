"use client";

import { GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleLoginButton() {
  console.log("🔥 GoogleLoginButton RENDERED");

  const handleSuccess = async (credentialResponse: any) => {
    console.log("✅ GOOGLE RAW RESPONSE:", credentialResponse);

    try {
      if (!credentialResponse?.credential) {
        console.error("❌ No credential received");
        return;
      }

      const idToken = credentialResponse.credential;

      console.log("📦 Sending token to backend...");

      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      console.log("📡 Response status:", res.status);

      const text = await res.text();
      console.log("📥 Raw response:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ Response is NOT JSON");
        return;
      }

      console.log("📦 Parsed response:", data);

      if (!res.ok) {
        console.error("❌ Backend error:", data);
        return;
      }

      if (!data?.token || !data?.user) {
        console.error("❌ Missing token or user:", data);
        return;
      }

      /* =========================
         SAVE SESSION
      ========================= */

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ LOGIN SUCCESS → redirecting...");

      // window.location.href = "/"; // mejor que reload

      console.log("🛑 STOP REDIRECT (debug mode)");

      
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