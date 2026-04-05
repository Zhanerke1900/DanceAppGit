import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Bell, Save, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import * as authApi from '../api/auth';
import { useI18n } from '../i18n';

interface AccountSettingsProps {
  user: any;
  onUserUpdate?: (user: any) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUserUpdate }) => {
  const { language } = useI18n();
  const copy = {
    title: language === 'ru' ? 'Настройки аккаунта' : language === 'kk' ? 'Аккаунт баптаулары' : 'Account Settings',
    subtitle: language === 'ru' ? 'Управляйте данными аккаунта и безопасностью' : language === 'kk' ? 'Аккаунт ақпараты мен қауіпсіздікті басқарыңыз' : 'Manage your account information and security',
    personal: language === 'ru' ? 'Личная информация' : language === 'kk' ? 'Жеке ақпарат' : 'Personal Information',
    fullName: language === 'ru' ? 'Полное имя' : language === 'kk' ? 'Толық аты-жөні' : 'Full Name',
    email: language === 'ru' ? 'Электронная почта' : language === 'kk' ? 'Электрондық пошта' : 'Email Address',
    emailFixed: language === 'ru' ? 'Email нельзя изменить.' : language === 'kk' ? 'Email өзгертілмейді.' : 'Email cannot be changed.',
    security: language === 'ru' ? 'Безопасность' : language === 'kk' ? 'Қауіпсіздік' : 'Security',
    changePassword: language === 'ru' ? 'Сменить пароль' : language === 'kk' ? 'Құпиясөзді өзгерту' : 'Change Password',
    notifications: language === 'ru' ? 'Настройки уведомлений' : language === 'kk' ? 'Хабарлама баптаулары' : 'Notification Preferences',
    emailNotifications: language === 'ru' ? 'Email-уведомления' : language === 'kk' ? 'Email хабарламалары' : 'Email Notifications',
    emailNotificationsDesc: language === 'ru' ? 'Получать обновления о билетах и событиях' : language === 'kk' ? 'Билеттер мен іс-шаралар туралы жаңартуларды алу' : 'Receive updates about your tickets and events',
    eventReminders: language === 'ru' ? 'Напоминания о событиях' : language === 'kk' ? 'Іс-шара еске салғыштары' : 'Event Reminders',
    eventRemindersDesc: language === 'ru' ? 'Напомнить за 24 часа до события' : language === 'kk' ? 'Іс-шараға 24 сағат қалғанда еске салу' : 'Remind me 24 hours before an event',
    changesSaved: language === 'ru' ? 'Изменения сохранены!' : language === 'kk' ? 'Өзгерістер сақталды!' : 'Changes saved!',
    saving: language === 'ru' ? 'Сохранение...' : language === 'kk' ? 'Сақталуда...' : 'Saving...',
    saveChanges: language === 'ru' ? 'Сохранить изменения' : language === 'kk' ? 'Өзгерістерді сақтау' : 'Save Changes',
    updatePasswordDesc: language === 'ru' ? 'Обновите пароль и сохраните аккаунт в безопасности' : language === 'kk' ? 'Құпиясөзді жаңартып, аккаунтты қауіпсіз ұстаңыз' : 'Update your password and keep your account secure',
    currentPassword: language === 'ru' ? 'Текущий пароль' : language === 'kk' ? 'Ағымдағы құпиясөз' : 'Current Password',
    enterCurrentPassword: language === 'ru' ? 'Введите текущий пароль' : language === 'kk' ? 'Ағымдағы құпиясөзді енгізіңіз' : 'Enter your current password',
    newPassword: language === 'ru' ? 'Новый пароль' : language === 'kk' ? 'Жаңа құпиясөз' : 'New Password',
    createPassword: language === 'ru' ? 'Создайте новый пароль' : language === 'kk' ? 'Жаңа құпиясөз жасаңыз' : 'Create a new password',
    repeatNewPassword: language === 'ru' ? 'Повторите новый пароль' : language === 'kk' ? 'Жаңа құпиясөзді қайталаңыз' : 'Repeat New Password',
    forgotPassword: language === 'ru' ? 'Забыли пароль?' : language === 'kk' ? 'Құпиясөзді ұмыттыңыз ба?' : 'Forgot password?',
    updatingPassword: language === 'ru' ? 'Пароль обновляется...' : language === 'kk' ? 'Құпиясөз жаңартылуда...' : 'Updating Password...',
    updatePassword: language === 'ru' ? 'Обновить пароль' : language === 'kk' ? 'Құпиясөзді жаңарту' : 'Update Password',
  };
  const isAdmin = Boolean(user?.isAdmin);
  const isOrganizer = Boolean(user?.isOrganizer || user?.organizerStatus === 'approved');
  const isValidator = Boolean(user?.role === 'validator' || user?.isValidator);
  const compactLayout = (isOrganizer || isValidator) && !isAdmin;
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    language: user?.language || 'en',
    emailNotifications: user?.emailNotifications ?? true,
    eventReminders: user?.eventReminders ?? true,
  });

  useEffect(() => {
    setFormData({
      name: user?.fullName || user?.name || '',
      email: user?.email || '',
      language: user?.language || 'en',
      emailNotifications: user?.emailNotifications ?? true,
      eventReminders: user?.eventReminders ?? true,
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setIsSaved(false);
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setSaveError('Full name must be at least 2 characters');
      return;
    }

    try {
      setIsSaving(true);
      const result = await authApi.updateMe({
        fullName: formData.name.trim(),
        language: formData.language as 'en' | 'ru' | 'kk',
        emailNotifications: formData.emailNotifications,
        eventReminders: formData.eventReminders,
      });

      if (result.user) {
        onUserUpdate?.(result.user);
        setFormData({
          name: result.user.fullName || result.user.name || '',
          email: result.user.email || '',
          language: result.user.language || 'en',
          emailNotifications: result.user.emailNotifications ?? true,
          eventReminders: result.user.eventReminders ?? true,
        });
      }

      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      setIsSaving(false);
      setSaveError(err?.message || 'Failed to save settings');
    }
  };

  const resetPasswordModalState = () => {
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
    setForgotPasswordMessage('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
    setForgotPasswordMessage('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setForgotPasswordMessage('');

    if (!changePasswordForm.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword({
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully. A confirmation email was sent to your inbox.');
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setForgotPasswordMessage('No email found for this account.');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');
      await authApi.forgotPassword(formData.email.trim().toLowerCase());
      setForgotPasswordMessage('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to send reset email');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={compactLayout ? 'space-y-4' : 'space-y-6'}>
      <div className={compactLayout ? 'mb-4' : 'mb-8'}>
        <h1 className={`${compactLayout ? 'text-2xl' : 'text-3xl'} mb-2 font-bold text-foreground dark:text-white`}>{copy.title}</h1>
        <p className="text-muted-foreground dark:text-gray-400">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className={compactLayout ? 'space-y-4' : 'space-y-8'}>
        {/* Personal Information */}
        <div className={`surface-card rounded-2xl ${compactLayout ? 'p-5' : 'p-8'} dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20`}>
          <div className={`flex items-center gap-3 ${compactLayout ? 'mb-4' : 'mb-6'}`}>
            <User className={`${compactLayout ? 'w-5 h-5' : 'w-6 h-6'} text-primary dark:text-purple-400`} />
            <h2 className="text-xl font-bold text-foreground dark:text-white">{copy.personal}</h2>
          </div>

          <div className={`grid md:grid-cols-2 ${compactLayout ? 'gap-4' : 'gap-6'}`}>
            <div>
              <Label htmlFor="name" className="text-foreground mb-2 dark:text-gray-200">
                {copy.fullName}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground mb-2 dark:text-gray-200">
                {copy.email}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                readOnly
                className="cursor-not-allowed border-border bg-input-background text-muted-foreground placeholder:text-muted-foreground opacity-70 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-400 dark:placeholder:text-gray-600"
              />
              <p className={`text-xs text-muted-foreground dark:text-gray-500 ${compactLayout ? 'mt-1' : 'mt-2'}`}>{copy.emailFixed}</p>
            </div>

            <div>
              <Label htmlFor="language" className="text-foreground mb-2 dark:text-gray-200">
                {language === 'ru' ? 'Язык' : language === 'kk' ? 'Тіл' : 'Language'}
              </Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-border bg-input-background px-3 py-1 text-foreground outline-none transition-all focus:border-purple-500 focus:ring-[3px] focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={`surface-card rounded-2xl ${compactLayout ? 'p-5' : 'p-8'} dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20`}>
          <div className={`flex items-center gap-3 ${compactLayout ? 'mb-4' : 'mb-6'}`}>
            <Lock className={`${compactLayout ? 'w-5 h-5' : 'w-6 h-6'} text-primary dark:text-purple-400`} />
            <h2 className="text-xl font-bold text-foreground dark:text-white">{copy.security}</h2>
          </div>

          <button
            type="button"
            onClick={() => {
              resetPasswordModalState();
              setIsPasswordModalOpen(true);
            }}
            className={`rounded-xl font-medium transition-all duration-300 bg-[rgba(94,72,166,0.12)] text-foreground hover:bg-[rgba(94,72,166,0.18)] dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white ${compactLayout ? 'px-5 py-2.5' : 'px-6 py-3'}`}
          >
            {copy.changePassword}
          </button>
        </div>

        {!isAdmin && !isOrganizer && !isValidator && (
          <div className="surface-card rounded-2xl p-8 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary dark:text-purple-400" />
              <h2 className="text-xl font-bold text-foreground dark:text-white">{copy.notifications}</h2>
            </div>

            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors bg-[rgba(94,72,166,0.1)] hover:bg-[rgba(94,72,166,0.14)] dark:bg-gray-800/30 dark:hover:bg-gray-800/50">
                <div>
                  <p className="mb-1 font-medium text-foreground dark:text-white">{copy.emailNotifications}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{copy.emailNotificationsDesc}</p>
                </div>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-700 bg-gray-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors bg-[rgba(94,72,166,0.1)] hover:bg-[rgba(94,72,166,0.14)] dark:bg-gray-800/30 dark:hover:bg-gray-800/50">
                <div>
                  <p className="mb-1 font-medium text-foreground dark:text-white">{copy.eventReminders}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{copy.eventRemindersDesc}</p>
                </div>
                <input
                  type="checkbox"
                  name="eventReminders"
                  checked={formData.eventReminders}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-700 bg-gray-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className={`flex items-center justify-end ${compactLayout ? 'gap-3 pt-1' : 'gap-4'}`}>
          {isSaved && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">{copy.changesSaved}</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{saveError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className={`bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center gap-2 ${compactLayout ? 'px-6 py-2.5' : 'px-8 py-3'}`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {copy.saving}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {copy.saveChanges}
              </>
            )}
          </button>
        </div>
      </form>

      <Dialog
        open={isPasswordModalOpen}
        onOpenChange={(open) => {
          setIsPasswordModalOpen(open);
          if (!open) resetPasswordModalState();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-border bg-popover text-popover-foreground dark:bg-gray-900 dark:border-purple-500/20 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground dark:text-white">{copy.changePassword}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-gray-400">
              {copy.updatePasswordDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground dark:text-gray-300">{copy.currentPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-500" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder={copy.enterCurrentPassword}
                  value={changePasswordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  className="border-border bg-input-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground dark:text-gray-300">{copy.newPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-500" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={copy.createPassword}
                  value={changePasswordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  className="border-border bg-input-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-foreground dark:text-gray-300">{copy.repeatNewPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-500" />
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={copy.repeatNewPassword}
                  value={changePasswordForm.confirmNewPassword}
                  onChange={handlePasswordFieldChange}
                  className="border-border bg-input-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {passwordSuccess}
              </div>
            )}

            {forgotPasswordMessage && (
              <div className="flex items-center gap-2 text-sm text-foreground dark:text-gray-300">
                <Mail className="w-4 h-4" />
                {forgotPasswordMessage}
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isChangingPassword}
                className="text-sm text-purple-500 hover:text-purple-600 disabled:text-gray-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {copy.forgotPassword}
              </button>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
            >
              {isChangingPassword ? copy.updatingPassword : copy.updatePassword}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
