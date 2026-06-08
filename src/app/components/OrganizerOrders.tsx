import React, { useMemo, useState } from 'react';
import { CalendarDays, ReceiptText, Ticket } from 'lucide-react';
import { useI18n } from '../i18n';

interface OrganizerOrder {
  id: string;
  eventId?: string;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentType?: string;
  balanceDueDeadlineAt?: string | null;
  purchaseDate: string;
  paymentStatus: string;
  checkInStatus: string;
}

interface OrganizerOrdersProps {
  orders: OrganizerOrder[];
  analytics?: {
    refundsCount?: number;
    refundedAmount?: number;
  } | null;
}

type DateFilterMode = 'all' | 'month' | 'range';
const ORGANIZER_SERVICE_FEE_RATE = 0.15;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' KZT';

const organizerNetAmount = (value: number) =>
  Number((Number(value || 0) * (1 - ORGANIZER_SERVICE_FEE_RATE)).toFixed(2));

const getLocale = (language: string) =>
  language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';

const formatDate = (value: string, locale = 'en-US') => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMonthValue = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

const getCurrentMonthValue = () => formatMonthValue(new Date());

const parseDateInput = (value: string, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateInputLabel = (value: string, locale = 'en-US') => {
  const date = parseDateInput(value);
  if (!date) return value;
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatMonthLabel = (value: string, locale = 'en-US') => {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
};

const parseDateParts = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return {
    year: match?.[1] || '',
    month: match?.[2] || '',
    day: match?.[3] || '',
  };
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const updateDatePartValue = (
  currentValue: string,
  part: 'year' | 'month' | 'day',
  nextPartValue: string
) => {
  if (!nextPartValue) return '';
  const today = new Date();
  const parts = parseDateParts(currentValue);
  const nextYear = part === 'year' ? nextPartValue : (parts.year || String(today.getFullYear()));
  const nextMonth = part === 'month'
    ? nextPartValue
    : (parts.month || String(today.getMonth() + 1).padStart(2, '0'));
  const maxDay = getDaysInMonth(Number(nextYear), Number(nextMonth));
  const rawDay = part === 'day' ? nextPartValue : (parts.day || '01');
  const nextDay = String(Math.min(Number(rawDay), maxDay)).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const OrganizerOrders: React.FC<OrganizerOrdersProps> = ({ orders, analytics }) => {
  const { language } = useI18n();
  const locale = getLocale(language);
  const copy = {
    en: {
      title: 'Analytics and Orders',
      subtitle: 'Real purchases for your published events.',
      emptyTitle: 'No orders yet',
      emptyDesc: 'Orders and reservations will appear here when people buy or reserve tickets.',
      allEvents: 'All events',
      eventFilter: 'Event',
      dateFilter: 'Date',
      allDates: 'All dates',
      month: 'Month',
      dates: 'Dates',
      from: 'From',
      to: 'To',
      year: 'Year',
      day: 'Day',
      clearDate: 'Clear',
      shownOrders: 'Shown orders',
      soldTickets: 'Sold tickets',
      reservedTickets: 'Reserved tickets',
      refundsCount: 'Refunds',
      refundedAmount: 'Amount',
      order: 'Order',
      amount: 'Full Amount',
      paid: 'Paid',
      balance: 'Balance',
      deadline: 'Balance deadline',
      payment: 'Payment',
      checkIn: 'Check-in',
      netAfterFee: 'after 15% fee',
      status: { paid: 'paid', reserved: 'reserved', pending: 'pending', checked: 'checked', 'not-checked': 'not checked', 'checked-in': 'checked-in', 'not-checked-in': 'not checked', 'no-ticket-yet': 'no ticket yet' } as Record<string, string>,
    },
    ru: {
      title: 'Analytics and Orders',
      subtitle: 'Покупки и брони по вашим опубликованным событиям.',
      emptyTitle: 'Заказов пока нет',
      emptyDesc: 'Заказы и брони появятся здесь, когда люди купят или забронируют билеты.',
      allEvents: 'Все события',
      eventFilter: 'Событие',
      dateFilter: 'Дата',
      allDates: 'Все даты',
      month: 'Месяц',
      dates: 'Даты',
      from: 'С',
      to: 'До',
      year: 'Год',
      day: 'День',
      clearDate: 'Очистить',
      shownOrders: 'Показано заказов',
      soldTickets: 'Продано билетов',
      reservedTickets: 'Билетов в бронях',
      refundsCount: 'Refunds',
      refundedAmount: 'Amount',
      order: 'Заказ',
      amount: 'Полная сумма',
      paid: 'Оплачено',
      balance: 'Остаток',
      deadline: 'Оплатить до',
      payment: 'Оплата',
      checkIn: 'Вход',
      netAfterFee: 'после комиссии 15%',
      status: { paid: 'оплачено', reserved: 'бронь', pending: 'ожидает', checked: 'проверен', 'not-checked': 'не проверен', 'checked-in': 'вошёл', 'not-checked-in': 'не проверен', 'no-ticket-yet': 'билета ещё нет' } as Record<string, string>,
    },
    kk: {
      title: 'Analytics and Orders',
      subtitle: 'Жарияланған іс-шараларыңыз бойынша сатып алулар мен броньдар.',
      emptyTitle: 'Әзірге тапсырыс жоқ',
      emptyDesc: 'Адамдар билет сатып алғанда немесе брондағанда, тапсырыстар осында пайда болады.',
      allEvents: 'Барлық іс-шаралар',
      eventFilter: 'Іс-шара',
      dateFilter: 'Күн',
      allDates: 'Барлық күндер',
      month: 'Ай',
      dates: 'Күндер',
      from: 'Бастап',
      to: 'Дейін',
      year: 'Жыл',
      day: 'Күн',
      clearDate: 'Тазарту',
      shownOrders: 'Көрсетілген тапсырыс',
      soldTickets: 'Сатылған билеттер',
      reservedTickets: 'Броньдағы билеттер',
      refundsCount: 'Refunds',
      refundedAmount: 'Amount',
      order: 'Тапсырыс',
      amount: 'Толық сома',
      paid: 'Төленді',
      balance: 'Қалдық',
      deadline: 'Дейін төлеу',
      payment: 'Төлем',
      checkIn: 'Кіру',
      netAfterFee: '15% комиссиядан кейін',
      status: { paid: 'төленді', reserved: 'бронь', pending: 'күтуде', checked: 'тексерілді', 'not-checked': 'тексерілмеді', 'checked-in': 'кірді', 'not-checked-in': 'тексерілмеді', 'no-ticket-yet': 'билет әлі жоқ' } as Record<string, string>,
    },
  }[language];

  const [selectedEventId, setSelectedEventId] = useState('all');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthValue());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1).padStart(2, '0'),
      label: new Date(2026, index, 1).toLocaleDateString(locale, { month: 'long' }),
    })),
    [locale]
  );
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>([currentYear - 1, currentYear, currentYear + 1]);
    orders.forEach((order) => {
      const date = new Date(order.purchaseDate);
      if (!Number.isNaN(date.getTime())) years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);
  const updateSelectedMonthPart = (part: 'year' | 'month', value: string) => {
    if (!value) {
      setSelectedMonth('');
      return;
    }
    const today = new Date();
    const [currentYear, currentMonth] = selectedMonth.split('-');
    const nextYear = part === 'year' ? value : (currentYear || String(today.getFullYear()));
    const nextMonth = part === 'month' ? value : (currentMonth || String(today.getMonth() + 1).padStart(2, '0'));
    setSelectedMonth(`${nextYear}-${nextMonth}`);
  };
  const renderDatePartSelects = (
    value: string,
    onChange: (nextValue: string) => void,
    idPrefix: string
  ) => {
    const parts = parseDateParts(value);
    const fallbackYear = Number(parts.year || new Date().getFullYear());
    const fallbackMonth = Number(parts.month || new Date().getMonth() + 1);
    const dayCount = getDaysInMonth(fallbackYear, fallbackMonth);

    return (
      <div className="organizer-date-select-grid">
        <select
          id={`${idPrefix}-year`}
          value={parts.year}
          onChange={(event) => onChange(updateDatePartValue(value, 'year', event.target.value))}
        >
          <option value="">{copy.year}</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          id={`${idPrefix}-month`}
          value={parts.month}
          onChange={(event) => onChange(updateDatePartValue(value, 'month', event.target.value))}
        >
          <option value="">{copy.month}</option>
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
        <select
          id={`${idPrefix}-day`}
          value={parts.day}
          onChange={(event) => onChange(updateDatePartValue(value, 'day', event.target.value))}
        >
          <option value="">{copy.day}</option>
          {Array.from({ length: dayCount }, (_, index) => {
            const day = String(index + 1).padStart(2, '0');
            return <option key={day} value={day}>{index + 1}</option>;
          })}
        </select>
      </div>
    );
  };
  const eventOptions = useMemo(() => {
    const events = new Map<string, string>();
    orders.forEach((order) => {
      const id = String(order.eventId || order.eventTitle || order.id);
      if (!events.has(id)) events.set(id, order.eventTitle || id);
    });
    return Array.from(events.entries()).map(([id, title]) => ({ id, title }));
  }, [orders]);
  const selectedEventTitle = selectedEventId === 'all'
    ? copy.allEvents
    : eventOptions.find((event) => event.id === selectedEventId)?.title || copy.allEvents;
  const eventFilteredOrders = selectedEventId === 'all'
    ? orders
    : orders.filter((order) => String(order.eventId || order.eventTitle || order.id) === selectedEventId);
  const visibleOrders = eventFilteredOrders.filter((order) => {
    if (dateFilterMode === 'all') return true;

    const purchaseDate = new Date(order.purchaseDate);
    if (Number.isNaN(purchaseDate.getTime())) return false;

    if (dateFilterMode === 'month') {
      return selectedMonth ? formatMonthValue(purchaseDate) === selectedMonth : true;
    }

    const fromDate = parseDateInput(dateFrom);
    const toDate = parseDateInput(dateTo, true);
    if (!fromDate && !toDate) return true;
    if (fromDate && purchaseDate < fromDate) return false;
    if (toDate && purchaseDate > toDate) return false;
    return true;
  });
  const dateFilterLabel = (() => {
    if (dateFilterMode === 'month') return selectedMonth ? formatMonthLabel(selectedMonth, locale) : copy.month;
    if (dateFilterMode === 'range') {
      if (dateFrom && dateTo) return `${formatDateInputLabel(dateFrom, locale)} - ${formatDateInputLabel(dateTo, locale)}`;
      if (dateFrom) return `${copy.from}: ${formatDateInputLabel(dateFrom, locale)}`;
      if (dateTo) return `${copy.to}: ${formatDateInputLabel(dateTo, locale)}`;
      return copy.dates;
    }
    return copy.allDates;
  })();
  const clearDateFilter = () => {
    setDateFilterMode('all');
    setSelectedMonth(getCurrentMonthValue());
    setDateFrom('');
    setDateTo('');
  };
  const totalPaid = visibleOrders.reduce((sum, order) => sum + organizerNetAmount(Number(order.amountPaid ?? order.total) || 0), 0);
  const totalBalance = visibleOrders.reduce((sum, order) => sum + organizerNetAmount(Number(order.balanceDue) || 0), 0);
  const ticketsSold = visibleOrders
    .filter((order) => order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);
  const reservedTickets = visibleOrders
    .filter((order) => order.paymentStatus === 'reserved')
    .reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);
  const reservedCount = visibleOrders.filter((order) => order.paymentStatus === 'reserved').length;
  const checkedInCount = visibleOrders.filter((order) => ['checked', 'checked-in'].includes(order.checkInStatus)).length;
  const paymentTone = (status: string) => (status === 'reserved' ? 'warning' : status === 'paid' ? 'success' : 'neutral');
  const checkInTone = (status: string) => (['checked', 'checked-in'].includes(status) ? 'success' : 'neutral');

  const metrics = [
    { label: copy.shownOrders, value: visibleOrders.length, helper: selectedEventTitle, tone: 'violet' },
    { label: copy.soldTickets, value: ticketsSold, helper: selectedEventTitle, tone: 'blue' },
    { label: copy.reservedTickets, value: reservedTickets, helper: `${reservedCount} ${copy.status.reserved}`, tone: 'amber' },
    { label: copy.paid, value: formatCurrency(totalPaid), helper: copy.netAfterFee, tone: 'green' },
    { label: copy.balance, value: formatCurrency(totalBalance), helper: `${reservedCount} ${copy.status.reserved} · ${copy.netAfterFee}`, tone: 'amber' },
    {
      label: copy.refundsCount,
      value: String(analytics?.refundsCount || 0),
      helper: `${copy.refundedAmount}: ${formatCurrency(analytics?.refundedAmount || 0)}`,
      tone: 'amber',
    },
    { label: copy.checkIn, value: visibleOrders.length ? `${checkedInCount}/${visibleOrders.length}` : '0', helper: copy.checkIn, tone: 'cyan' },
  ];

  return (
    <div className="organizer-data-page organizer-orders-page">
      <section className="organizer-hero organizer-data-hero">
        <div>
          <div className="organizer-eyebrow">
            <ReceiptText aria-hidden="true" />
            <span>{copy.order}</span>
          </div>
          <h1>{copy.title}</h1>
          <p>{selectedEventId === 'all' ? copy.subtitle : selectedEventTitle}</p>
        </div>
        <div className="organizer-hero-stats" aria-label={copy.title}>
          <span>{visibleOrders.length}</span>
          <small>{copy.title}</small>
        </div>
      </section>

      <section className="organizer-data-metrics" aria-label={copy.title}>
        {metrics.map((metric) => {
          return (
            <article key={metric.label} className={`organizer-data-metric tone-${metric.tone}`}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="organizer-panel organizer-data-panel">
        <div className="organizer-panel-header">
          <div>
            <span className="organizer-section-label">{copy.payment}</span>
            <h2>{copy.title}</h2>
          </div>
          <div className="organizer-orders-controls">
            <div className="organizer-orders-filter">
              <label htmlFor="organizer-order-event">{copy.eventFilter}</label>
              <select
                id="organizer-order-event"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
              >
                <option value="all">{copy.allEvents}</option>
                {eventOptions.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>

            <div className="organizer-date-filter">
              <label htmlFor="organizer-order-date-button">{copy.dateFilter}</label>
              <button
                id="organizer-order-date-button"
                type="button"
                className={`organizer-date-button ${dateFilterOpen ? 'is-active' : ''}`}
                onClick={() => setDateFilterOpen((open) => !open)}
                aria-expanded={dateFilterOpen}
                aria-controls="organizer-order-date-panel"
              >
                <CalendarDays aria-hidden="true" />
                <span>{dateFilterLabel}</span>
              </button>

              {dateFilterOpen && (
                <div id="organizer-order-date-panel" className="organizer-date-panel">
                  <div className="organizer-date-modes" role="group" aria-label={copy.dateFilter}>
                    {([
                      ['all', copy.allDates],
                      ['month', copy.month],
                      ['range', copy.dates],
                    ] as Array<[DateFilterMode, string]>).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        className={dateFilterMode === mode ? 'is-active' : ''}
                        onClick={() => setDateFilterMode(mode)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {dateFilterMode === 'month' && (
                    <div className="organizer-date-field">
                      <label htmlFor="organizer-order-month">{copy.month}</label>
                      <div className="organizer-date-select-grid organizer-date-select-grid-month">
                        <select
                          id="organizer-order-month-year"
                          value={selectedMonth.split('-')[0] || ''}
                          onChange={(event) => updateSelectedMonthPart('year', event.target.value)}
                        >
                          <option value="">{copy.year}</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <select
                          id="organizer-order-month"
                          value={selectedMonth.split('-')[1] || ''}
                          onChange={(event) => updateSelectedMonthPart('month', event.target.value)}
                        >
                          <option value="">{copy.month}</option>
                          {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {dateFilterMode === 'range' && (
                    <div className="organizer-date-fields">
                      <div className="organizer-date-field">
                        <label htmlFor="organizer-order-date-from">{copy.from}</label>
                        {renderDatePartSelects(dateFrom, setDateFrom, 'organizer-order-date-from')}
                      </div>
                      <div className="organizer-date-field">
                        <label htmlFor="organizer-order-date-to">{copy.to}</label>
                        {renderDatePartSelects(dateTo, setDateTo, 'organizer-order-date-to')}
                      </div>
                    </div>
                  )}

                  <button type="button" className="organizer-date-clear" onClick={clearDateFilter}>
                    {copy.clearDate}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="organizer-empty-state organizer-data-empty">
            <Ticket aria-hidden="true" />
            <h3>{copy.emptyTitle}</h3>
            <p>{copy.emptyDesc}</p>
          </div>
        ) : (
          <div className="organizer-orders-list">
            {visibleOrders.map((order) => (
              <article key={order.id} className="organizer-order-row">
                <div className="organizer-order-main">
                  <div className="organizer-order-title-line">
                    <span className="organizer-section-label">{copy.order}</span>
                    <span className={`organizer-status-pill tone-${paymentTone(order.paymentStatus)}`}>
                      {copy.status[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </div>
                  <h3>{order.eventTitle}</h3>

                  <div className="organizer-order-meta">
                    <span>{order.buyerName}</span>
                    <span>{order.buyerEmail}</span>
                    <span>{order.quantity}x {order.ticketType}</span>
                    <span>{formatDate(order.purchaseDate, locale)}</span>
                  </div>
                </div>

                <div className="organizer-order-finance-grid">
                  <div>
                    <span>{copy.amount}</span>
                    <strong>{formatCurrency(order.total)}</strong>
                    {order.paymentStatus === 'reserved' && (
                      <small>
                        {copy.paid}: {formatCurrency(order.amountPaid || 0)}
                        {' · '}
                        {copy.balance}: {formatCurrency(order.balanceDue || 0)}
                      </small>
                    )}
                    {order.balanceDueDeadlineAt && (
                      <small>{copy.deadline}: {formatDate(order.balanceDueDeadlineAt)}</small>
                    )}
                  </div>
                  <div>
                    <span>{copy.payment}</span>
                    <strong className={`organizer-value tone-${paymentTone(order.paymentStatus)}`}>
                      {copy.status[order.paymentStatus] || order.paymentStatus}
                    </strong>
                  </div>
                  <div>
                    <span>{copy.checkIn}</span>
                    <strong className={`organizer-value tone-${checkInTone(order.checkInStatus)}`}>
                      {copy.status[order.checkInStatus] || order.checkInStatus}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
