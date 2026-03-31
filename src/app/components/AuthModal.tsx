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

type AuthView = 'login' | 'register' | 'forgot-password' | 'verification-sent';

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
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
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
        setGeneralError('Please verify your email first. Check your inbox or resend below.');
        setView('verification-sent');
        setCountdown(60);
        return;
      }

      setGeneralError(err?.message || 'Login failed');
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
      setGeneralError('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
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
      const msg = String(err?.message || 'Registration failed');
      if (msg.toLowerCase().includes('already')) {
        setEmailError('Email is already registered');
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
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email.trim().toLowerCase());
      setView('verification-sent');
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to send reset email');
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
                <DialogTitle className="text-2xl text-white">Welcome Back</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Log in to access your tickets and favorite events
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
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
                  <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLoginFormValid}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="w-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 py-3 rounded-lg font-semibold transition-colors"
                >
                  Create Account
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
                Back to login
              </button>

              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Create Account</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Join DancePass and never miss a beat
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2 p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  Save and manage your tickets
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Faster checkout process
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Secure and verified purchases
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
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
                  <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
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
                  <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
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
                  {loading ? 'Creating Account...' : 'Sign Up'}
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
                Back to login
              </button>

              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Reset Password</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your email to receive reset instructions
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleForgotPassword} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
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
                  {loading ? 'Sending Instructions...' : 'Reset Password'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'verification-sent' && (
            <motion.div
              key="verification-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check your inbox</h3>
              <p className="text-gray-400 mb-8">
                We've sent verification instructions to <br />
                <span className="text-white font-medium">{email}</span>
              </p>

              {email && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setGeneralError('');
                      await authApi.resendVerification(email.trim().toLowerCase());
                      setGeneralError('Verification email sent again. Check your inbox.');
                    } catch (e: any) {
                      setGeneralError((e && e.message) ? e.message : 'Could not resend verification email');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full mb-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend verification email'}
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
                Back to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
