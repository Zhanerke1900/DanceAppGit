import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Ticket, Zap, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { motion, AnimatePresence } from 'motion/react';
import * as authApi from '../api/auth';
import { useI18n } from '../i18n';

type AuthView = 'login' | 'register' | 'forgot-password' | 'verification-sent' | 'reset-sent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
  initialView?: AuthView;
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialView = 'login' }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { t } = useI18n();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setCountdown(0);
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      resetForm();
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setPasswordError('');
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError(t('auth.validEmail'));
      return;
    }

    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return;
    }

    try {
      setLoading(true);

      const result = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const backendUser = result.user || {
        id: '1',
        name: fullName || 'User',
        email,
      };

      onAuthSuccess?.(backendUser);
      onClose();
      resetForm();
    } catch (err: any) {
      if (err?.code === 'EMAIL_NOT_VERIFIED' || String(err?.message || '').toLowerCase().includes('verify')) {
        setGeneralError(t('auth.verifyEmailFirst'));
        setView('verification-sent');
        setCountdown(60);
        return;
      }

      setGeneralError(err?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setEmailError('');
    setPasswordError('');

    if (!fullName || fullName.length < 2) {
      setGeneralError(t('auth.enterFullName'));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('auth.validEmail'));
      return;
    }

    if (password.length < 6) {
      setPasswordError(t('auth.passwordMin'));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t('auth.passwordsMismatch'));
      return;
    }

    try {
      setLoading(true);

      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setView('verification-sent');
      setCountdown(60);
    } catch (err: any) {
      const msg = String(err?.message || t('auth.registrationFailed'));
      if (msg.toLowerCase().includes('already')) {
        setEmailError(t('auth.emailRegistered'));
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setGeneralError('');

    if (!validateEmail(email)) {
      setEmailError(t('auth.validEmail'));
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email.trim().toLowerCase());
      setView('reset-sent');
    } catch (err: any) {
      setGeneralError(err?.message || t('auth.failedResetEmail'));
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setView(newView);
  };

  const isLoginFormValid = Boolean(email && password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-500/20 text-gray-100 max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.3);
            border-radius: 10px;
          }
        `}} />

        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">{t('auth.welcomeBack')}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {t('auth.loginDescription')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">{t('common.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('auth.yourEmail')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                        emailError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">{t('common.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.enterPassword')}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                        passwordError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                </div>

                {generalError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                  </div>
                )}

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLoginFormValid}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                >
                  {loading ? t('common.loggingIn') : t('auth.login')}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-500">{t('auth.noAccount')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="w-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t('auth.createAccount')}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => switchView('login')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.backToLogin')}
              </button>

              <DialogHeader>
                <DialogTitle className="text-2xl text-white">{t('auth.createAccount')}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {t('auth.joinDanceTime')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2 p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  {t('auth.saveTickets')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-purple-400" />
                  {t('auth.fasterCheckout')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-purple-400" />
                  {t('auth.securePurchases')}
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-gray-300">{t('common.fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="full-name"
                      type="text"
                      placeholder={t('auth.yourFullName')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">{t('common.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t('auth.yourEmail')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                        emailError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">{t('common.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.createPassword')}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                        passwordError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">{t('common.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.repeatPassword')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                {generalError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                >
                  {loading ? t('common.creatingAccount') : t('auth.signUp')}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => switchView('login')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.backToLogin')}
              </button>

              <DialogHeader>
                <DialogTitle className="text-2xl text-white">{t('common.resetPassword')}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {t('auth.enterEmailReset')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleForgotPassword} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-300">{t('common.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder={t('auth.yourEmail')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                        emailError ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </div>
                  )}
                </div>

                {generalError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                >
                  {loading ? t('common.sendInstructions') : t('auth.resetPasswordButton')}
                </button>
              </form>
            </motion.div>
          )}

          {(view === 'verification-sent' || view === 'reset-sent') && (
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('common.checkInbox')}</h3>
              <p className="text-gray-400 mb-8">
                {view === 'reset-sent' ? 'Password reset instructions were sent to' : t('auth.verificationSentTo')} <br />
                <span className="text-white font-medium">{email}</span>
              </p>

              {email && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setGeneralError('');
                      if (view === 'reset-sent') {
                        await authApi.forgotPassword(email.trim().toLowerCase());
                        setGeneralError('Reset email sent again. Check Railway logs.');
                      } else {
                        await authApi.resendVerification(email.trim().toLowerCase());
                        setGeneralError(t('auth.verificationSentAgain'));
                      }
                    } catch (e: any) {
                      setGeneralError((e && e.message) ? e.message : (view === 'reset-sent' ? t('auth.failedResetEmail') : t('auth.verificationResendFailed')));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full mb-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? t('common.sending') : (view === 'reset-sent' ? 'Resend reset email' : t('common.resendVerificationEmail'))}
                </button>
              )}

              {generalError && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  {generalError}
                </div>
              )}

              <button
                onClick={() => switchView('login')}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {t('common.backToLoginCta')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
