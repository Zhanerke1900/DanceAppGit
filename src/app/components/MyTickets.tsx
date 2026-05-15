import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket, ChevronRight, QrCode, Barcode, X, CreditCard, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { PaymentRefundRecord, ReservationRecord, TicketRecord } from '../api/tickets';
import { useI18n } from '../i18n';
import { localizeEventForDisplay } from '../utils/localization';

interface MyTicketsProps {
  onBack?: () => void;
  tickets?: TicketRecord[];
  reservations?: ReservationRecord[];
  onOpenTicket?: (ticket: TicketRecord) => void;
  onOpenReservation?: (reservation: ReservationRecord) => void;
  onRefundTicket?: (ticket: TicketRecord) => Promise<{ refundedAmount?: number; paymentRefunds?: PaymentRefundRecord[]; emailSent?: boolean } | void>;
  onPayReservation?: (reservation: ReservationRecord) => Promise<void>;
  onCancelReservation?: (reservation: ReservationRecord) => Promise<void>;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number, currency = 'KZT') =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` ${currency}`;

const MY_TICKETS_TAB_STORAGE_KEY = 'danceapp:my-tickets-tab';

const getInitialTicketsTab = (): 'upcoming' | 'past' => {
  if (typeof window === 'undefined') return 'upcoming';
  return window.localStorage.getItem(MY_TICKETS_TAB_STORAGE_KEY) === 'past' ? 'past' : 'upcoming';
};

const getRefundDeadlineMs = (ticket: TicketRecord) => {
  const rawDate = String(ticket.event.date || "").trim();
  const rawTime = String(ticket.event.time || "").trim();
  const direct = new Date(rawTime ? `${rawDate} ${rawTime}` : rawDate);
  if (!Number.isNaN(direct.getTime())) return direct.getTime() - Date.now();

  const monthRangeMatch = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*\d{1,2},\s*(\d{4})$/);
  if (monthRangeMatch) {
    const normalized = `${monthRangeMatch[1]} ${monthRangeMatch[2]}, ${monthRangeMatch[3]}${rawTime ? ` ${rawTime}` : ""}`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime() - Date.now();
  }

  const splitRange = rawDate.split("-").map((part) => part.trim()).filter(Boolean);
  if (splitRange.length > 1) {
    const parsed = new Date(rawTime ? `${splitRange[0]} ${rawTime}` : splitRange[0]);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime() - Date.now();
  }

  return -1;
};

export const MyTickets = ({
  onBack,
  tickets = [],
  reservations = [],
  onOpenTicket,
  onOpenReservation,
  onRefundTicket,
  onPayReservation,
  onCancelReservation,
}: MyTicketsProps) => {
  const { language } = useI18n();
  const copy = {
    title: language === 'ru' ? 'Мои билеты и брони' : language === 'kk' ? 'Менің билеттерім мен броньдарым' : 'My Tickets & Reservations',
    subtitle: language === 'ru' ? 'Брони отображаются без QR. Нажмите «Оплатить остаток», чтобы получить настоящий билет.' : language === 'kk' ? 'Броньдар QR-сыз көрсетіледі. Нақты билет алу үшін «Қалдықты төлеу» түймесін басыңыз.' : 'Reservations appear without QR. Pay the balance to receive a real ticket.',
    upcoming: language === 'ru' ? 'Предстоящие' : language === 'kk' ? 'Алдағы' : 'Upcoming',
    past: language === 'ru' ? 'Прошедшие' : language === 'kk' ? 'Өткен' : 'Past Events',
    purchased: language === 'ru' ? 'Куплено:' : language === 'kk' ? 'Сатып алынған:' : 'Purchased:',
    price: language === 'ru' ? 'Цена:' : language === 'kk' ? 'Бағасы:' : 'Price:',
    prepaid: language === 'ru' ? 'Предоплата:' : language === 'kk' ? 'Алдын ала төлем:' : 'Deposit paid:',
    balanceDue: language === 'ru' ? 'Остаток:' : language === 'kk' ? 'Қалдық:' : 'Balance due:',
    reserved: language === 'ru' ? 'Бронь по предоплате' : language === 'kk' ? 'Алдын ала төлеммен бронь' : 'Deposit booking',
    refundPolicy: language === 'ru' ? 'Предоплата возвращается только если до события больше 48 часов.' : language === 'kk' ? 'Алдын ала төлем іс-шараға 48 сағаттан көп қалғанда ғана қайтарылады.' : 'Deposit is refundable only more than 48 hours before the event.',
    reservations: language === 'ru' ? 'Брони' : language === 'kk' ? 'Броньдар' : 'Reservations',
    noTicketYet: language === 'ru' ? 'Билет и QR появятся после полной оплаты.' : language === 'kk' ? 'Билет пен QR толық төлемнен кейін пайда болады.' : 'Ticket and QR appear after full payment.',
    payBalance: language === 'ru' ? 'Оплатить остаток' : language === 'kk' ? 'Қалдықты төлеу' : 'Pay balance',
    cancelReservation: language === 'ru' ? 'Отменить бронь' : language === 'kk' ? 'Броньды тоқтату' : 'Cancel reservation',
    deadline: language === 'ru' ? 'Оплатить до:' : language === 'kk' ? 'Дейін төлеу:' : 'Pay before:',
    deadlinePassed: language === 'ru' ? 'Срок полной оплаты истёк' : language === 'kk' ? 'Толық төлем мерзімі өтті' : 'Payment deadline passed',
    showTicket: language === 'ru' ? 'Показать билет' : language === 'kk' ? 'Билетті көрсету' : 'Show Ticket',
    viewEvent: language === 'ru' ? 'Открыть событие' : language === 'kk' ? 'Іс-шараны ашу' : 'View Event',
    viewDetails: language === 'ru' ? 'Подробнее' : language === 'kk' ? 'Толығырақ' : 'View Details',
    processingRefund: language === 'ru' ? 'Возврат...' : language === 'kk' ? 'Қайтарылуда...' : 'Processing refund...',
    refundTicket: language === 'ru' ? 'Вернуть билет' : language === 'kk' ? 'Билетті қайтару' : 'Refund Ticket',
    refundUnavailable: language === 'ru' ? 'Возврат недоступен' : language === 'kk' ? 'Қайтару қолжетімсіз' : 'Refund unavailable',
    noTickets: (tab: 'upcoming' | 'past') => language === 'ru' ? `Нет ${tab === 'upcoming' ? 'предстоящих' : 'прошедших'} билетов` : language === 'kk' ? `${tab === 'upcoming' ? 'Алдағы' : 'Өткен'} билеттер жоқ` : `No ${tab} tickets`,
    noUpcoming: language === 'ru' ? 'У вас пока нет предстоящих билетов.' : language === 'kk' ? 'Сізде әзірге алдағы билеттер жоқ.' : "You don't have any upcoming tickets yet.",
    noPast: language === 'ru' ? 'Вы еще не посещали билетные события.' : language === 'kk' ? 'Сіз әлі билетпен іс-шараларға қатыспадыңыз.' : "You haven't attended any ticketed events yet.",
    explore: language === 'ru' ? 'Смотреть события' : language === 'kk' ? 'Іс-шараларды көру' : 'Explore Events',
    qrCode: language === 'ru' ? 'QR-код' : language === 'kk' ? 'QR-код' : 'QR Code',
    barcode: language === 'ru' ? 'Штрихкод' : language === 'kk' ? 'Штрихкод' : 'Barcode',
    ticketType: language === 'ru' ? 'Тип билета:' : language === 'kk' ? 'Билет түрі:' : 'Ticket Type:',
    status: language === 'ru' ? 'Статус:' : language === 'kk' ? 'Күйі:' : 'Status:',
    confirmRefund: language === 'ru' ? 'Подтвердите возврат' : language === 'kk' ? 'Қайтаруды растаңыз' : 'Confirm Refund',
    areYouSure: language === 'ru' ? 'Вы уверены?' : language === 'kk' ? 'Сенімдісіз бе?' : 'Are you sure?',
    keepTicket: language === 'ru' ? 'Оставить билет' : language === 'kk' ? 'Билетті қалдыру' : 'Keep Ticket',
    yesRefund: language === 'ru' ? 'Да, вернуть билет' : language === 'kk' ? 'Иә, билетті қайтару' : 'Yes, refund ticket',
    processing: language === 'ru' ? 'Обработка...' : language === 'kk' ? 'Өңделуде...' : 'Processing...',
    refundRequested: language === 'ru' ? 'Возврат запрошен' : language === 'kk' ? 'Қайтару сұралды' : 'Refund Requested',
    everythingSet: language === 'ru' ? 'Все готово' : language === 'kk' ? 'Барлығы дайын' : 'Everything is set',
    ok: 'OK',
    refundError: language === 'ru' ? 'Ошибка возврата' : language === 'kk' ? 'Қайтару қатесі' : 'Refund Error',
    somethingWrong: language === 'ru' ? 'Что-то пошло не так' : language === 'kk' ? 'Бірдеңе дұрыс болмады' : 'Something went wrong',
    close: language === 'ru' ? 'Закрыть' : language === 'kk' ? 'Жабу' : 'Close',
  };
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(() => getInitialTicketsTab());
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [refundingTicketId, setRefundingTicketId] = useState<string | null>(null);
  const [processingReservationId, setProcessingReservationId] = useState<string | null>(null);
  const [refundCandidate, setRefundCandidate] = useState<TicketRecord | null>(null);
  const [refundSuccessMessage, setRefundSuccessMessage] = useState<string | null>(null);
  const [refundErrorMessage, setRefundErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(MY_TICKETS_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const filteredTickets = useMemo(
    () => tickets.filter((ticket) => (activeTab === 'upcoming' ? !ticket.isPast : ticket.isPast)),
    [activeTab, tickets]
  );
  const filteredReservations = useMemo(
    () => reservations.filter((reservation) => (activeTab === 'upcoming' ? !reservation.isPast : reservation.isPast)),
    [activeTab, reservations]
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground dark:text-white">{copy.title}</h1>
        <p className="text-muted-foreground dark:text-gray-400">{copy.subtitle}</p>
      </div>

      <div className="mb-8 flex gap-2 border-b border-border dark:border-purple-500/20">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`relative px-6 py-3 font-semibold transition-all ${
            activeTab === 'upcoming' ? 'text-purple-500 dark:text-purple-400' : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {copy.upcoming}
          {activeTab === 'upcoming' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`relative px-6 py-3 font-semibold transition-all ${
            activeTab === 'past' ? 'text-purple-500 dark:text-purple-400' : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {copy.past}
          {activeTab === 'past' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </div>

      {filteredTickets.length > 0 || filteredReservations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredReservations.map((reservation, index) => {
            const displayEvent = localizeEventForDisplay(reservation.event, language);

            return (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="surface-card overflow-hidden rounded-2xl border-emerald-500/20 bg-emerald-500/5"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-64">
                  <ImageWithFallback
                    src={reservation.event.image}
                    alt={displayEvent.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase text-black">
                    {copy.reserved}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">{copy.reservations}</p>
                        <h3 className="text-2xl font-bold text-foreground dark:text-white">{displayEvent.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground dark:text-gray-500">{copy.noTicketYet}</p>
                      </div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{displayEvent.date}{displayEvent.time ? ` - ${displayEvent.time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{displayEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {reservation.canPayBalance && reservation.balanceDueDeadlineAt
                            ? `${copy.deadline} ${formatDate(reservation.balanceDueDeadlineAt)}`
                            : copy.deadlinePassed}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-emerald-100">
                        <span>{copy.prepaid} <b>{formatCurrency(reservation.amountPaid)}</b></span>
                        <span>{copy.balanceDue} <b>{formatCurrency(reservation.balanceDue)}</b></span>
                      </div>
                      <p className="mt-1 text-xs text-emerald-100/70">{copy.refundPolicy}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onOpenReservation?.(reservation)}
                      className="flex items-center gap-2 rounded-lg bg-[rgba(94,72,166,0.12)] px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-[rgba(94,72,166,0.18)] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      {copy.viewEvent}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      disabled={!reservation.canPayBalance || !onPayReservation || processingReservationId === reservation.id}
                      onClick={async () => {
                        if (!onPayReservation || !reservation.canPayBalance) return;
                        setProcessingReservationId(reservation.id);
                        try {
                          await onPayReservation(reservation);
                        } finally {
                          setProcessingReservationId(null);
                        }
                      }}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <CreditCard className="h-4 w-4" />
                      {processingReservationId === reservation.id ? copy.processing : copy.payBalance}
                    </button>
                    <button
                      disabled={!onCancelReservation || processingReservationId === reservation.id}
                      onClick={async () => {
                        if (!onCancelReservation) return;
                        setProcessingReservationId(reservation.id);
                        try {
                          await onCancelReservation(reservation);
                        } finally {
                          setProcessingReservationId(null);
                        }
                      }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
                    >
                      {copy.cancelReservation}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
          })}
          {filteredTickets.map((ticket, index) => {
            const displayEvent = localizeEventForDisplay(ticket.event, language);

            return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group surface-card overflow-hidden rounded-2xl transition-all hover:border-purple-500/30 dark:border-white/10 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-900/50"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-64">
                  <ImageWithFallback
                    src={ticket.event.image}
                    alt={displayEvent.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(45,35,67,0.2)] dark:to-gray-900/50" />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-400">
                          {displayEvent.category}
                        </span>
                        <h3 className="text-2xl font-bold text-foreground dark:text-white">{displayEvent.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground dark:text-gray-500">{ticket.ticketType}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          ticket.status === 'used'
                            ? 'bg-gray-700 text-gray-200'
                            : ticket.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {ticket.paymentType === 'deposit' && Number(ticket.balanceDue || 0) > 0 && ticket.status === 'active' ? copy.reserved : ticket.status}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{displayEvent.date}{displayEvent.time ? ` - ${displayEvent.time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{displayEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground dark:text-gray-500">
                        <Ticket className="h-4 w-4" />
                        {ticket.ticketCode}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                      {copy.purchased} <span className="text-foreground dark:text-white">{formatDate(ticket.purchasedAt)}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground dark:text-gray-400">
                      {copy.price} <span className="text-foreground dark:text-white">{formatCurrency(ticket.price, ticket.currency)}</span>
                    </div>
                    {ticket.paymentType === 'deposit' && Number(ticket.balanceDue || 0) > 0 && (
                      <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-emerald-100">
                          <span>{copy.prepaid} <b>{formatCurrency(ticket.amountPaid || 0, ticket.currency)}</b></span>
                          <span>{copy.balanceDue} <b>{formatCurrency(ticket.balanceDue || 0, ticket.currency)}</b></span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-100/70">{copy.refundPolicy}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700"
                    >
                      <QrCode className="h-4 w-4" />
                      {copy.showTicket}
                    </button>
                    <button
                      onClick={() => onOpenTicket?.(ticket)}
                      className="flex items-center gap-2 rounded-lg bg-[rgba(94,72,166,0.12)] px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-[rgba(94,72,166,0.18)] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      {copy.viewEvent}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {ticket.paymentType === 'deposit' && Number(ticket.balanceDue || 0) > 0 && (
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex items-center gap-2 rounded-lg bg-[rgba(94,72,166,0.12)] px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-[rgba(94,72,166,0.18)] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        {copy.viewDetails}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    {activeTab === 'upcoming' && ticket.status === 'active' && !ticket.isPast && (() => {
                      const refundDeadlineMs = getRefundDeadlineMs(ticket);
                      const refundPolicyHours = ticket.paymentType === 'deposit' ? (ticket.refundPolicyHours || 48) : 24;
                      const canRefund = refundDeadlineMs > refundPolicyHours * 60 * 60 * 1000;
                      return (
                        <button
                          onClick={() => {
                            if (!canRefund || !onRefundTicket) return;
                            setRefundCandidate(ticket);
                          }}
                          disabled={!canRefund || !onRefundTicket || refundingTicketId === ticket.id}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
                        >
                          {refundingTicketId === ticket.id ? copy.processingRefund : canRefund ? copy.refundTicket : copy.refundUnavailable}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                <div className="hidden items-center justify-center border-l border-border p-6 lg:flex dark:border-white/10">
                  <div className="rounded-xl bg-white p-3">
                    <img src={ticket.qrCodeDataUrl} alt={`QR ${ticket.ticketCode}`} className="h-24 w-24" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600/10">
            <Ticket className="h-10 w-10 text-purple-500" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-foreground dark:text-white">{copy.noTickets(activeTab)}</h3>
          <p className="mb-8 max-w-sm text-muted-foreground dark:text-gray-400">
            {activeTab === 'upcoming' ? copy.noUpcoming : copy.noPast}
          </p>
          <button
            onClick={onBack}
            className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all shadow-lg shadow-purple-600/20 hover:bg-purple-700"
          >
            {copy.explore}
          </button>
        </motion.div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="surface-card w-full max-w-2xl rounded-3xl p-6 shadow-2xl dark:border-purple-500/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-black dark:shadow-purple-900/30">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-purple-300">{copy.title}</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground dark:text-white">{selectedTicket.ticketCode}</h2>
                <p className="mt-1 text-muted-foreground dark:text-gray-400">{localizeEventForDisplay(selectedTicket.event, language).title}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl p-2 transition-colors bg-[rgba(94,72,166,0.12)] text-foreground hover:bg-[rgba(94,72,166,0.18)] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-[rgba(94,72,166,0.08)] p-5 dark:border-white/10 dark:bg-gray-900/60">
                <div className="mb-3 flex items-center gap-2 text-foreground dark:text-white">
                  <QrCode className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">{copy.qrCode}</span>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <img src={selectedTicket.qrCodeDataUrl} alt={`QR ${selectedTicket.ticketCode}`} className="mx-auto h-52 w-52" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-[rgba(94,72,166,0.08)] p-5 dark:border-white/10 dark:bg-gray-900/60">
                  <div className="mb-3 flex items-center gap-2 text-foreground dark:text-white">
                    <Barcode className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">{copy.barcode}</span>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={selectedTicket.barcodeDataUrl} alt={`Barcode ${selectedTicket.ticketCode}`} className="w-full" />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-[rgba(94,72,166,0.08)] p-5 text-sm text-foreground dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-300">
                  <p><span className="text-muted-foreground dark:text-gray-500">{copy.ticketType}</span> {selectedTicket.ticketType}</p>
                  <p className="mt-2"><span className="text-muted-foreground dark:text-gray-500">{copy.price}</span> {formatCurrency(selectedTicket.price, selectedTicket.currency)}</p>
                  <p className="mt-2"><span className="text-muted-foreground dark:text-gray-500">{copy.status}</span> {selectedTicket.status}</p>
                  <p className="mt-2"><span className="text-muted-foreground dark:text-gray-500">{copy.purchased}</span> {formatDate(selectedTicket.purchasedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {refundCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">{copy.confirmRefund}</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{copy.areYouSure}</h2>
              </div>
              <button
                onClick={() => setRefundCandidate(null)}
                className="rounded-xl bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-gray-300">
              You are about to refund <span className="font-semibold text-white">{refundCandidate.ticketCode}</span> for{" "}
              <span className="font-semibold text-white">{refundCandidate.event.title}</span>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              The ticket will be removed from your upcoming tickets after Freedom Pay accepts the refund. The money should arrive within
              <span className="font-semibold text-white"> 3 business days</span>.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setRefundCandidate(null)}
                className="rounded-xl bg-white/5 px-4 py-2 font-semibold text-gray-300 transition-colors hover:bg-white/10"
              >
                {copy.keepTicket}
              </button>
              <button
                onClick={async () => {
                  if (!onRefundTicket || !refundCandidate || refundingTicketId === refundCandidate.id) return;
                  setRefundingTicketId(refundCandidate.id);
                  try {
                    const result = await onRefundTicket(refundCandidate);
                    const testRefund = result?.paymentRefunds?.some((refund) => refund.simulated);
                    setRefundCandidate(null);
                    setRefundSuccessMessage(
                      testRefund
                        ? "Test refund completed. Freedom Pay test mode rejected the real refund operation, so no real money was moved."
                        : result?.emailSent === false
                        ? "Refund accepted by Freedom Pay. The ticket was removed, but the email could not be sent. Please restart the backend and check SMTP."
                        : "Refund accepted by Freedom Pay. The money should arrive within 3 business days."
                    );
                  } catch (error: any) {
                    setRefundErrorMessage(error?.message || "Refund failed. Please try again.");
                  } finally {
                    setRefundingTicketId(null);
                  }
                }}
                disabled={refundingTicketId === refundCandidate.id}
                className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-500/60"
              >
                {refundingTicketId === refundCandidate.id ? copy.processing : copy.yesRefund}
              </button>
            </div>
          </div>
        </div>
      )}

      {refundSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-emerald-900/20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">{copy.refundRequested}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{copy.everythingSet}</h2>
            <p className="mt-4 leading-relaxed text-gray-300">{refundSuccessMessage}</p>
            <button
              onClick={() => setRefundSuccessMessage(null)}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              {copy.ok}
            </button>
          </div>
        </div>
      )}

      {refundErrorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">{copy.refundError}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{copy.somethingWrong}</h2>
            <p className="mt-4 leading-relaxed text-gray-300">{refundErrorMessage}</p>
            <button
              onClick={() => setRefundErrorMessage(null)}
              className="mt-6 w-full rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-400"
            >
              {copy.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
