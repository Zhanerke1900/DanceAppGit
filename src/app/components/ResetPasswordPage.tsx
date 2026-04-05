import React, { useMemo, useState } from "react";
import { API_URL } from "../api/http";
import { useI18n } from "../i18n";


export function ResetPasswordPage({ onGoHome, onOpenLogin }: { onGoHome: () => void; onOpenLogin: () => void }) {
  const { language } = useI18n();
  const copy = {
    missingLink: language === 'ru' ? 'В ссылке сброса отсутствует token или email.' : language === 'kk' ? 'Қалпына келтіру сілтемесінде token немесе email жоқ.' : 'Reset link is missing token or email.',
    shortPassword: language === 'ru' ? 'Пароль должен быть не короче 6 символов.' : language === 'kk' ? 'Құпиясөз кемінде 6 таңба болуы керек.' : 'Password must be at least 6 characters.',
    mismatch: language === 'ru' ? 'Пароли не совпадают.' : language === 'kk' ? 'Құпиясөздер сәйкес келмейді.' : 'Passwords do not match.',
    apiMissing: language === 'ru' ? 'VITE_API_URL не настроен для этого развертывания' : language === 'kk' ? 'Бұл орта үшін VITE_API_URL бапталмаған' : 'VITE_API_URL is not configured for this deployment',
    failed: language === 'ru' ? 'Сброс не удался' : language === 'kk' ? 'Қалпына келтіру сәтсіз аяқталды' : 'Reset failed',
    success: language === 'ru' ? 'Пароль обновлен. Теперь вы можете войти.' : language === 'kk' ? 'Құпиясөз жаңартылды. Енді кіре аласыз.' : 'Password updated. You can log in now.',
    title: language === 'ru' ? 'Сброс пароля' : language === 'kk' ? 'Құпиясөзді қалпына келтіру' : 'Reset password',
    subtitle: language === 'ru' ? 'Введите новый пароль.' : language === 'kk' ? 'Жаңа құпиясөзді енгізіңіз.' : 'Enter a new password.',
    newPassword: language === 'ru' ? 'Новый пароль' : language === 'kk' ? 'Жаңа құпиясөз' : 'New password',
    confirmPassword: language === 'ru' ? 'Подтвердите пароль' : language === 'kk' ? 'Құпиясөзді растаңыз' : 'Confirm password',
    saving: language === 'ru' ? 'Сохранение...' : language === 'kk' ? 'Сақталуда...' : 'Saving...',
    save: language === 'ru' ? 'Сохранить новый пароль' : language === 'kk' ? 'Жаңа құпиясөзді сақтау' : 'Save new password',
    home: language === 'ru' ? 'Главная' : language === 'kk' ? 'Басты бет' : 'Home',
    login: language === 'ru' ? 'Войти' : language === 'kk' ? 'Кіру' : 'Log in',
  };
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
      setMsg(copy.missingLink);
      return;
    }
    if (p1.length < 6) {
      setStatus("error");
      setMsg(copy.shortPassword);
      return;
    }
    if (p1 !== p2) {
      setStatus("error");
      setMsg(copy.mismatch);
      return;
    }

    try {
      setStatus("loading");
      if (!API_URL) throw new Error(copy.apiMissing);
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token, newPassword: p1 }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

      if (!res.ok) throw new Error(data?.message || copy.failed);

      setStatus("ok");
      setMsg(copy.success);
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message || copy.failed);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">{copy.title}</h2>
        <p className="text-gray-300 mb-6 text-center">{msg || copy.subtitle}</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder={copy.newPassword}
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
          />
          <input
            type="password"
            placeholder={copy.confirmPassword}
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-60"
          >
            {status === "loading" ? copy.saving : copy.save}
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
            {copy.home}
          </button>
          {status === "ok" && (
            <button
              onClick={() => {
                window.history.pushState({}, "", "/");
                onOpenLogin();
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              {copy.login}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
