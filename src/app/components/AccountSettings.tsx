import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Bell, Save, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import * as authApi from '../api/auth';

interface AccountSettingsProps {
  user: any;
  onUserUpdate?: (user: any) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUserUpdate }) => {
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
        <h1 className={`${compactLayout ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-2`}>Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information and security</p>
      </div>

      <form onSubmit={handleSave} className={compactLayout ? 'space-y-4' : 'space-y-8'}>
        {/* Personal Information */}
        <div className={`surface-card rounded-2xl ${compactLayout ? 'p-5' : 'p-8'}`}>
          <div className={`flex items-center gap-3 ${compactLayout ? 'mb-4' : 'mb-6'}`}>
            <User className={`${compactLayout ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} />
            <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
          </div>

          <div className={`grid md:grid-cols-2 ${compactLayout ? 'gap-4' : 'gap-6'}`}>
            <div>
              <Label htmlFor="name" className="text-foreground mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                readOnly
                className="bg-accent border-border text-muted-foreground placeholder:text-muted-foreground opacity-80 cursor-not-allowed"
              />
              <p className={`text-xs text-muted-foreground ${compactLayout ? 'mt-1' : 'mt-2'}`}>Email cannot be changed.</p>
            </div>

            <div>
              <Label htmlFor="language" className="text-foreground mb-2">
                Language
              </Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full h-9 rounded-md bg-input-background border border-border text-foreground px-3 py-1 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-[3px] outline-none transition-all"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={`surface-card rounded-2xl ${compactLayout ? 'p-5' : 'p-8'}`}>
          <div className={`flex items-center gap-3 ${compactLayout ? 'mb-4' : 'mb-6'}`}>
            <Lock className={`${compactLayout ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} />
            <h2 className="text-xl font-bold text-foreground">Security</h2>
          </div>

          <button
            type="button"
            onClick={() => {
              resetPasswordModalState();
              setIsPasswordModalOpen(true);
            }}
            className={`bg-accent hover:bg-purple-600/12 text-foreground rounded-xl font-medium transition-all duration-300 ${compactLayout ? 'px-5 py-2.5' : 'px-6 py-3'}`}
          >
            Change Password
          </button>
        </div>

        {!isAdmin && !isOrganizer && !isValidator && (
          <div className="surface-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-accent/80 rounded-xl cursor-pointer hover:bg-accent transition-colors">
                <div>
                  <p className="text-foreground font-medium mb-1">Email Notifications</p>
                  <p className="text-muted-foreground text-sm">Receive updates about your tickets and events</p>
                </div>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border bg-input-background text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-accent/80 rounded-xl cursor-pointer hover:bg-accent transition-colors">
                <div>
                  <p className="text-foreground font-medium mb-1">Event Reminders</p>
                  <p className="text-muted-foreground text-sm">Remind me 24 hours before an event</p>
                </div>
                <input
                  type="checkbox"
                  name="eventReminders"
                  checked={formData.eventReminders}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border bg-input-background text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
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
              <span className="font-medium">Changes saved!</span>
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
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
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
        <DialogContent className="bg-popover border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your password and keep your account secure
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={changePasswordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  className="pl-10 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Create a new password"
                  value={changePasswordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  className="pl-10 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-foreground">Repeat New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  value={changePasswordForm.confirmNewPassword}
                  onChange={handlePasswordFieldChange}
                  className="pl-10 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                {forgotPasswordMessage}
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isChangingPassword}
                className="text-sm text-purple-600 hover:text-purple-500 disabled:text-muted-foreground"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
