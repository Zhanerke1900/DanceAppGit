import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, Calendar, MapPin, Type, FileText, Image as ImageIcon, Clock, Save, Send, Plus, Trash2, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface CreateEventProps {
  onBack: () => void;
  onSave: (eventData: any, isDraft: boolean) => Promise<any>;
  initialEvent?: any | null;
  mode?: 'create' | 'edit';
}

type EventType = 'usual-event' | 'special-program' | '';

type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  ticketLimit: string;
  type: 'Masterclass' | 'Battle' | 'Contest' | 'Camp';
  instructor: string;
  price: string;
  organizerName: string;
  organizerRole: 'Host' | 'Co-organizer';
};

const cities = [
  'Astana',
  'Almaty',
  'Shymkent',
  'Aktobe',
  'Karaganda',
  'Taraz',
  'Pavlodar',
  'Atyrau',
];

const usualEventCategories = ['Hip Hop', 'Contemporary', 'Ballet', 'Latin', 'Ballroom'];
const specialProgramCategories = ['Festivals', 'Competitions', 'Masterclasses', 'Camps'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const timeOptions = Array.from({ length: 24 * 2 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

const formatLocalDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEmptyScheduleItem = (): ScheduleItem => ({
  id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  time: '',
  title: '',
  description: '',
  location: '',
  ticketLimit: '',
  type: 'Masterclass',
  instructor: '',
  price: '',
  organizerName: '',
  organizerRole: 'Host',
});

const extractDigits = (value: string | number | undefined | null) => String(value || '').replace(/\D/g, '');

const buildFormDataFromEvent = (event?: any | null) => ({
  title: event?.title || '',
  eventType: (event?.eventType || '') as EventType,
  category: event?.category || '',
  date: event?.date || '',
  time: event?.time || '',
  city: event?.city || '',
  venue: event?.venue || '',
  address: event?.address || '',
  description: event?.description || '',
  longDescription: event?.longDescription || '',
  targetAudience: event?.targetAudience || '',
  highlights: Array.isArray(event?.highlights) ? event.highlights.join('\n') : '',
  ageRestriction: event?.ageRestriction || '',
  dressCode: event?.dressCode || '',
  ticketPrice: extractDigits(event?.ticketPricing?.generalAdmission || event?.price),
  ticketLimit: String(event?.ticketLimit || ''),
  hasFullEventPass: Boolean(event?.ticketPricing?.fullEventPass || event?.fullPassPrice),
  fullEventPassPrice: extractDigits(event?.ticketPricing?.fullEventPass || event?.fullPassPrice),
  fullEventPassDiscount: extractDigits(event?.ticketPricing?.fullEventPassDiscount || event?.fullPassDiscount) || '20',
});

const buildScheduleFromEvent = (event?: any | null): ScheduleItem[] => {
  if (!event) return [createEmptyScheduleItem()];

  if (event.eventType === 'special-program' && Array.isArray(event.activities) && event.activities.length > 0) {
    return event.activities.map((activity: any, index: number) => ({
      id: activity.id || `schedule-${index + 1}`,
      time: activity.time || '',
      title: activity.name || '',
      description: activity.description || '',
      location: activity.location || '',
      ticketLimit: activity.ticketLimit ? String(activity.ticketLimit) : '',
      type: activity.type || 'Masterclass',
      instructor: activity.instructor || '',
      price: activity.price ? String(activity.price) : '',
      organizerName: activity.organizer?.name || '',
      organizerRole: activity.organizer?.role || 'Host',
    }));
  }

  if (Array.isArray(event.schedule) && event.schedule.length > 0) {
    return event.schedule.map((item: any, index: number) => ({
      id: item.id || `schedule-${index + 1}`,
      time: item.time || '',
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      ticketLimit: '',
      type: 'Masterclass',
      instructor: '',
      price: '',
      organizerName: '',
      organizerRole: 'Host',
    }));
  }

  return [createEmptyScheduleItem()];
};

const formatPrice = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `${Number(digits).toLocaleString('en-US')} KZT`;
};

export const CreateEvent: React.FC<CreateEventProps> = ({ onBack, onSave, initialEvent = null, mode = 'create' }) => {
  const [formData, setFormData] = useState(() => buildFormDataFromEvent(initialEvent));
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => buildScheduleFromEvent(initialEvent));
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(initialEvent?.image || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [activeScheduleTimeId, setActiveScheduleTimeId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const current = initialEvent?.date ? new Date(`${initialEvent.date}T00:00:00`) : new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });
  const isEditMode = mode === 'edit';
  const isPublishedEdit = initialEvent?.status === 'published';
  const isDraftEdit = initialEvent?.status === 'draft';

  useEffect(() => {
    setFormData(buildFormDataFromEvent(initialEvent));
    setSchedule(buildScheduleFromEvent(initialEvent));
    setPosterFile(null);
    setPosterPreview(initialEvent?.image || null);
    setErrors({});
    setSubmitError('');
    setSubmitSuccess('');
    setCalendarMonth(() => {
      const current = initialEvent?.date ? new Date(`${initialEvent.date}T00:00:00`) : new Date();
      return new Date(current.getFullYear(), current.getMonth(), 1);
    });
  }, [initialEvent]);

  const categoryOptions =
    formData.eventType === 'usual-event'
      ? usualEventCategories
      : formData.eventType === 'special-program'
        ? specialProgramCategories
        : [];

  const formatDateLabel = (value: string) => {
    if (!value) return 'Pick a date';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTimeLabel = (value: string) => {
    if (!value) return 'Pick a time';
    const [hours, minutes] = value.split(':');
    if (!hours || !minutes) return value;
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startOffset + 1;
      const date = new Date(year, monthIndex, dayNumber);
      const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      date.setHours(0, 0, 0, 0);
      return {
        key: `${year}-${monthIndex}-${index}`,
        label: date.getDate(),
        value: isCurrentMonth ? formatLocalDateISO(date) : '',
        isCurrentMonth,
        isPast: date.getTime() < today.getTime(),
      };
    });
  };

  const calendarDays = getCalendarDays(calendarMonth);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === 'hasFullEventPass') {
        return { ...prev, hasFullEventPass: value === 'true' };
      }
      return { ...prev, [field]: value };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleEventTypeChange = (value: EventType) => {
    setFormData((prev) => ({
      ...prev,
      eventType: value,
      category: '',
    }));
    setErrors((prev) => ({
      ...prev,
      eventType: '',
      category: '',
    }));
  };

  const handleScheduleChange = (id: string, field: keyof Omit<ScheduleItem, 'id'>, value: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    if (errors.schedule) {
      setErrors((prev) => ({ ...prev, schedule: '' }));
    }
  };

  const addScheduleItem = () => {
    setSchedule((prev) => [...prev, createEmptyScheduleItem()]);
  };

  const removeScheduleItem = (id: string) => {
    setSchedule((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, poster: 'File size must be less than 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, poster: 'Please upload an image file' }));
      return;
    }

    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, poster: '' }));
  };

  const removePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) nextErrors.title = 'Event title is required';
    if (!formData.eventType) nextErrors.eventType = 'Please choose an event type';
    if (!formData.category) nextErrors.category = 'Please choose a category';
    if (!formData.date) nextErrors.date = 'Date is required';
    if (!formData.time) nextErrors.time = 'Time is required';
    if (!formData.city) nextErrors.city = 'Please select a city';
    if (!formData.venue.trim()) nextErrors.venue = 'Venue name is required';
    if (!formData.address.trim()) nextErrors.address = 'Address is required';
    if (!formData.description.trim()) nextErrors.description = 'Description is required';
    if (!formData.ageRestriction.trim()) nextErrors.ageRestriction = 'Age restriction is required';
    if (!formData.dressCode.trim()) nextErrors.dressCode = 'Dress code is required';
    if (formData.eventType === 'usual-event' && !formData.ticketPrice.trim()) {
      nextErrors.ticketPrice = 'General admission price is required';
    }
    if (formData.eventType === 'special-program' && formData.hasFullEventPass && !formData.fullEventPassPrice.trim()) {
      nextErrors.fullEventPassPrice = 'Full Event Pass price is required';
    }
    if (!posterFile && !posterPreview) nextErrors.poster = 'Event poster is required';

    const hasValidSchedule = schedule.some(
      (item) =>
        item.time.trim() &&
        item.title.trim() &&
        (formData.eventType === 'special-program' ? item.location.trim() : true) &&
        (formData.eventType !== 'special-program' || item.price.trim())
    );
    if (!hasValidSchedule) {
      nextErrors.schedule =
        formData.eventType === 'special-program'
          ? 'Add at least one activity with time, title, location, and price'
          : 'Add at least one schedule item with time and title';
    }

    if (formData.eventType === 'special-program') {
      if (!formData.longDescription.trim()) nextErrors.longDescription = 'Detailed program description is required';
      if (!formData.targetAudience.trim()) nextErrors.targetAudience = 'Target audience is required';
      if (!formData.highlights.trim()) nextErrors.highlights = 'Add at least one highlight';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (status: 'draft' | 'pending') => {
    const cleanedSchedule = schedule
      .filter((item) => item.time.trim() || item.title.trim() || item.description.trim() || (formData.eventType === 'special-program' && item.location.trim()))
      .map((item) => ({
        time: item.time.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
        location: formData.eventType === 'special-program' ? item.location.trim() : '',
      }));

    const activities = formData.eventType === 'special-program'
      ? schedule
          .filter((item) => item.time.trim() || item.title.trim() || item.description.trim() || item.location.trim())
          .map((item, index) => ({
            id: item.id || `activity-${index + 1}`,
            name: item.title.trim(),
            type: item.type,
            time: item.time.trim(),
            description: item.description.trim(),
            instructor: item.instructor.trim() || undefined,
            price: Number(item.price.replace(/\D/g, '') || 0),
            ticketLimit: Number(item.ticketLimit.replace(/\D/g, '') || 0),
            organizer: item.organizerName.trim()
              ? {
                  name: item.organizerName.trim(),
                  role: item.organizerRole,
                }
              : undefined,
            location: item.location.trim(),
          }))
      : [];

    const highlights = formData.highlights
      .split('\n')
      .map((item) => item.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);

    return {
      ...formData,
      poster: posterFile,
      image: posterPreview,
      category: formData.category,
      location: `${formData.venue.trim()}, ${formData.city}`.trim(),
      venue: formData.venue.trim(),
      address: formData.address.trim(),
      price:
        formData.eventType === 'special-program'
          ? (formData.hasFullEventPass ? formatPrice(formData.fullEventPassPrice) : 'Activity pricing')
          : formatPrice(formData.ticketPrice),
      longDescription: formData.longDescription.trim() || formData.description.trim(),
      targetAudience: formData.targetAudience.trim(),
      highlights,
      ticketPricing: {
        generalAdmission: formData.eventType === 'usual-event' ? formatPrice(formData.ticketPrice) : '',
        fullEventPass: formData.eventType === 'special-program' && formData.hasFullEventPass ? formatPrice(formData.fullEventPassPrice) : '',
        fullEventPassDiscount: formData.eventType === 'special-program' && formData.hasFullEventPass ? `${formData.fullEventPassDiscount.replace(/\D/g, '') || '0'}%` : '',
      },
      ticketLimit: Number((formData as any).ticketLimit?.replace(/\D/g, '') || 0),
      fullPassPrice: formData.eventType === 'special-program' && formData.hasFullEventPass ? Number(formData.fullEventPassPrice.replace(/\D/g, '') || 0) : 0,
      fullPassDiscount: formData.eventType === 'special-program' && formData.hasFullEventPass ? Number(formData.fullEventPassDiscount.replace(/\D/g, '') || 0) : 0,
      schedule: cleanedSchedule,
      activities,
      status,
    };
  };

  const handleSaveAsDraft = () => {
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmittingDraft(true);
    onSave(buildPayload('draft'), true)
      .then((response) => {
        setSubmitSuccess(response?.message || 'Draft saved');
      })
      .catch((error: any) => {
        setSubmitError(error?.message || 'Failed to save draft');
      })
      .finally(() => setIsSubmittingDraft(false));
  };

  const handleSendForApproval = () => {
    if (!validateForm()) return;
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmittingReview(true);
    onSave(buildPayload('pending'), false)
      .then((response) => {
        setSubmitSuccess(response?.message || 'Event sent for review');
      })
      .catch((error: any) => {
        setSubmitError(error?.message || 'Failed to send event for approval');
      })
      .finally(() => setIsSubmittingReview(false));
  };

  const handleSaveChanges = () => {
    const shouldValidate = !isDraftEdit;
    if (shouldValidate && !validateForm()) return;

    const nextStatus = isDraftEdit ? 'draft' : initialEvent?.status === 'pending' ? 'pending' : 'published';
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmittingReview(true);
    onSave(buildPayload(nextStatus), false)
      .then((response) => {
        setSubmitSuccess(response?.message || 'Changes saved');
      })
      .catch((error: any) => {
        setSubmitError(error?.message || 'Failed to save changes');
      })
      .finally(() => setIsSubmittingReview(false));
  };

  const handleDraftEditSave = () => {
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmittingDraft(true);
    onSave(buildPayload('draft'), true)
      .then((response) => {
        setSubmitSuccess(response?.message || 'Draft saved');
      })
      .catch((error: any) => {
        setSubmitError(error?.message || 'Failed to save draft');
      })
      .finally(() => setIsSubmittingDraft(false));
  };

  const handleDraftEditSendForApproval = () => {
    if (!validateForm()) return;
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmittingReview(true);
    onSave(buildPayload('pending'), false)
      .then((response) => {
        setSubmitSuccess(response?.message || 'Event sent for review');
      })
      .catch((error: any) => {
        setSubmitError(error?.message || 'Failed to send event for approval');
      })
      .finally(() => setIsSubmittingReview(false));
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Events</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-gray-400">
            {isEditMode
              ? isPublishedEdit
                ? 'Minor published changes save instantly, while critical changes go back to admin review.'
                : 'Update this event and save the latest version for your dashboard.'
              : 'Build a polished event card with the same structure users already see on the main site.'}
          </p>
        </div>

        <form className="space-y-5">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Type className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Astana Hip Hop Showcase"
                  className={`w-full bg-gray-800/50 border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-2">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Type *</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    {
                      value: 'usual-event' as EventType,
                      label: 'Usual Event',
                      description: 'Classic city events for the main Events section.',
                    },
                    {
                      value: 'special-program' as EventType,
                      label: 'Special Program',
                      description: 'Large-format or premium experiences for the Special Programs section.',
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleEventTypeChange(type.value)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        formData.eventType === type.value
                          ? 'border-purple-500 bg-purple-600/15 shadow-lg shadow-purple-600/10'
                          : 'border-gray-700 bg-gray-800/30 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="text-white font-semibold">{type.label}</div>
                      <p className="text-gray-400 text-sm mt-1.5">{type.description}</p>
                    </button>
                  ))}
                </div>
                {errors.eventType && <p className="text-red-400 text-sm mt-2">{errors.eventType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {formData.eventType === 'special-program' ? 'Program Category *' : 'Dance Category *'}
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryOptions.length > 0 ? categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInputChange('category', option)}
                      className={`rounded-xl border px-4 py-3 text-left font-medium transition-all ${
                        formData.category === option
                          ? 'border-purple-500 bg-purple-600/15 text-white'
                          : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-purple-500/50'
                      }`}
                    >
                      {option}
                    </button>
                  )) : (
                    <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 px-4 py-3 text-sm text-gray-500 sm:col-span-2 lg:col-span-3">
                      Choose an event type first.
                    </div>
                  )}
                </div>
                {errors.category && <p className="text-red-400 text-sm mt-2">{errors.category}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Date & Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Date *</label>
                <button
                  type="button"
                  onClick={() => setIsDateDialogOpen(true)}
                  className={`w-full flex items-center justify-between gap-3 bg-gray-800/50 border ${errors.date ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl hover:border-purple-500/60 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className={formData.date ? 'text-white' : 'text-gray-500'}>
                      {formatDateLabel(formData.date)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">Choose</span>
                </button>
                {errors.date && <p className="text-red-400 text-sm mt-2">{errors.date}</p>}
                <p className="text-gray-500 text-xs mt-2">Tap any day in the calendar. The saved date now matches exactly what you choose.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time *</label>
                <button
                  type="button"
                  onClick={() => setIsTimeDialogOpen(true)}
                  className={`w-full flex items-center justify-between gap-3 bg-gray-800/50 border ${errors.time ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl hover:border-purple-500/60 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className={formData.time ? 'text-white' : 'text-gray-500'}>
                      {formatTimeLabel(formData.time)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">Choose</span>
                </button>
                {errors.time && <p className="text-red-400 text-sm mt-2">{errors.time}</p>}
                <p className="text-gray-500 text-xs mt-2">Pick a start time from the list and the picker closes automatically.</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleInputChange('city', city)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      formData.city === city
                        ? 'border-purple-500 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/10 text-white'
                        : 'border-gray-700 bg-gray-800/20 text-gray-300 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">{city}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.city && <p className="text-red-400 text-sm mt-2">{errors.city}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name *</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="e.g., Congress Center"
                  className={`w-full bg-gray-800/50 border ${errors.venue ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                />
                {errors.venue && <p className="text-red-400 text-sm mt-2">{errors.venue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address / Location *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="e.g., 1 Mangilik El Ave, Astana"
                  className={`w-full bg-gray-800/50 border ${errors.address ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                />
                {errors.address && <p className="text-red-400 text-sm mt-2">{errors.address}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Event Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the atmosphere, concept, lineup, and what guests should expect."
                  rows={5}
                  className={`w-full bg-gray-800/50 border ${errors.description ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? <p className="text-red-400 text-sm">{errors.description}</p> : <span />}
                  <p className="text-gray-500 text-sm">{formData.description.length} characters</p>
                </div>
              </div>

              {formData.eventType === 'special-program' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Long Description *</label>
                    <textarea
                      value={formData.longDescription}
                      onChange={(e) => handleInputChange('longDescription', e.target.value)}
                      placeholder="Full detailed description for the special program page."
                      rows={4}
                      className={`w-full bg-gray-800/50 border ${errors.longDescription ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none`}
                    />
                    {errors.longDescription && <p className="text-red-400 text-sm mt-2">{errors.longDescription}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience *</label>
                      <textarea
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="Who this program is for."
                        rows={3}
                        className={`w-full bg-gray-800/50 border ${errors.targetAudience ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none`}
                      />
                      {errors.targetAudience && <p className="text-red-400 text-sm mt-2">{errors.targetAudience}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Highlights *</label>
                      <textarea
                        value={formData.highlights}
                        onChange={(e) => handleInputChange('highlights', e.target.value)}
                        placeholder={`One highlight per line\nInternational guest instructors\nNetworking opportunities`}
                        rows={3}
                        className={`w-full bg-gray-800/50 border ${errors.highlights ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none`}
                      />
                      {errors.highlights && <p className="text-red-400 text-sm mt-2">{errors.highlights}</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Restriction *</label>
                  <input
                    type="text"
                    value={formData.ageRestriction}
                    onChange={(e) => handleInputChange('ageRestriction', e.target.value)}
                    placeholder="e.g., 16+ or All Ages"
                    className={`w-full bg-gray-800/50 border ${errors.ageRestriction ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                  />
                  {errors.ageRestriction && <p className="text-red-400 text-sm mt-2">{errors.ageRestriction}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dress Code *</label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) => handleInputChange('dressCode', e.target.value)}
                    placeholder="e.g., Streetwear / Smart Casual / Training Clothes"
                    className={`w-full bg-gray-800/50 border ${errors.dressCode ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                  />
                  {errors.dressCode && <p className="text-red-400 text-sm mt-2">{errors.dressCode}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {formData.eventType === 'special-program' ? 'Program Activities' : 'Schedule'}
              </h2>
            </div>

            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">
                      {formData.eventType === 'special-program' ? `Activity ${index + 1}` : `Schedule Item ${index + 1}`}
                    </h3>
                    {schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduleItem(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 ${formData.eventType === 'special-program' ? 'md:grid-cols-2' : ''} gap-3`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScheduleTimeId(item.id);
                        setIsTimeDialogOpen(true);
                      }}
                      className="w-full flex items-center justify-between gap-3 bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl hover:border-purple-500/60 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className={item.time ? 'text-white' : 'text-gray-500'}>
                          {formatTimeLabel(item.time)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-300">Choose</span>
                    </button>
                    {formData.eventType === 'special-program' && (
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => handleScheduleChange(item.id, 'location', e.target.value)}
                        placeholder="Stage / Room / Studio"
                        className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                    )}
                  </div>

                  {formData.eventType === 'special-program' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <select
                        value={item.type}
                        onChange={(e) => handleScheduleChange(item.id, 'type', e.target.value)}
                        className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      >
                        <option value="Masterclass">Masterclass</option>
                        <option value="Battle">Battle</option>
                        <option value="Contest">Contest</option>
                        <option value="Camp">Camp</option>
                      </select>
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handleScheduleChange(item.id, 'price', e.target.value)}
                        placeholder="Activity price"
                        className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 mt-3">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleScheduleChange(item.id, 'title', e.target.value)}
                      placeholder={formData.eventType === 'special-program' ? 'Session title' : 'Schedule title'}
                      className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    {formData.eventType === 'special-program' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={item.instructor}
                          onChange={(e) => handleScheduleChange(item.id, 'instructor', e.target.value)}
                          placeholder="Instructor or judge"
                          className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                        <input
                          type="text"
                          value={item.organizerName}
                          onChange={(e) => handleScheduleChange(item.id, 'organizerName', e.target.value)}
                          placeholder="Organizer name"
                          className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                        <select
                          value={item.organizerRole}
                          onChange={(e) => handleScheduleChange(item.id, 'organizerRole', e.target.value)}
                          className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        >
                          <option value="Host">Host</option>
                          <option value="Co-organizer">Co-organizer</option>
                        </select>
                      </div>
                    )}
                    {formData.eventType === 'special-program' && (
                      <input
                        type="text"
                        value={item.ticketLimit}
                        onChange={(e) => handleScheduleChange(item.id, 'ticketLimit', e.target.value)}
                        placeholder="Activity ticket limit (optional)"
                        className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                    )}
                    <textarea
                      value={item.description}
                      onChange={(e) => handleScheduleChange(item.id, 'description', e.target.value)}
                      placeholder={formData.eventType === 'special-program' ? 'Short description of this part of the program' : 'Optional description'}
                      rows={2}
                      className="w-full bg-gray-800/60 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {errors.schedule && <p className="text-red-400 text-sm mt-4">{errors.schedule}</p>}

            <button
              type="button"
              onClick={addScheduleItem}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-2.5 text-purple-300 transition-colors hover:bg-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              {formData.eventType === 'special-program' ? 'Add Activity' : 'Add Schedule Item'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Ticket className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Ticket Pricing</h2>
            </div>

            {formData.eventType === 'special-program' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Overall Ticket Limit</label>
                  <input
                    type="text"
                    value={(formData as any).ticketLimit}
                    onChange={(e) => handleInputChange('ticketLimit', e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                  <p className="text-gray-500 text-sm mt-2">Optional global limit for the whole special program.</p>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-700 bg-gray-800/30 px-4 py-4 cursor-pointer hover:border-purple-500/40 transition-colors">
                  <div>
                    <p className="text-white font-semibold">Enable Full Event Pass</p>
                    <p className="text-sm text-gray-400">Optional pass for all activities with a discount compared to buying them separately.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hasFullEventPass}
                    onChange={(e) => handleInputChange('hasFullEventPass', e.target.checked ? 'true' : 'false')}
                    className="h-5 w-5 rounded border-gray-700 bg-gray-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                </label>

                {formData.hasFullEventPass && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Event Pass Price *</label>
                      <input
                        type="text"
                        value={formData.fullEventPassPrice}
                        onChange={(e) => handleInputChange('fullEventPassPrice', e.target.value)}
                        placeholder="e.g., 20000"
                        className={`w-full bg-gray-800/50 border ${errors.fullEventPassPrice ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                      />
                      <p className="text-gray-500 text-sm mt-2">{formatPrice(formData.fullEventPassPrice) || 'Price will appear like 20,000 KZT'}</p>
                      {errors.fullEventPassPrice && <p className="text-red-400 text-sm mt-2">{errors.fullEventPassPrice}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Savings Percent</label>
                      <input
                        type="text"
                        value={formData.fullEventPassDiscount}
                        onChange={(e) => handleInputChange('fullEventPassDiscount', e.target.value)}
                        placeholder="e.g., 20"
                        className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                      <p className="text-gray-500 text-sm mt-2">
                        {formData.fullEventPassDiscount ? `${formData.fullEventPassDiscount.replace(/\D/g, '') || 0}% off` : 'Set the discount percentage'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">General Admission Price *</label>
                  <input
                    type="text"
                    value={formData.ticketPrice}
                    onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                    placeholder="e.g., 5000"
                    className={`w-full bg-gray-800/50 border ${errors.ticketPrice ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                  />
                  <p className="text-gray-500 text-sm mt-2">{formatPrice(formData.ticketPrice) || 'Price will appear like 5,000 KZT'}</p>
                  {errors.ticketPrice && <p className="text-red-400 text-sm mt-2">{errors.ticketPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Limit</label>
                  <input
                    type="text"
                    value={(formData as any).ticketLimit}
                    onChange={(e) => handleInputChange('ticketLimit', e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                  <p className="text-gray-500 text-sm mt-2">Set the maximum number of tickets available for this event.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <ImageIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Event Poster</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Poster Image *</label>

              {!posterPreview ? (
                <label
                  className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed ${errors.poster ? 'border-red-500' : 'border-gray-700'} rounded-xl cursor-pointer hover:border-purple-500 transition-all duration-300 bg-gray-800/30 hover:bg-gray-800/50 group`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-purple-600/20 rounded-full mb-4 group-hover:bg-purple-600/30 transition-colors">
                      <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold text-white">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePosterUpload} />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-700 group">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removePoster}
                      className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-full text-sm text-white">
                    {posterFile?.name || 'Current poster'}
                  </div>
                </div>
              )}

              {errors.poster && <p className="text-red-400 text-sm mt-2">{errors.poster}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isEditMode && isDraftEdit ? (
              <>
                <button
                  type="button"
                  onClick={handleDraftEditSave}
                  disabled={isSubmittingDraft || isSubmittingReview}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-700"
                >
                  <Save className="w-5 h-5" />
                  {isSubmittingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleDraftEditSendForApproval}
                  disabled={isSubmittingDraft || isSubmittingReview}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
                >
                  <Send className="w-5 h-5" />
                  {isSubmittingReview ? 'Sending...' : 'Send for Approval'}
                </button>
              </>
            ) : isEditMode ? (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSubmittingReview}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
              >
                <Save className="w-5 h-5" />
                {isSubmittingReview ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={isSubmittingDraft || isSubmittingReview}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-700"
                >
                  <Save className="w-5 h-5" />
                  {isSubmittingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSendForApproval}
                  disabled={isSubmittingDraft || isSubmittingReview}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
                >
                  <Send className="w-5 h-5" />
                  {isSubmittingReview ? 'Sending...' : 'Send for Approval'}
                </button>
              </>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {submitSuccess}
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> once submitted, the event keeps the same content structure as the cards and detail pages users already know on DanceTime.
            </p>
          </div>
        </form>
      </div>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="bg-gray-950 border border-purple-500/20 text-gray-100 max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="text-2xl text-white">Choose Event Date</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pick the day when your event starts.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-white/5 bg-gray-900 p-4">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="rounded-xl bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  Prev
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={calendarMonth.getMonth()}
                    onChange={(e) => setCalendarMonth(new Date(calendarMonth.getFullYear(), Number(e.target.value), 1))}
                    className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={calendarMonth.getFullYear()}
                    onChange={(e) => setCalendarMonth(new Date(Number(e.target.value), calendarMonth.getMonth(), 1))}
                    className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {Array.from({ length: 6 }, (_, index) => new Date().getFullYear() + index).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="rounded-xl bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  Next
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {weekdays.map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const isSelected = formData.date === day.value;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      disabled={!day.isCurrentMonth || day.isPast}
                      onClick={() => {
                        if (!day.value) return;
                        handleInputChange('date', day.value);
                        setIsDateDialogOpen(false);
                      }}
                      className={`h-11 rounded-xl text-sm font-medium transition-all ${
                        !day.isCurrentMonth
                          ? 'invisible'
                          : day.isPast
                            ? 'cursor-not-allowed bg-gray-900 text-gray-700'
                            : isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30'
                              : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
        <DialogContent className="bg-gray-950 border border-purple-500/20 text-gray-100 max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="text-2xl text-white">Choose Start Time</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select the time guests should arrive.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-white/5 bg-gray-900 p-3 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {timeOptions.map((time) => {
                  const selectedTime = activeScheduleTimeId
                    ? schedule.find((item) => item.id === activeScheduleTimeId)?.time || ''
                    : formData.time;
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        if (activeScheduleTimeId) {
                          handleScheduleChange(activeScheduleTimeId, 'time', time);
                          setActiveScheduleTimeId(null);
                        } else {
                          handleInputChange('time', time);
                        }
                        setIsTimeDialogOpen(false);
                      }}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30'
                          : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {formatTimeLabel(time)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
