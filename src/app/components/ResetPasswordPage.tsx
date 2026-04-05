import React, { useMemo, useState } from "react";

const API_URL = ((import.meta as any).env?.VITE_API_URL) || "http://localhost:4000";


export function ResetPasswordPage({ onGoHome, onOpenLogin }: { onGoHome: () => void; onOpenLogin: () => void }) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!token || !email) {
      setStatus("error");
      setMsg("Reset link is missing token or email.");
      return;
    }
    if (p1.length < 6) {
      setStatus("error");
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (p1 !== p2) {
      setStatus("error");
      setMsg("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token, newPassword: p1 }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

      if (!res.ok) throw new Error(data?.message || "Reset failed");

      setStatus("ok");
      setMsg("Password updated. You can log in now.");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message || "Reset failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Reset password</h2>
        <p className="text-gray-300 mb-6 text-center">{msg || "Enter a new password."}</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60"
          >
            {status === "loading" ? "Saving..." : "Save new password"}
          </button>
        </form>

        <div className="flex gap-3 justify-center mt-5">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/");
              onGoHome();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            Home
          </button>
          {status === "ok" && (
            <button
              onClick={() => {
                window.history.pushState({}, "", "/");
                onOpenLogin();
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
