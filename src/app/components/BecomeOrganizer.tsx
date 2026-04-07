import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, Globe, Facebook, Instagram, Mail, Phone, Building2 } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import * as authApi from '../api/auth';
import { useI18n } from '../i18n';

interface BecomeOrganizerProps {
  onBack: () => void;
  user?: any;
  onUserUpdate?: (user: any) => void;
  onOpenAuth?: (view: 'login' | 'register') => void;
}

export const BecomeOrganizer: React.FC<BecomeOrganizerProps> = ({ onBack, user, onUserUpdate, onOpenAuth }) => {
  const { language } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [formData, setFormData] = useState({
    organizationName: '',
    description: '',
    email: user?.email || '',
    phone: '',
    website: '',
    instagram: '',
    facebook: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const copy = {
    submittedTitle: language === 'ru' ? 'Заявка отправлена!' : language === 'kk' ? 'Өтінім жіберілді!' : 'Application Submitted!',
    submittedDescription: language === 'ru'
      ? 'Ваша заявка на рассмотрении. Наша команда свяжется с вами в течение 2-3 рабочих дней.'
      : language === 'kk'
        ? 'Өтініміңіз қаралуда. Біздің команда 2-3 жұмыс күні ішінде сізбен байланысады.'
        : 'Your application is under review. Our team will get back to you within 2-3 business days.',
    applicationId: language === 'ru' ? 'ID заявки' : language === 'kk' ? 'Өтінім ID' : 'Application ID',
    backToHome: language === 'ru' ? 'На главную' : language === 'kk' ? 'Басты бетке' : 'Back to Home',
    back: language === 'ru' ? 'Назад' : language === 'kk' ? 'Артқа' : 'Back',
    title: language === 'ru' ? 'Стать организатором' : language === 'kk' ? 'Ұйымдастырушы болу' : 'Become an Organizer',
    subtitle: language === 'ru'
      ? 'Присоединяйтесь к нашей сети организаторов и проводите танцевальные события по всему Казахстану.'
      : language === 'kk'
        ? 'Ұйымдастырушылар желісіне қосылып, Қазақстан бойынша би іс-шараларын өткізіңіз.'
        : 'Join our network of event organizers and start hosting amazing dance events across Kazakhstan.',
    organizationName: language === 'ru' ? 'Название организации / команды *' : language === 'kk' ? 'Ұйым / команда атауы *' : 'Organization / Team Name *',
    organizationPlaceholder: language === 'ru' ? 'например, Almaty Dance Studio' : language === 'kk' ? 'мысалы, Almaty Dance Studio' : 'e.g., Almaty Dance Studio',
    description: language === 'ru' ? 'Описание *' : language === 'kk' ? 'Сипаттама *' : 'Description *',
    descriptionPlaceholder: language === 'ru'
      ? 'Расскажите об организации, опыте проведения событий и какие мероприятия вы планируете проводить...'
      : language === 'kk'
        ? 'Ұйымыңыз, іс-шара өткізу тәжірибеңіз және қандай іс-шаралар өткізгіңіз келетіні туралы жазыңыз...'
        : 'Tell us about your organization, your experience organizing events, and what type of events you plan to host...',
    minCharacters: (count: number) => language === 'ru'
      ? `${count} / минимум 50 символов`
      : language === 'kk'
        ? `${count} / кемінде 50 таңба`
        : `${count} / 50 characters minimum`,
    contactEmail: language === 'ru' ? 'Контактный email *' : language === 'kk' ? 'Байланыс email *' : 'Contact Email *',
    phoneNumber: language === 'ru' ? 'Номер телефона *' : language === 'kk' ? 'Телефон нөмірі *' : 'Phone Number *',
    socialLinks: language === 'ru' ? 'Социальные сети (необязательно)' : language === 'kk' ? 'Әлеуметтік желілер (міндетті емес)' : 'Social Media Links (Optional)',
    website: language === 'ru' ? 'Сайт' : language === 'kk' ? 'Сайт' : 'Website',
    instagram: 'Instagram',
    facebook: 'Facebook',
    submitting: language === 'ru' ? 'Отправка...' : language === 'kk' ? 'Жіберілуде...' : 'Submitting...',
    submit: language === 'ru' ? 'Отправить заявку' : language === 'kk' ? 'Өтінімді жіберу' : 'Submit Application',
    agreement: language === 'ru'
      ? 'Отправляя форму, вы соглашаетесь с Условиями сервиса и Политикой конфиденциальности.'
      : language === 'kk'
        ? 'Форманы жіберу арқылы сіз Қызмет көрсету шарттары мен Құпиялылық саясатымен келісесіз.'
        : 'By submitting this form, you agree to our Terms of Service and Privacy Policy.',
    errors: {
      organizationName: language === 'ru' ? 'Название организации обязательно' : language === 'kk' ? 'Ұйым атауы міндетті' : 'Organization name is required',
      descriptionRequired: language === 'ru' ? 'Описание обязательно' : language === 'kk' ? 'Сипаттама міндетті' : 'Description is required',
      descriptionLength: language === 'ru' ? 'Описание должно быть не короче 50 символов' : language === 'kk' ? 'Сипаттама кемінде 50 таңба болуы керек' : 'Description must be at least 50 characters',
      emailRequired: language === 'ru' ? 'Email обязателен' : language === 'kk' ? 'Email міндетті' : 'Email is required',
      emailInvalid: language === 'ru' ? 'Введите корректный email' : language === 'kk' ? 'Дұрыс email енгізіңіз' : 'Please enter a valid email address',
      phoneRequired: language === 'ru' ? 'Номер телефона обязателен' : language === 'kk' ? 'Телефон нөмірі міндетті' : 'Phone number is required',
      phoneInvalid: language === 'ru' ? 'Введите корректный номер телефона' : language === 'kk' ? 'Дұрыс телефон нөмірін енгізіңіз' : 'Please enter a valid phone number',
      submitFailed: language === 'ru' ? 'Не удалось отправить заявку' : language === 'kk' ? 'Өтінімді жіберу мүмкін болмады' : 'Failed to submit application',
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = copy.errors.organizationName;
    }

    if (!formData.description.trim()) {
      newErrors.description = copy.errors.descriptionRequired;
    } else if (formData.description.trim().length < 50) {
      newErrors.description = copy.errors.descriptionLength;
    }

    if (!formData.email.trim()) {
      newErrors.email = copy.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = copy.errors.emailInvalid;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = copy.errors.phoneRequired;
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = copy.errors.phoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      onOpenAuth?.('login');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authApi.submitOrganizerRequest(formData);
      if (result.user) {
        onUserUpdate?.(result.user);
      }
      setApplicationId(result.applicationId || '');
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || copy.errors.submitFailed,
      }));
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8 dark:bg-black">
        <div className="max-w-2xl mx-auto">
          <div className="surface-card rounded-2xl p-12 text-center dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-[rgba(108,82,193,0.16)] dark:bg-purple-600/20">
              <CheckCircle2 className="w-10 h-10 text-primary dark:text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4 dark:text-white">{copy.submittedTitle}</h2>
            <p className="text-muted-foreground text-lg mb-8 dark:text-gray-400">
              {copy.submittedDescription}
            </p>
            <div className="rounded-xl p-6 mb-8 bg-[rgba(108,82,193,0.1)] border border-[rgba(108,82,193,0.18)] dark:bg-purple-950/30 dark:border-purple-500/20">
              <p className="text-primary text-sm mb-2 dark:text-purple-300">{copy.applicationId}</p>
              <p className="text-foreground font-mono text-lg dark:text-white">#{applicationId || 'ORG-PENDING'}</p>
            </div>
            <button
              onClick={onBack}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
            >
              {copy.backToHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8 dark:bg-black">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-muted-foreground transition-colors group hover:text-primary dark:text-gray-400 dark:hover:text-purple-400"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{copy.back}</span>
        </button>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 dark:text-white">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-lg dark:text-gray-400">
            {copy.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="surface-card rounded-2xl p-8 md:p-10 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 dark:border-purple-500/20">
          {/* Organization Name */}
          <div className="mb-6">
            <Label htmlFor="organizationName" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
              <Building2 className="w-4 h-4 text-primary dark:text-purple-400" />
              {copy.organizationName}
            </Label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder={copy.organizationPlaceholder}
              className={`border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600 ${
                errors.organizationName ? 'border-red-500' : ''
              }`}
            />
            {errors.organizationName && (
              <p className="text-red-400 text-sm mt-2">{errors.organizationName}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <Label htmlFor="description" className="text-foreground mb-2 dark:text-gray-200">
              {copy.description}
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={copy.descriptionPlaceholder}
              rows={6}
              className={`border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600 ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.description ? (
                <p className="text-red-400 text-sm">{errors.description}</p>
              ) : (
                <p className="text-muted-foreground text-sm dark:text-gray-500">
                  {copy.minCharacters(formData.description.length)}
                </p>
              )}
            </div>
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <Label htmlFor="email" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
              <Mail className="w-4 h-4 text-primary dark:text-purple-400" />
              {copy.contactEmail}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-8">
            <Label htmlFor="phone" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
              <Phone className="w-4 h-4 text-primary dark:text-purple-400" />
              {copy.phoneNumber}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (777) 123-45-67"
              className={`border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600 ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
            )}
          </div>

          {/* Social Media Links */}
          <div className="border-t border-border pt-8 mb-8 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-foreground mb-6 dark:text-white">{copy.socialLinks}</h3>
            
            <div className="space-y-5">
              {/* Website */}
              <div>
                <Label htmlFor="website" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
                  <Globe className="w-4 h-4 text-primary dark:text-purple-400" />
                  {copy.website}
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
                />
              </div>

              {/* Instagram */}
              <div>
                <Label htmlFor="instagram" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
                  <Instagram className="w-4 h-4 text-primary dark:text-purple-400" />
                  {copy.instagram}
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourorganization"
                  className="border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
                />
              </div>

              {/* Facebook */}
              <div>
                <Label htmlFor="facebook" className="text-foreground mb-2 flex items-center gap-2 dark:text-gray-200">
                  <Facebook className="w-4 h-4 text-primary dark:text-purple-400" />
                  {copy.facebook}
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  type="text"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="facebook.com/yourpage"
                  className="border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {errors.form && (
            <p className="text-red-400 text-sm text-center mb-4">{errors.form}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {copy.submitting}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                {copy.submit}
              </>
            )}
          </button>

          <p className="text-muted-foreground text-sm text-center mt-6 dark:text-gray-500">
            {copy.agreement}
          </p>
        </form>
      </div>
    </div>
  );
};
