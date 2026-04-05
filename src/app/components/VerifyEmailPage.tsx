import React, { useEffect, useState } from "react";
import { API_URL } from "../api/http";
import { useI18n } from "../i18n";


export function VerifyEmailPage({ onGoHome, onOpenLogin }: { onGoHome: () => void; onOpenLogin: () => void }) {
  const { language } = useI18n();
  const copy = {
    loadingMessage: language === 'ru' ? 'Проверяем ваш email...' : language === 'kk' ? 'Email расталып жатыр...' : 'Verifying your email...',
    missingLink: language === 'ru' ? 'В ссылке подтверждения отсутствует token или email.' : language === 'kk' ? 'Растау сілтемесінде token немесе email жоқ.' : 'Verification link is missing token or email.',
    apiMissing: language === 'ru' ? 'VITE_API_URL не настроен для этого развертывания.' : language === 'kk' ? 'Бұл орта үшін VITE_API_URL бапталмаған.' : 'VITE_API_URL is not configured for this deployment.',
    failed: language === 'ru' ? 'Подтверждение не удалось' : language === 'kk' ? 'Растау сәтсіз аяқталды' : 'Verification failed',
    success: language === 'ru' ? 'Email успешно подтвержден! Теперь вы можете войти.' : language === 'kk' ? 'Email сәтті расталды! Енді кіре аласыз.' : 'Email verified successfully! You can log in now.',
    title: language === 'ru' ? 'Подтверждение email' : language === 'kk' ? 'Email растау' : 'Email verification',
    loading: language === 'ru' ? 'Загрузка...' : language === 'kk' ? 'Жүктелуде...' : 'Loading...',
    home: language === 'ru' ? 'На главную' : language === 'kk' ? 'Басты бетке' : 'Go home',
    login: language === 'ru' ? 'Войти' : language === 'kk' ? 'Кіру' : 'Log in',
  };
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState(copy.loadingMessage);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage(copy.missingLink);
      return;
    }

    if (!API_URL) {
      setStatus("error");
      setMessage(copy.apiMissing);
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
        if (!res.ok) throw new Error(data?.message || copy.failed);
        setStatus("ok");
        setMessage(copy.success);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e?.message || copy.failed);
      });
  }, [copy.apiMissing, copy.failed, copy.loadingMessage, copy.missingLink, copy.success]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">{copy.title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        {status === "loading" && (
          <div className="text-purple-300">{copy.loading}</div>
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
              {copy.home}
            </button>

            {status === "ok" && (
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/");
                  onOpenLogin();
                }}
                className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {copy.login}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
