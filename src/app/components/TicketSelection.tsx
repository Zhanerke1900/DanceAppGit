import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Info, User, 
  Shirt, Minus, Plus, Instagram, Facebook, Globe, 
  ShieldCheck, AlertCircle, ShoppingCart, Ticket,
  Star, Trophy, GraduationCap, Tent, Check, Percent, Sparkles, Target, Users
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

interface Activity {
  id: string;
  name: string;
  type: 'Masterclass' | 'Battle' | 'Contest' | 'Camp';
  time: string;
  description: string;
  instructor?: string;
  price: number;
  ticketLimit?: number;
  soldTickets?: number;
  remainingTickets?: number | null;
  soldOut?: boolean;
  organizer?: {
    name: string;
    role: 'Host' | 'Co-organizer';
    avatar?: string;
  };
  location?: string;
}

interface TicketSelectionProps {
  event: any;
  onBack: () => void;
  onPurchaseComplete?: (ticketDetails: any) => void | Promise<void>;
  readOnly?: boolean;
}

const parseDisplayPrice = (value: any, fallback = 0) => {
  const digits = String(value || '').replace(/\D/g, '');
  return Number(digits || fallback);
};

export const TicketSelection = ({ event, onBack, onPurchaseComplete, readOnly = false }: TicketSelectionProps) => {
  const { language } = useI18n();
  const copy = {
    back: language === 'ru' ? 'Назад к событиям' : language === 'kk' ? 'Іс-шараларға оралу' : 'Back to Events',
    soldOut: language === 'ru' ? 'Распродано' : language === 'kk' ? 'Сатылып кетті' : 'Sold out',
    ticketsLeft: (count: number | string) => language === 'ru' ? `Осталось ${count} билетов` : language === 'kk' ? `${count} билет қалды` : `${count} tickets left`,
    aboutEvent: language === 'ru' ? 'О событии' : language === 'kk' ? 'Іс-шара туралы' : 'About the Event',
    keyHighlights: language === 'ru' ? 'Ключевые особенности' : language === 'kk' ? 'Негізгі ерекшеліктер' : 'Key Highlights',
    whoShouldAttend: language === 'ru' ? 'Для кого это событие' : language === 'kk' ? 'Кімге арналған' : 'Who Should Attend',
    activities: language === 'ru' ? 'Активности события' : language === 'kk' ? 'Іс-шара белсенділіктері' : 'Event Activities',
    organizerPreview: language === 'ru' ? 'Предпросмотр публичной страницы организатора.' : language === 'kk' ? 'Ұйымдастырушы бетінің алдын ала көрінісі.' : 'Organizer preview of the public event page.',
    selectActivities: language === 'ru' ? 'Выберите отдельные активности или полный пропуск на всё событие' : language === 'kk' ? 'Жеке белсенділіктерді немесе толық рұқсатты таңдаңыз' : 'Select individual activities or get the Full Event Pass for all',
    fullPass: language === 'ru' ? 'Полный пропуск на событие (скидка 20%)' : language === 'kk' ? 'Іс-шараға толық рұқсат (20% жеңілдік)' : 'Full Event Pass (Save 20%)',
    unavailableBecauseSoldOut: language === 'ru' ? 'Недоступно, потому что одна активность распродана' : language === 'kk' ? 'Қолжетімсіз, себебі бір белсенділік сатылып кетті' : 'Unavailable because one activity is sold out',
    overallLimit: language === 'ru' ? 'В вашем выборе достигнут общий лимит билетов' : language === 'kk' ? 'Таңдауыңызда жалпы билет лимиті толды' : 'Overall ticket limit reached in your selection',
    accessAll: language === 'ru' ? 'Доступ ко всем активностям' : language === 'kk' ? 'Барлық белсенділікке қолжетімділік' : 'Access to all activities',
    fullSchedule: language === 'ru' ? 'Полное расписание события' : language === 'kk' ? 'Іс-шараның толық кестесі' : 'Full Event Schedule',
    location: language === 'ru' ? 'Локация' : language === 'kk' ? 'Орны' : 'Location',
    openMaps: language === 'ru' ? 'Открыть в картах' : language === 'kk' ? 'Картадан ашу' : 'Open in Maps',
    selectTickets: language === 'ru' ? 'Выберите билеты' : language === 'kk' ? 'Билеттерді таңдаңыз' : 'Select Tickets',
    eventTicket: language === 'ru' ? 'Билет на событие' : language === 'kk' ? 'Іс-шара билеті' : 'Event Ticket',
    danceStyle: language === 'ru' ? 'Стиль танца' : language === 'kk' ? 'Би стилі' : 'Dance Style',
    ageRestriction: language === 'ru' ? 'Возрастное ограничение' : language === 'kk' ? 'Жас шектеуі' : 'Age Restriction',
    allAges: language === 'ru' ? 'Для всех возрастов' : language === 'kk' ? 'Барлық жасқа' : 'All Ages',
    dressCode: language === 'ru' ? 'Дресс-код' : language === 'kk' ? 'Дресс-код' : 'Dress Code',
    noDressCode: language === 'ru' ? 'Без особого дресс-кода' : language === 'kk' ? 'Арнайы дресс-код жоқ' : 'No specific dress code',
    schedule: language === 'ru' ? 'Расписание' : language === 'kk' ? 'Кесте' : 'Schedule',
    scheduleItem: language === 'ru' ? 'Пункт расписания' : language === 'kk' ? 'Кесте тармағы' : 'Schedule item',
    orderSummary: language === 'ru' ? 'Сводка заказа' : language === 'kk' ? 'Тапсырыс қорытындысы' : 'Order Summary',
    selectTicketsContinue: language === 'ru' ? 'Выберите билеты, чтобы продолжить' : language === 'kk' ? 'Жалғастыру үшін билеттерді таңдаңыз' : 'Select tickets to continue',
    allActivitiesIncluded: language === 'ru' ? 'Все активности включены' : language === 'kk' ? 'Барлық белсенділік кіреді' : 'All activities included',
    subtotal: language === 'ru' ? 'Подытог' : language === 'kk' ? 'Аралық сома' : 'Subtotal',
    serviceFee: language === 'ru' ? 'Сервисный сбор' : language === 'kk' ? 'Қызмет ақысы' : 'Service Fee',
    total: language === 'ru' ? 'Итого' : language === 'kk' ? 'Жалпы' : 'Total',
    proceedCheckout: language === 'ru' ? 'Перейти к оплате' : language === 'kk' ? 'Төлемге өту' : 'Proceed to Checkout',
    processing: language === 'ru' ? 'Обработка...' : language === 'kk' ? 'Өңделуде...' : 'Processing...',
    securePayment: language === 'ru' ? 'Безопасная SSL-оплата' : language === 'kk' ? 'Қауіпсіз SSL төлемі' : 'Secure SSL Payment',
    instantDelivery: language === 'ru' ? 'Мгновенная доставка' : language === 'kk' ? 'Жедел жеткізу' : 'Instant delivery',
    ticketsSentEmail: language === 'ru' ? 'Билеты будут отправлены на вашу почту.' : language === 'kk' ? 'Билеттер email-іңізге жіберіледі.' : 'Tickets sent to your email.',
    verifiedTickets: language === 'ru' ? 'Проверенные билеты' : language === 'kk' ? 'Расталған билеттер' : 'Verified tickets',
    authenticGuarantee: language === 'ru' ? '100% гарантия подлинности.' : language === 'kk' ? '100% түпнұсқалық кепілдігі.' : '100% authentic guarantee.',
    totalAmount: language === 'ru' ? 'Общая сумма' : language === 'kk' ? 'Жалпы сома' : 'Total Amount',
    checkout: language === 'ru' ? 'Оформить' : language === 'kk' ? 'Рәсімдеу' : 'Checkout',
  };
  // Check if this is a special program event (has activities with organizer info)
  const isSpecialProgram = event.eventType === 'special-program' || (event.activities && event.activities.length > 0 && event.longDescription);
  
  // Parse base price from event string (e.g., "5,000 ₸" -> 5000)
  const basePrice = parseDisplayPrice(event.ticketPricing?.generalAdmission || event.price, 5000) || 5000;
  const serviceFeeRate = 0.05; // 5% service fee
  const fullPassPrice = Number(event.fullPassPrice || 25000);
  const ticketLimit = Number(event.ticketLimit || 0);
  const remainingTickets = event.remainingTickets === null || event.remainingTickets === undefined
    ? null
    : Number(event.remainingTickets);
  const isSoldOut = Boolean(event.soldOut) || (remainingTickets !== null && remainingTickets <= 0);

  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, number>>({});
  const [fullPassSelected, setFullPassSelected] = useState(false);
  const [activeActivityTab, setActiveActivityTab] = useState('All');
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);

  const activities: Activity[] = isSpecialProgram ? (event.activities || []) : [];
  const hasSoldOutLimitedActivity = activities.some((activity: any) => Boolean(activity.soldOut));
  const selectedActivityQuantity = fullPassSelected
    ? 1
    : Object.values(selectedActivities).reduce((sum, qty) => sum + qty, 0);
  const selectedTotalQuantity = ticketQuantity + (isSpecialProgram ? selectedActivityQuantity : 0);
  const canAddMoreTickets = remainingTickets === null || remainingTickets === undefined
    ? true
    : selectedTotalQuantity < remainingTickets;
  const scheduleItems = Array.isArray(event.schedule) && event.schedule.length > 0
    ? event.schedule
    : [
        { time: '19:00', title: 'Doors Open', description: '', location: '' },
        { time: '20:00', title: 'Warm-up Set', description: '', location: '' },
        { time: '21:00', title: 'Main Event Starts', description: '', location: '' },
        { time: '23:30', title: 'After Party', description: '', location: '' },
      ];

  // Sort activities chronologically
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  const mapQuery = encodeURIComponent(event.address || event.location || '');
  const mapUrl = event.address || event.location ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}` : '';
  const mapEmbedUrl = event.address || event.location ? `https://www.google.com/maps?q=${mapQuery}&output=embed` : '';

  const handleActivityIncrement = (activityId: string) => {
    if (!isSpecialProgram) return;
    if (fullPassSelected) return;
    if (!canAddMoreTickets) return;
    const activity = activities.find(a => a.id === activityId);
    const activityRemaining = activity?.remainingTickets === null || activity?.remainingTickets === undefined
      ? null
      : Number(activity.remainingTickets);
    const currentQty = selectedActivities[activityId] || 0;
    if (activityRemaining !== null && currentQty >= activityRemaining) return;
    setSelectedActivities(prev => ({
      ...prev,
      [activityId]: currentQty + 1
    }));
  };

  const handleActivityDecrement = (activityId: string) => {
    if (!isSpecialProgram) return;
    if (fullPassSelected) return;
    setSelectedActivities(prev => {
      const current = prev[activityId] || 0;
      if (current <= 1) {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      }
      return { ...prev, [activityId]: current - 1 };
    });
  };

  const calculateActivitiesTotal = () => {
    if (!isSpecialProgram) return 0;
    if (fullPassSelected) return fullPassPrice;
    return Object.entries(selectedActivities).reduce((total, [id, qty]) => {
      const activity = activities.find(a => a.id === id);
      return total + (activity ? activity.price * qty : 0);
    }, 0);
  };

  const subtotal = (basePrice * ticketQuantity) + (isSpecialProgram ? calculateActivitiesTotal() : 0);
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = subtotal + serviceFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount).replace(/,/g, ' ') + ' ₸';
  };

  const handleCheckout = () => {
    if (isCheckoutSubmitting) return;
    if (isSoldOut) return;
    if (ticketQuantity === 0 && (!isSpecialProgram || (!fullPassSelected && Object.keys(selectedActivities).length === 0))) return;

    const ticketDetails = {
      quantity: ticketQuantity,
      subtotal: subtotal,
      serviceFee: serviceFee,
      total: total,
      ticketTypes: isSpecialProgram
        ? [
            ...(ticketQuantity > 0 ? [{
              name: "Event Ticket",
              quantity: ticketQuantity,
              price: basePrice
            }] : []),
            ...(fullPassSelected ? [{
              name: "Full Event Pass",
              quantity: 1,
              price: fullPassPrice
            }] : []),
            ...(!fullPassSelected ? Object.entries(selectedActivities).map(([id, qty]) => {
              const activity = activities.find(a => a.id === id);
              return {
                activityId: id,
                name: activity?.name || "Activity",
                quantity: qty,
                price: activity?.price || 0
              };
            }) : [])
          ]
        : [
            ...(ticketQuantity > 0 ? [{
              name: "Event Ticket",
              quantity: ticketQuantity,
              price: basePrice
            }] : [])
          ]
    };
    
    if (!onPurchaseComplete) return;

    setIsCheckoutSubmitting(true);
    Promise.resolve(onPurchaseComplete(ticketDetails))
      .catch(() => {})
      .finally(() => setIsCheckoutSubmitting(false));
  };

  const activityCategories = ['All', 'Masterclass', 'Battle', 'Contest', 'Camp'];
  const filteredActivities = activeActivityTab === 'All' 
    ? sortedActivities 
    : sortedActivities.filter(a => a.type === activeActivityTab);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Masterclass': return <GraduationCap className="w-4 h-4" />;
      case 'Battle': return <Trophy className="w-4 h-4" />;
      case 'Contest': return <Star className="w-4 h-4" />;
      case 'Camp': return <Tent className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-32 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {copy.back}
        </button>

        {ticketLimit > 0 && (
          <div className={`mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
            isSoldOut
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}>
            {isSoldOut ? copy.soldOut : copy.ticketsLeft(remainingTickets ?? ticketLimit)}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* SPECIAL PROGRAMS LAYOUT */}
            {isSpecialProgram ? (
              <>
                {/* 1. Event Header */}
                <section>
                  <div className="flex gap-6 mb-8">
                    <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-purple-900/20 border border-white/5">
                      <ImageWithFallback
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {event.category}
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{event.title}</h1>
                      <div className="flex flex-col gap-2 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. About the Event - LARGE SECTION */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Info className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{copy.aboutEvent}</h2>
                  </div>
                  
                  <div className="relative z-10 space-y-8">
                    {/* Overview */}
                    <div>
                      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-base">
                        <p>{event.longDescription || event.description}</p>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    {event.highlights && event.highlights.length > 0 && (
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-bold text-white">{copy.keyHighlights}</h3>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {event.highlights.map((highlight: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-gray-400">
                              <Check className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                              <span className="text-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Target Audience */}
                    {event.targetAudience && (
                      <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-bold text-white">{copy.whoShouldAttend}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{event.targetAudience}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. Sub-Events List - Sequential */}
                <section className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{copy.activities}</h2>
                    <p className="text-gray-400">
                      {readOnly ? copy.organizerPreview : copy.selectActivities}
                    </p>
                  </div>

                  {/* Full Event Pass Option */}
                  {!readOnly && !isSoldOut && <button 
                    onClick={() => setFullPassSelected(!fullPassSelected)}
                    disabled={hasSoldOutLimitedActivity || (!fullPassSelected && !canAddMoreTickets)}
                    className={`
                      w-full flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all duration-300 group
                      ${fullPassSelected 
                        ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                        : 'bg-gray-900 border-white/10 hover:border-purple-500/50 hover:bg-gray-800'}
                      ${hasSoldOutLimitedActivity || (!fullPassSelected && !canAddMoreTickets) ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${fullPassSelected ? 'bg-white text-purple-600' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'}`}>
                      <Percent className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-lg ${fullPassSelected ? 'text-white' : 'text-white group-hover:text-purple-400'}`}>{copy.fullPass}</div>
                      {hasSoldOutLimitedActivity && (
                        <div className="mt-1 text-sm text-red-300">{copy.unavailableBecauseSoldOut}</div>
                      )}
                      {!hasSoldOutLimitedActivity && !fullPassSelected && !canAddMoreTickets && (
                        <div className="mt-1 text-sm text-red-300">{copy.overallLimit}</div>
                      )}
                      <div className={`text-sm ${fullPassSelected ? 'text-purple-100' : 'text-gray-500'}`}>{formatCurrency(fullPassPrice)} • {copy.accessAll}</div>
                    </div>
                    {fullPassSelected && <Check className="w-6 h-6 text-white" />}
                  </button>}

                  {/* Sub-Events Cards */}
                  <div className="space-y-4">
                    {sortedActivities.map((activity) => {
                      const qty = selectedActivities[activity.id] || 0;
                      const isIncluded = fullPassSelected;
                      const activityRemaining = (activity as any).remainingTickets === null || (activity as any).remainingTickets === undefined
                        ? null
                        : Number((activity as any).remainingTickets);
                      const activitySoldOut = Boolean((activity as any).soldOut);
                      
                      return (
                        <div 
                          key={activity.id}
                          className={`
                            p-6 rounded-2xl border transition-all duration-300
                            ${qty > 0 || isIncluded ? 'bg-gray-900 border-purple-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}
                          `}
                        >
                          <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex-1">
                              {/* Type Label & Time */}
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-1 rounded border border-purple-500/20 flex items-center gap-1.5 uppercase tracking-widest">
                                  {getIcon(activity.type)}
                                  {activity.type}
                                </span>
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5" />
                                  {activity.time}
                                </div>
                              </div>

                              {/* Sub-event Title */}
                              <h4 className="text-xl font-bold text-white mb-3">{activity.name}</h4>

                              {/* Description */}
                              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{activity.description}</p>

                              {/* Organizer Info */}
                              {activity.organizer && (
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {activity.organizer.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-white font-semibold text-sm">{activity.organizer.name}</div>
                                    <div className="text-gray-500 text-xs">{activity.organizer.role}</div>
                                  </div>
                                  {activity.location && (
                                    <>
                                      <div className="w-px h-8 bg-white/10 ml-2" />
                                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {activity.location}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right Side - Price & Action */}
                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 lg:min-w-[160px]">
                              <div className="text-white font-black text-2xl">
                                {formatCurrency(activity.price)}
                              </div>
                              {activitySoldOut ? (
                                <div className="text-sm font-semibold text-red-400">{copy.soldOut}</div>
                              ) : activityRemaining !== null ? (
                                <div className="text-sm font-medium text-emerald-400">{activityRemaining} left</div>
                              ) : null}
                              
                              {readOnly || isSoldOut || activitySoldOut ? null : isIncluded ? (
                                <div className="bg-green-500/10 text-green-400 px-5 py-3 rounded-xl text-xs font-bold border border-green-500/20 flex items-center gap-2">
                                  <Check className="w-4 h-4" /> Included
                                </div>
                              ) : qty === 0 ? (
                                <button 
                                  onClick={() => handleActivityIncrement(activity.id)}
                                  disabled={!canAddMoreTickets}
                                  className="w-full lg:w-auto bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                  Buy Ticket
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-1.5 border border-white/10 backdrop-blur-sm">
                                  <button 
                                    onClick={() => handleActivityDecrement(activity.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-bold text-white w-6 text-center">{qty}</span>
                                  <button 
                                    onClick={() => handleActivityIncrement(activity.id)}
                                    disabled={!canAddMoreTickets || (activityRemaining !== null && qty >= activityRemaining)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-400 text-white transition-colors shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 4. Event Program Timeline */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{copy.fullSchedule}</h2>
                  </div>

                  <div className="space-y-6 relative">
                    <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-purple-500/20" />
                    {sortedActivities.map((activity, i) => (
                      <div key={activity.id} className="flex items-start gap-6 relative z-10 group">
                        <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-purple-400 font-bold text-xs shadow-lg group-hover:border-purple-500/50 group-hover:text-purple-300 transition-colors shrink-0">
                          {activity.time.split(' - ')[0]}
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-500/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">
                              {activity.type}
                            </span>
                          </div>
                          <div className="font-bold text-white text-lg mb-1 group-hover:text-purple-400 transition-colors">{activity.name}</div>
                          {activity.location && (
                            <div className="text-gray-500 text-sm flex items-center gap-1.5 mb-2">
                              <MapPin className="w-3.5 h-3.5" />
                              {activity.location}
                            </div>
                          )}
                          {activity.organizer && (
                            <div className="text-gray-500 text-sm flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {activity.organizer.name}
                            </div>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm font-medium shrink-0 pt-2">
                          {activity.time.split(' - ')[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Location */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{copy.location}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="text-white font-medium text-lg">{event.location}</div>
                    <div className="text-gray-400">{event.address || event.location || `${event.city || 'Unknown city'}, Kazakhstan`}</div>
                    {mapUrl && (
                      <div className="w-full h-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 mt-4">
                        <iframe
                          src={mapEmbedUrl}
                          title="Event location map"
                          className="h-full w-full border-0"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-4 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                      >
                        {copy.openMaps}
                      </a>
                    )}
                  </div>
                </section>
              </>
            ) : (
              /* REGULAR EVENTS LAYOUT (Original) */
              <>
                {/* 1. Event Header & Tickets */}
                <section>
                  <h1 className="text-3xl font-bold text-white mb-6">{copy.selectTickets}</h1>
                  <div className="bg-gray-900 rounded-2xl p-6 border border-white/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />
                    
                    {/* Event Summary Card */}
                    <div className="flex gap-6 mb-8 relative z-10">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-purple-900/20 border border-white/5">
                        <ImageWithFallback
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {event.category}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{event.title}</h3>
                        <div className="flex flex-col gap-2 text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            19:00 - 02:00
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/10 mb-8" />

                    {/* Single Ticket Option */}
                    <div className="relative z-10">
                      <div 
                        className={`
                          flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-all duration-300
                          ${ticketQuantity > 0 
                            ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60'}
                        `}
                      >
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                              <Ticket className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="font-bold text-white text-xl">{copy.eventTicket}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-2 ml-10">General admission (single ticket type for dance events)</div>
                          <div className="text-purple-400 font-bold mt-3 sm:hidden ml-10">
                            {formatCurrency(basePrice)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-8">
                          <div className="hidden sm:block font-bold text-white text-2xl">
                            {formatCurrency(basePrice)}
                          </div>
                          
                          {readOnly || isSoldOut ? null : ticketQuantity === 0 ? (
                            <button 
                              onClick={() => setTicketQuantity(1)}
                              disabled={!canAddMoreTickets}
                              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                              Select
                            </button>
                          ) : (
                            <div className="flex items-center gap-4 bg-gray-800/80 rounded-xl p-1.5 border border-white/10 backdrop-blur-sm">
                              <button 
                                onClick={() => setTicketQuantity(prev => Math.max(0, prev - 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="font-bold text-white text-lg w-6 text-center">{ticketQuantity}</span>
                              <button 
                                onClick={() => setTicketQuantity(prev => prev + 1)}
                                disabled={!canAddMoreTickets}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-400 text-white transition-colors disabled:cursor-not-allowed"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* EVENT PROGRAM SECTION (if activities exist but not special program) */}
                {false && activities.length > 0 && (
                  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Event Program</h2>
                        <p className="text-gray-400">Choose activities inside this event</p>
                      </div>
                      
                      {/* Full Event Pass Option */}
                      <button 
                        onClick={() => setFullPassSelected(!fullPassSelected)}
                        disabled={hasSoldOutLimitedActivity || (!fullPassSelected && !canAddMoreTickets)}
                        className={`
                          flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 group
                          ${fullPassSelected 
                            ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                            : 'bg-gray-900 border-white/10 hover:border-purple-500/50 hover:bg-gray-800'}
                          ${hasSoldOutLimitedActivity || (!fullPassSelected && !canAddMoreTickets) ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${fullPassSelected ? 'bg-white text-purple-600' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'}`}>
                          <Percent className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold text-sm ${fullPassSelected ? 'text-white' : 'text-white group-hover:text-purple-400'}`}>{copy.fullPass}</div>
                          {hasSoldOutLimitedActivity && (
                            <div className="mt-1 text-xs text-red-300">Unavailable because one activity is sold out</div>
                          )}
                          {!hasSoldOutLimitedActivity && !fullPassSelected && !canAddMoreTickets && (
                            <div className="mt-1 text-xs text-red-300">Overall ticket limit reached in your selection</div>
                          )}
                          <div className={`text-xs ${fullPassSelected ? 'text-purple-100' : 'text-gray-500'}`}>{formatCurrency(fullPassPrice)} • All activities</div>
                        </div>
                        {fullPassSelected && <Check className="w-5 h-5 text-white ml-2" />}
                      </button>
                    </div>

                    {/* Activity Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {activityCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveActivityTab(cat)}
                          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all relative overflow-hidden ${
                            activeActivityTab === cat 
                              ? 'text-white' 
                              : 'bg-gray-900/50 text-gray-500 hover:bg-gray-800 border border-white/5'
                          }`}
                        >
                          {activeActivityTab === cat && (
                            <motion.div 
                              layoutId="activeActivityTabPill"
                              className="absolute inset-0 bg-purple-600"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-2">
                            {cat !== 'All' && getIcon(cat)}
                            {cat}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Activities List */}
                    <div className="grid gap-4">
                      <AnimatePresence mode="sync">
                        {filteredActivities.map((activity) => {
                          const qty = selectedActivities[activity.id] || 0;
                          const isIncluded = fullPassSelected;
                          const activityRemaining = (activity as any).remainingTickets === null || (activity as any).remainingTickets === undefined
                            ? null
                            : Number((activity as any).remainingTickets);
                          const activitySoldOut = Boolean((activity as any).soldOut);
                          
                          return (
                            <motion.div 
                              key={activity.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`
                                p-6 rounded-2xl border transition-all duration-300
                                ${qty > 0 || isIncluded ? 'bg-gray-900 border-purple-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}
                              `}
                            >
                              <div className="flex flex-col sm:flex-row justify-between gap-6">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1.5 uppercase tracking-widest">
                                      {getIcon(activity.type)}
                                      {activity.type}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                                      <Clock className="w-3.5 h-3.5" />
                                      {activity.time}
                                    </div>
                                  </div>
                                  <h4 className="text-xl font-bold text-white mb-2">{activity.name}</h4>
                                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{activity.description}</p>
                                  {activity.instructor && (
                                    <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
                                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                      {activity.instructor}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 min-w-[140px]">
                                  <div className="text-white font-black text-xl">
                                    {formatCurrency(activity.price)}
                                  </div>
                                  {activitySoldOut ? (
                                    <div className="text-sm font-semibold text-red-400">{copy.soldOut}</div>
                                  ) : activityRemaining !== null ? (
                                    <div className="text-sm font-medium text-emerald-400">{activityRemaining} left</div>
                                  ) : null}
                                  
                                  {activitySoldOut ? null : isIncluded ? (
                                    <div className="bg-green-500/10 text-green-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-green-500/20 flex items-center gap-2">
                                      <Check className="w-4 h-4" /> Included
                                    </div>
                                  ) : qty === 0 ? (
                                    <button 
                                      onClick={() => handleActivityIncrement(activity.id)}
                                      disabled={!canAddMoreTickets}
                                      className="w-full sm:w-auto bg-white/10 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                      Add
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-1.5 border border-white/10 backdrop-blur-sm">
                                      <button 
                                        onClick={() => handleActivityDecrement(activity.id)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="font-bold text-white w-6 text-center">{qty}</span>
                                      <button 
                                        onClick={() => handleActivityIncrement(activity.id)}
                                        disabled={!canAddMoreTickets || (activityRemaining !== null && qty >= activityRemaining)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-400 text-white transition-colors shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* 2. About the Event */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Info className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{copy.aboutEvent}</h2>
                  </div>
                  
                  <div className="prose prose-invert max-w-none text-gray-400 mb-8 leading-relaxed">
                    <p>{event.description || `Join us for ${event.title}, the premier dance event of the season in ${event.city}. Experience an unforgettable night showcasing the best ${event.category} talent from across Kazakhstan and beyond.`}</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{copy.danceStyle}</div>
                      <div className="text-white font-medium">{event.category}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{copy.ageRestriction}</div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        {event.ageRestriction || copy.allAges}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{copy.dressCode}</div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Shirt className="w-4 h-4 text-purple-400" />
                        {event.dressCode || copy.noDressCode}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Schedule */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{copy.schedule}</h2>
                  </div>

                  <div className="space-y-6 relative">
                    <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-800" />
                    {scheduleItems.map((item, i) => (
                      <div key={item.id || i} className="flex items-center gap-6 relative z-10 group">
                        <div className="w-14 h-14 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-purple-400 font-bold shadow-lg group-hover:border-purple-500/50 group-hover:text-purple-300 transition-colors">
                          {item.time}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">{item.title || copy.scheduleItem}</div>
                          {(item.description || item.location) && (
                            <div className="text-gray-500 text-sm">{item.description || item.location}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Location */}
                <section className="bg-gray-900 rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{copy.location}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="text-white font-medium text-lg">{event.location}</div>
                    <div className="text-gray-400">{event.address || event.location || `${event.city}, Kazakhstan`}</div>
                    {mapUrl && (
                      <div className="w-full h-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 mt-4">
                        <iframe
                          src={mapEmbedUrl}
                          title="Event location map"
                          className="h-full w-full border-0"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-4 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                      >
                        {copy.openMaps}
                      </a>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - STICKY ORDER SUMMARY */}
          {!readOnly && (
          <div className="lg:col-span-1 relative">
            <div className="hidden lg:block sticky top-24 space-y-4">
              <div className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/50">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                  {copy.orderSummary}
                </h3>
                
                <div className="space-y-4 text-sm max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {ticketQuantity === 0 && (!isSpecialProgram || (!fullPassSelected && Object.keys(selectedActivities).length === 0)) ? (
                    <div className="text-gray-500 text-center py-10 bg-black/20 rounded-xl border border-dashed border-white/5">
                      <div className="text-4xl mb-3 opacity-20">🎫</div>
                      <p>{copy.selectTicketsContinue}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ticketQuantity > 0 && (
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">{copy.eventTicket}</div>
                            <div className="text-gray-500 text-xs">x{ticketQuantity} at {formatCurrency(basePrice)}</div>
                          </div>
                          <div className="text-white font-bold">{formatCurrency(ticketQuantity * basePrice)}</div>
                        </div>
                      )}
                      {isSpecialProgram && fullPassSelected && (
                        <div className="flex justify-between items-start pt-2 border-t border-white/5">
                          <div>
                            <div className="text-purple-400 font-bold">{copy.fullPass}</div>
                            <div className="text-gray-500 text-xs">{copy.allActivitiesIncluded}</div>
                          </div>
                          <div className="text-purple-400 font-bold">{formatCurrency(fullPassPrice)}</div>
                        </div>
                      )}
                      {isSpecialProgram && !fullPassSelected && Object.entries(selectedActivities).map(([id, qty]) => {
                        const activity = activities.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between items-start animate-in slide-in-from-right-2 duration-300">
                            <div>
                              <div className="text-white font-medium">{activity?.name}</div>
                              <div className="text-gray-500 text-xs">x{qty} at {formatCurrency(activity?.price || 0)}</div>
                            </div>
                            <div className="text-white font-bold">{formatCurrency(qty * (activity?.price || 0))}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>{copy.subtotal}</span>
                    <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span>{copy.serviceFee}</span>
                      <Info className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <span className="text-white font-medium">{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white font-extrabold text-2xl pt-3 border-t border-white/10">
                    <span>{copy.total}</span>
                    <span className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <button 
                  disabled={isCheckoutSubmitting || isSoldOut || (ticketQuantity === 0 && (!isSpecialProgram || (!fullPassSelected && Object.keys(selectedActivities).length === 0)))}
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSoldOut ? copy.soldOut : isCheckoutSubmitting ? copy.processing : copy.proceedCheckout}
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500/80" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{copy.securePayment}</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/40 rounded-xl p-3 border border-white/5">
                  <div className="text-white font-bold text-[10px] mb-1 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                    {copy.instantDelivery}
                  </div>
                  <p className="text-[9px] text-gray-500">{copy.ticketsSentEmail}</p>
                </div>
                <div className="bg-gray-900/40 rounded-xl p-3 border border-white/5">
                  <div className="text-white font-bold text-[10px] mb-1 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                    {copy.verifiedTickets}
                  </div>
                  <p className="text-[9px] text-gray-500">{copy.authenticGuarantee}</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM BAR */}
      {!readOnly && <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 p-4 z-40 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{copy.totalAmount}</span>
            <span className="text-xl font-bold text-white">{formatCurrency(total)}</span>
          </div>
          <button 
            disabled={isCheckoutSubmitting || isSoldOut || (ticketQuantity === 0 && (!isSpecialProgram || (!fullPassSelected && Object.keys(selectedActivities).length === 0)))}
            onClick={handleCheckout}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 disabled:shadow-none disabled:cursor-not-allowed text-center"
          >
            {isSoldOut ? copy.soldOut : isCheckoutSubmitting ? copy.processing : copy.checkout}
          </button>
        </div>
      </div>}
    </div>
  );
};
