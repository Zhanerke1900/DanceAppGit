import React, { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useI18n } from '../i18n';

type DateFilterMode = 'all' | 'month' | 'range';

type AdminAnalyticsOrder = {
  id: string;
  organizerId: string;
  organizerName?: string;
  organizerEmail?: string;
  organizationName?: string;
  eventId?: string;
  eventTitle?: string;
  quantity?: number;
  grossPaid?: number;
  netRevenue?: number;
  platformFee?: number;
  netBalanceDue?: number;
  paymentStatus?: string;
  purchaseDate?: string;
  day?: string;
};

type AdminAnalyticsProps = {
  analytics: {
    summary?: Record<string, any>;
    organizers?: Array<Record<string, any>>;
    orders?: AdminAnalyticsOrder[];
  } | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0)) + ' KZT';

const getLocale = (language: string) =>
  language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';

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

const formatDateLabel = (value: string, locale = 'en-US') => {
  const date = parseDateInput(value);
  if (!date) return value;
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
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

const orderDate = (order: AdminAnalyticsOrder) => {
  const date = new Date(order.purchaseDate || order.day || '');
  return Number.isNaN(date.getTime()) ? null : date;
};

const money = (value: number) => Number(Number(value || 0).toFixed(2));

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ analytics }) => {
  const { language } = useI18n();
  const locale = getLocale(language);
  const copy = {
    en: {
      title: 'Analytics',
      subtitle: 'Organizer revenue after the 15% service fee, grouped for payouts.',
      organizer: 'Organizer',
      allOrganizers: 'All organizers',
      dateFilter: 'Date',
      allDates: 'All dates',
      month: 'Month',
      dates: 'Dates',
      from: 'From',
      to: 'To',
      year: 'Year',
      day: 'Day',
      clearDate: 'Clear',
      salaryDue: 'Payout due',
      totalRevenue: 'Organizer revenue',
      grossRevenue: 'Gross paid',
      platformFee: 'Service fee',
      outstandingBalance: 'Reserved balance',
      orders: 'Orders',
      tickets: 'Tickets',
      reservations: 'Reservations',
      refunds: 'Refunds',
      afterFee: 'after 15% fee',
      beforeFee: 'before service fee',
      payoutTable: 'Organizer payouts',
      salesByDate: 'Sales by date',
      topEvents: 'Top events',
      event: 'Event',
      noData: 'No analytics data for this selection.',
      organization: 'Organization',
      status: 'Status',
    },
    ru: {
      title: 'Аналитика',
      subtitle: 'Доход организаторов после комиссии 15%, с разбивкой для выплат.',
      organizer: 'Организатор',
      allOrganizers: 'Все организаторы',
      dateFilter: 'Дата',
      allDates: 'Все даты',
      month: 'Месяц',
      dates: 'Даты',
      from: 'С',
      to: 'До',
      year: 'Год',
      day: 'День',
      clearDate: 'Очистить',
      salaryDue: 'К выплате',
      totalRevenue: 'Доход организатора',
      grossRevenue: 'Оплачено всего',
      platformFee: 'Service fee',
      outstandingBalance: 'Остаток броней',
      orders: 'Заказы',
      tickets: 'Билеты',
      reservations: 'Брони',
      refunds: 'Возвраты',
      afterFee: 'после комиссии 15%',
      beforeFee: 'до комиссии',
      payoutTable: 'Выплаты организаторам',
      salesByDate: 'Продажи по датам',
      topEvents: 'Топ событий',
      event: 'Событие',
      noData: 'Нет данных аналитики для этой выборки.',
      organization: 'Организация',
      status: 'Статус',
    },
    kk: {
      title: 'Аналитика',
      subtitle: '15% комиссиядан кейінгі ұйымдастырушы табысы, төлемдерге бөлінген.',
      organizer: 'Ұйымдастырушы',
      allOrganizers: 'Барлық ұйымдастырушылар',
      dateFilter: 'Күн',
      allDates: 'Барлық күндер',
      month: 'Ай',
      dates: 'Күндер',
      from: 'Бастап',
      to: 'Дейін',
      year: 'Жыл',
      day: 'Күн',
      clearDate: 'Тазарту',
      salaryDue: 'Төлеуге',
      totalRevenue: 'Ұйымдастырушы табысы',
      grossRevenue: 'Жалпы төленді',
      platformFee: 'Service fee',
      outstandingBalance: 'Бронь қалдығы',
      orders: 'Тапсырыстар',
      tickets: 'Билеттер',
      reservations: 'Броньдар',
      refunds: 'Қайтарымдар',
      afterFee: '15% комиссиядан кейін',
      beforeFee: 'комиссияға дейін',
      payoutTable: 'Ұйымдастырушыларға төлемдер',
      salesByDate: 'Күндер бойынша сатылым',
      topEvents: 'Үздік іс-шаралар',
      event: 'Іс-шара',
      noData: 'Бұл таңдауға аналитика деректері жоқ.',
      organization: 'Ұйым',
      status: 'Статус',
    },
  }[language];

  const orders = useMemo(() => Array.isArray(analytics?.orders) ? analytics.orders : [], [analytics]);
  const organizers = useMemo(() => Array.isArray(analytics?.organizers) ? analytics.organizers : [], [analytics]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('all');
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
    const years = new Set<number>();
    for (let year = currentYear - 3; year <= currentYear + 1; year += 1) years.add(year);
    orders.forEach((order) => {
      const date = orderDate(order);
      if (date) years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const organizerOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    organizers.forEach((organizer) => {
      const id = String(organizer.organizerId || organizer.id || '');
      if (!id) return;
      map.set(id, {
        id,
        label: organizer.organizationName || organizer.organizerName || organizer.organizerEmail || id,
      });
    });
    orders.forEach((order) => {
      const id = String(order.organizerId || '');
      if (!id || map.has(id)) return;
      map.set(id, {
        id,
        label: order.organizationName || order.organizerName || order.organizerEmail || id,
      });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [organizers, orders]);

  const organizerLookup = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    organizers.forEach((organizer) => {
      const id = String(organizer.organizerId || organizer.id || '');
      if (id) map.set(id, organizer);
    });
    return map;
  }, [organizers]);

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
      <div className="admin-analytics-date-select-grid">
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

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedOrganizerId !== 'all' && String(order.organizerId) !== selectedOrganizerId) return false;
      if (dateFilterMode === 'all') return true;

      const date = orderDate(order);
      if (!date) return false;

      if (dateFilterMode === 'month') {
        return selectedMonth ? formatMonthValue(date) === selectedMonth : true;
      }

      const fromDate = parseDateInput(dateFrom);
      const toDate = parseDateInput(dateTo, true);
      if (!fromDate && !toDate) return true;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    });
  }, [orders, selectedOrganizerId, dateFilterMode, selectedMonth, dateFrom, dateTo]);

  const selectedOrganizerLabel = selectedOrganizerId === 'all'
    ? copy.allOrganizers
    : organizerOptions.find((organizer) => organizer.id === selectedOrganizerId)?.label || copy.organizer;

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

  const summary = useMemo(() => {
    const base = {
      salaryDue: 0,
      totalRevenue: 0,
      grossRevenue: 0,
      platformFee: 0,
      outstandingBalance: 0,
      ordersCount: visibleOrders.length,
      ticketsSold: 0,
      reservedTickets: 0,
      reservationsCount: 0,
      refundsCount: 0,
      refundedAmount: 0,
    };

    visibleOrders.forEach((order) => {
      base.totalRevenue += Number(order.netRevenue || 0);
      base.salaryDue += Number(order.netRevenue || 0);
      base.grossRevenue += Number(order.grossPaid || 0);
      base.platformFee += Number(order.platformFee || 0);
      base.outstandingBalance += Number(order.netBalanceDue || 0);
      if (order.paymentStatus === 'paid') base.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === 'reserved') {
        base.reservedTickets += Number(order.quantity || 0);
        base.reservationsCount += 1;
      }
    });

    if (selectedOrganizerId !== 'all' && dateFilterMode === 'all') {
      const organizer = organizerLookup.get(selectedOrganizerId);
      base.refundsCount = Number(organizer?.refundsCount || 0);
      base.refundedAmount = Number(organizer?.refundedAmount || 0);
    } else if (selectedOrganizerId === 'all' && dateFilterMode === 'all') {
      base.refundsCount = Number(analytics?.summary?.refundsCount || 0);
      base.refundedAmount = Number(analytics?.summary?.refundedAmount || 0);
    }

    return {
      ...base,
      salaryDue: money(base.salaryDue),
      totalRevenue: money(base.totalRevenue),
      grossRevenue: money(base.grossRevenue),
      platformFee: money(base.platformFee),
      outstandingBalance: money(base.outstandingBalance),
      refundedAmount: money(base.refundedAmount),
    };
  }, [visibleOrders, selectedOrganizerId, dateFilterMode, organizerLookup, analytics]);

  const organizerRows = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    const seed = (organizerId: string) => {
      const id = String(organizerId || 'unknown');
      const existing = map.get(id);
      if (existing) return existing;
      const organizer = organizerLookup.get(id);
      const row = {
        organizerId: id,
        organizerName: organizer?.organizerName || copy.organizer,
        organizerEmail: organizer?.organizerEmail || '',
        organizationName: organizer?.organizationName || '',
        organizerStatus: organizer?.organizerStatus || '',
        eventsCount: Number(organizer?.eventsCount || 0),
        publishedEvents: Number(organizer?.publishedEvents || 0),
        pendingEvents: Number(organizer?.pendingEvents || 0),
        refundsCount: Number(organizer?.refundsCount || 0),
        refundedAmount: Number(organizer?.refundedAmount || 0),
        grossRevenue: 0,
        totalRevenue: 0,
        platformFee: 0,
        outstandingBalance: 0,
        ordersCount: 0,
        ticketsSold: 0,
        reservedTickets: 0,
        reservationsCount: 0,
        salaryDue: 0,
      };
      map.set(id, row);
      return row;
    };

    if (selectedOrganizerId !== 'all') seed(selectedOrganizerId);
    if (selectedOrganizerId === 'all' && dateFilterMode === 'all') {
      organizers.forEach((organizer) => seed(String(organizer.organizerId || organizer.id || '')));
    }

    visibleOrders.forEach((order) => {
      const row = seed(String(order.organizerId || 'unknown'));
      row.grossRevenue += Number(order.grossPaid || 0);
      row.totalRevenue += Number(order.netRevenue || 0);
      row.platformFee += Number(order.platformFee || 0);
      row.outstandingBalance += Number(order.netBalanceDue || 0);
      row.ordersCount += 1;
      row.salaryDue += Number(order.netRevenue || 0);
      if (order.paymentStatus === 'paid') row.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === 'reserved') {
        row.reservedTickets += Number(order.quantity || 0);
        row.reservationsCount += 1;
      }
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        grossRevenue: money(row.grossRevenue),
        totalRevenue: money(row.totalRevenue),
        platformFee: money(row.platformFee),
        outstandingBalance: money(row.outstandingBalance),
        salaryDue: money(row.salaryDue),
      }))
      .sort((a, b) => Number(b.salaryDue || 0) - Number(a.salaryDue || 0));
  }, [visibleOrders, selectedOrganizerId, dateFilterMode, organizerLookup, organizers, copy.organizer]);

  const salesByDay = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    visibleOrders.forEach((order) => {
      const date = order.day || (orderDate(order)?.toISOString().slice(0, 10) ?? '');
      if (!date) return;
      const row = map.get(date) || {
        date,
        revenue: 0,
        grossRevenue: 0,
        platformFee: 0,
        orders: 0,
        ticketsSold: 0,
        reservations: 0,
      };
      row.revenue += Number(order.netRevenue || 0);
      row.grossRevenue += Number(order.grossPaid || 0);
      row.platformFee += Number(order.platformFee || 0);
      row.orders += 1;
      if (order.paymentStatus === 'paid') row.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === 'reserved') row.reservations += 1;
      map.set(date, row);
    });
    return Array.from(map.values())
      .map((row) => ({
        ...row,
        revenue: money(row.revenue),
        grossRevenue: money(row.grossRevenue),
        platformFee: money(row.platformFee),
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 8);
  }, [visibleOrders]);

  const topEvents = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    visibleOrders.forEach((order) => {
      const key = String(order.eventId || `${order.organizerId}-${order.eventTitle}`);
      const row = map.get(key) || {
        eventId: order.eventId,
        title: order.eventTitle || copy.event,
        organizerName: order.organizationName || order.organizerName || copy.organizer,
        revenue: 0,
        orders: 0,
        ticketsSold: 0,
        reservations: 0,
      };
      row.revenue += Number(order.netRevenue || 0);
      row.orders += 1;
      if (order.paymentStatus === 'paid') row.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === 'reserved') row.reservations += 1;
      map.set(key, row);
    });
    return Array.from(map.values())
      .map((row) => ({ ...row, revenue: money(row.revenue) }))
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .slice(0, 8);
  }, [visibleOrders, copy.event, copy.organizer]);

  const metrics = [
    { label: copy.salaryDue, value: formatCurrency(summary.salaryDue), helper: copy.afterFee, tone: 'emerald' },
    { label: copy.grossRevenue, value: formatCurrency(summary.grossRevenue), helper: copy.beforeFee, tone: 'violet' },
    { label: copy.platformFee, value: formatCurrency(summary.platformFee), helper: '15%', tone: 'cyan' },
    { label: copy.outstandingBalance, value: formatCurrency(summary.outstandingBalance), helper: copy.reservations, tone: 'amber' },
    { label: copy.orders, value: summary.ordersCount, helper: selectedOrganizerLabel, tone: 'slate' },
    { label: copy.tickets, value: summary.ticketsSold, helper: `${summary.reservedTickets} ${copy.reservations}`, tone: 'rose' },
  ];

  return (
    <div className="admin-section-shell admin-analytics-view">
      <div className="admin-section-heading admin-analytics-heading">
        <div>
          <span className="admin-section-kicker">{copy.title}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <div className="admin-analytics-toolbar">
        <label className="admin-analytics-control" htmlFor="admin-analytics-organizer">
          <span>{copy.organizer}</span>
          <select
            id="admin-analytics-organizer"
            value={selectedOrganizerId}
            onChange={(event) => setSelectedOrganizerId(event.target.value)}
          >
            <option value="all">{copy.allOrganizers}</option>
            {organizerOptions.map((organizer) => (
              <option key={organizer.id} value={organizer.id}>{organizer.label}</option>
            ))}
          </select>
        </label>

        <div className="admin-analytics-date-filter">
          <label htmlFor="admin-analytics-date-button">{copy.dateFilter}</label>
          <button
            id="admin-analytics-date-button"
            type="button"
            className={`admin-analytics-date-button ${dateFilterOpen ? 'is-active' : ''}`}
            onClick={() => setDateFilterOpen((open) => !open)}
            aria-expanded={dateFilterOpen}
            aria-controls="admin-analytics-date-panel"
          >
            <CalendarDays aria-hidden="true" />
            <span>{dateFilterLabel}</span>
          </button>

          {dateFilterOpen && (
            <div id="admin-analytics-date-panel" className="admin-analytics-date-panel">
              <div className="admin-analytics-date-modes" role="group" aria-label={copy.dateFilter}>
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
                <div className="admin-analytics-date-field">
                  <label htmlFor="admin-analytics-month">{copy.month}</label>
                  <div className="admin-analytics-date-select-grid admin-analytics-date-select-grid-month">
                    <select
                      id="admin-analytics-month-year"
                      value={selectedMonth.split('-')[0] || ''}
                      onChange={(event) => updateSelectedMonthPart('year', event.target.value)}
                    >
                      <option value="">{copy.year}</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select
                      id="admin-analytics-month"
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
                <div className="admin-analytics-date-fields">
                  <div className="admin-analytics-date-field">
                    <label htmlFor="admin-analytics-date-from">{copy.from}</label>
                    {renderDatePartSelects(dateFrom, setDateFrom, 'admin-analytics-date-from')}
                  </div>
                  <div className="admin-analytics-date-field">
                    <label htmlFor="admin-analytics-date-to">{copy.to}</label>
                    {renderDatePartSelects(dateTo, setDateTo, 'admin-analytics-date-to')}
                  </div>
                </div>
              )}

              <button type="button" className="admin-analytics-date-clear" onClick={clearDateFilter}>
                {copy.clearDate}
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="admin-kpi-grid admin-analytics-kpi-grid" aria-label={copy.title}>
        {metrics.map((metric) => (
          <article key={metric.label} className={`admin-stat-card admin-stat-${metric.tone}`}>
            <div className="admin-card-topline">
              <span className="admin-stat-title">{metric.label}</span>
            </div>
            <div className="admin-stat-value">{metric.value}</div>
            <div className="admin-stat-change">{metric.helper}</div>
          </article>
        ))}
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-surface admin-analytics-table-card admin-analytics-table-card-wide">
          <div className="admin-section-heading admin-section-heading-compact">
            <div>
              <span className="admin-section-kicker">{copy.salaryDue}</span>
              <h2>{copy.payoutTable}</h2>
            </div>
          </div>

          {organizerRows.length === 0 ? (
            <div className="admin-empty-state">{copy.noData}</div>
          ) : (
            <div className="admin-analytics-table admin-analytics-payout-table">
              <div className="admin-analytics-row admin-analytics-head">
                <span>{copy.organizer}</span>
                <span>{copy.salaryDue}</span>
                <span>{copy.grossRevenue}</span>
                <span>{copy.platformFee}</span>
                <span>{copy.outstandingBalance}</span>
                <span>{copy.orders}</span>
                <span>{copy.tickets}</span>
                <span>{copy.reservations}</span>
              </div>
              {organizerRows.map((organizer) => (
                <div key={organizer.organizerId} className="admin-analytics-row">
                  <div className="admin-analytics-entity">
                    <strong>{organizer.organizationName || organizer.organizerName}</strong>
                    <span>{organizer.organizerName} {organizer.organizerEmail ? `| ${organizer.organizerEmail}` : ''}</span>
                    <small>{copy.status}: {organizer.organizerStatus || '-'}</small>
                  </div>
                  <span data-label={copy.salaryDue}>{formatCurrency(organizer.salaryDue)}</span>
                  <span data-label={copy.grossRevenue}>{formatCurrency(organizer.grossRevenue)}</span>
                  <span data-label={copy.platformFee}>{formatCurrency(organizer.platformFee)}</span>
                  <span data-label={copy.outstandingBalance}>{formatCurrency(organizer.outstandingBalance)}</span>
                  <span data-label={copy.orders}>{organizer.ordersCount}</span>
                  <span data-label={copy.tickets}>{organizer.ticketsSold}</span>
                  <span data-label={copy.reservations}>{organizer.reservationsCount}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-surface admin-analytics-table-card">
          <div className="admin-section-heading admin-section-heading-compact">
            <div>
              <span className="admin-section-kicker">{copy.dates}</span>
              <h2>{copy.salesByDate}</h2>
            </div>
          </div>

          <div className="admin-analytics-list">
            {salesByDay.length === 0 ? (
              <div className="admin-empty-state">{copy.noData}</div>
            ) : salesByDay.map((item) => (
              <div key={item.date} className="admin-analytics-mini-row">
                <div>
                  <strong>{formatDateLabel(item.date, locale)}</strong>
                  <span>{item.orders} {copy.orders} | {item.ticketsSold} {copy.tickets}</span>
                </div>
                <b>{formatCurrency(item.revenue)}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-surface admin-analytics-table-card">
          <div className="admin-section-heading admin-section-heading-compact">
            <div>
              <span className="admin-section-kicker">{copy.event}</span>
              <h2>{copy.topEvents}</h2>
            </div>
          </div>

          <div className="admin-analytics-list">
            {topEvents.length === 0 ? (
              <div className="admin-empty-state">{copy.noData}</div>
            ) : topEvents.map((event) => (
              <div key={`${event.eventId || event.title}-${event.organizerName}`} className="admin-analytics-mini-row">
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.organizerName} | {event.orders} {copy.orders}</span>
                </div>
                <b>{formatCurrency(event.revenue)}</b>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
