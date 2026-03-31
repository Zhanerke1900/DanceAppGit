import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, Globe, Facebook, Instagram, Mail, Phone, Building2 } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import * as authApi from '../api/auth';

interface BecomeOrganizerProps {
  onBack: () => void;
  user?: any;
  onUserUpdate?: (user: any) => void;
  onOpenAuth?: (view: 'login' | 'register') => void;
}

export const BecomeOrganizer: React.FC<BecomeOrganizerProps> = ({ onBack, user, onUserUpdate, onOpenAuth }) => {
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
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
        form: err?.message || 'Failed to submit application',
      }));
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Your application is under review. Our team will get back to you within 2-3 business days.
            </p>
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-6 mb-8">
              <p className="text-purple-300 text-sm mb-2">Application ID</p>
              <p className="text-white font-mono text-lg">#{applicationId || 'ORG-PENDING'}</p>
            </div>
            <button
              onClick={onBack}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become an Organizer
          </h1>
          <p className="text-gray-400 text-lg">
            Join our network of event organizers and start hosting amazing dance events across Kazakhstan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-8 md:p-10">
          {/* Organization Name */}
          <div className="mb-6">
            <Label htmlFor="organizationName" className="text-gray-200 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              Organization / Team Name *
            </Label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="e.g., Almaty Dance Studio"
              className={`bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20 ${
                errors.organizationName ? 'border-red-500' : ''
              }`}
            />
            {errors.organizationName && (
              <p className="text-red-400 text-sm mt-2">{errors.organizationName}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <Label htmlFor="description" className="text-gray-200 mb-2">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your organization, your experience organizing events, and what type of events you plan to host..."
              rows={6}
              className={`bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20 ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.description ? (
                <p className="text-red-400 text-sm">{errors.description}</p>
              ) : (
                <p className="text-gray-500 text-sm">
                  {formData.description.length} / 50 characters minimum
                </p>
              )}
            </div>
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <Label htmlFor="email" className="text-gray-200 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              Contact Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-8">
            <Label htmlFor="phone" className="text-gray-200 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-400" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (777) 123-45-67"
              className={`bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20 ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
            )}
          </div>

          {/* Social Media Links */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">Social Media Links (Optional)</h3>
            
            <div className="space-y-5">
              {/* Website */}
              <div>
                <Label htmlFor="website" className="text-gray-200 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              {/* Instagram */}
              <div>
                <Label htmlFor="instagram" className="text-gray-200 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-purple-400" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourorganization"
                  className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              {/* Facebook */}
              <div>
                <Label htmlFor="facebook" className="text-gray-200 mb-2 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-purple-400" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  type="text"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="facebook.com/yourpage"
                  className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Submit Application
              </>
            )}
          </button>

          <p className="text-gray-500 text-sm text-center mt-6">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};
