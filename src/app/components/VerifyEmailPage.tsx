import React, { useEffect, useState } from "react";

const API_URL = ((import.meta as any).env?.VITE_API_URL) || "http://localhost:4000";


export function VerifyEmailPage({ onGoHome, onOpenLogin }: { onGoHome: () => void; onOpenLogin: () => void }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Verification link is missing token or email.");
      return;
    }

    fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        let data: any = {};
        try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
        if (!res.ok) throw new Error(data?.message || "Verification failed");
        setStatus("ok");
        setMessage("Email verified successfully! You can log in now.");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e?.message || "Verification failed");
      });
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">Email verification</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        {status === "loading" && (
          <div className="text-purple-300">Loading...</div>
        )}

        {status !== "loading" && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                // очистим URL чтобы не мешал
                window.history.pushState({}, "", "/");
                onGoHome();
              }}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Go home
            </button>

            {status === "ok" && (
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/");
                  onOpenLogin();
                }}
                className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                Log in
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
