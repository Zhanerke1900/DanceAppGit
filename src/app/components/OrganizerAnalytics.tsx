import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n';

interface AnalyticsData {
  totalRevenue: number;
  ticketsSold: number;
  reservedTickets?: number;
  reservationsCount?: number;
  outstandingBalance?: number;
  averageOrderValue?: number;
  refundsCount?: number;
  refundedAmount?: number;
  ordersCount: number;
  topEvents: Array<{
    eventId: string;
    title: string;
    orders: number;
    ticketsSold: number;
    reservedTickets?: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
    ticketsSold: number;
    reservations?: number;
  }>;
  eventStatuses: {
    published: number;
    pending: number;
  };
  specialPrograms: {
    fullEventPassTickets: number;
    activityTickets: number;
  };
}

interface OrganizerAnalyticsProps {
  analytics: AnalyticsData | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' KZT';

export const OrganizerAnalytics: React.FC<OrganizerAnalyticsProps> = ({ analytics }) => {
  const { language } = useI18n();
  const copy = {
    en: {
      title: 'Analytics',
      subtitle: 'Live performance snapshot for your organizer account.',
      totalRevenue: 'Total Revenue',
      ticketsSold: 'Tickets Sold',
      reservedTickets: 'Reserved Tickets',
      reservationsCount: 'Reservations',
      outstandingBalance: 'Outstanding Balance',
      averageOrderValue: 'Average Order',
      refundsCount: 'Refunds',
      refundedAmount: 'Amount',
      ordersCount: 'Orders Count',
      topEvents: 'Top by Revenue',
      topEventsDesc: 'Sorted by revenue already collected: full payments plus reservation deposits.',
      salesByDay: 'Sales by Day',
      salesByDayDesc: 'Revenue, orders, and tickets sold per date.',
      noSales: 'No sales yet.',
      publishedVsPending: 'Published vs Pending',
      statusSplit: 'Status split for your created events.',
      published: 'Published',
      pending: 'Pending',
      specialProgramSales: 'Special Program Sales',
      specialProgramDesc: 'Full event pass vs separate activities.',
      fullEventPass: 'Full Event Pass',
      activityTickets: 'Activity Tickets',
      topEventsEmpty: 'Top revenue events will appear after your first sales.',
      orders: 'orders',
      tickets: 'tickets',
    },
    ru: {
      title: 'Аналитика',
      subtitle: 'Актуальная статистика по аккаунту организатора.',
      totalRevenue: 'Общая выручка',
      ticketsSold: 'Продано билетов',
      reservedTickets: 'Билетов в бронях',
      reservationsCount: 'Брони',
      outstandingBalance: 'Остаток к оплате',
      averageOrderValue: 'Средний чек',
      refundsCount: 'Возвраты',
      refundedAmount: 'Сумма',
      ordersCount: 'Количество заказов',
      topEvents: 'Топ по выручке',
      topEventsDesc: 'Сортировка по уже внесенной выручке: полные оплаты плюс предоплаты по броням.',
      salesByDay: 'Продажи по дням',
      salesByDayDesc: 'Выручка, заказы и проданные билеты по датам.',
      noSales: 'Продаж пока нет.',
      publishedVsPending: 'Опубликованные и на проверке',
      statusSplit: 'Распределение статусов ваших событий.',
      published: 'Опубликовано',
      pending: 'На проверке',
      specialProgramSales: 'Продажи специальных программ',
      specialProgramDesc: 'Полный абонемент на событие и отдельные активности.',
      fullEventPass: 'Полный абонемент',
      activityTickets: 'Билеты на активности',
      topEventsEmpty: 'Топ по выручке появится после первых продаж.',
      orders: 'заказов',
      tickets: 'билетов',
    },
    kk: {
      title: 'Аналитика',
      subtitle: 'Ұйымдастырушы аккаунты бойынша ағымдағы көрсеткіштер.',
      totalRevenue: 'Жалпы табыс',
      ticketsSold: 'Сатылған билеттер',
      reservedTickets: 'Броньдағы билеттер',
      reservationsCount: 'Броньдар',
      outstandingBalance: 'Төленетін қалдық',
      averageOrderValue: 'Орташа чек',
      refundsCount: 'Қайтарымдар',
      refundedAmount: 'Сома',
      ordersCount: 'Тапсырыс саны',
      topEvents: 'Табыс бойынша топ',
      topEventsDesc: 'Жиналған табыс бойынша сұрыпталады: толық төлемдер және бронь алдын ала төлемдері.',
      salesByDay: 'Күндер бойынша сатылым',
      salesByDayDesc: 'Күн бойынша табыс, тапсырыс және сатылған билеттер.',
      noSales: 'Әзірге сатылым жоқ.',
      publishedVsPending: 'Жарияланған және қаралуда',
      statusSplit: 'Құрылған іс-шараларыңыздың статус үлесі.',
      published: 'Жарияланды',
      pending: 'Қаралуда',
      specialProgramSales: 'Арнайы бағдарламалар сатылымы',
      specialProgramDesc: 'Толық іс-шара билеті және жеке белсенділіктер.',
      fullEventPass: 'Толық іс-шара билеті',
      activityTickets: 'Белсенділік билеттері',
      topEventsEmpty: 'Табыс бойынша топ алғашқы сатылымнан кейін пайда болады.',
      orders: 'тапсырыс',
      tickets: 'билет',
    },
  }[language];
  const statusTotal = (analytics?.eventStatuses?.published || 0) + (analytics?.eventStatuses?.pending || 0);
  const fullPassTotal =
    (analytics?.specialPrograms?.fullEventPassTickets || 0) + (analytics?.specialPrograms?.activityTickets || 0);
  const maxDayRevenue = Math.max(...(analytics?.salesByDay || []).map((day) => day.revenue), 1);
  const maxTopEventRevenue = Math.max(...(analytics?.topEvents || []).map((event) => event.revenue), 1);
  const averageOrderValue =
    analytics?.averageOrderValue ?? ((analytics?.ordersCount || 0) ? (analytics?.totalRevenue || 0) / (analytics?.ordersCount || 1) : 0);

  const metrics = [
    { label: copy.totalRevenue, value: formatCurrency(analytics?.totalRevenue || 0), tone: 'green' },
    { label: copy.ticketsSold, value: String(analytics?.ticketsSold || 0), tone: 'violet' },
    { label: copy.reservedTickets, value: String(analytics?.reservedTickets || 0), tone: 'amber' },
    { label: copy.outstandingBalance, value: formatCurrency(analytics?.outstandingBalance || 0), tone: 'cyan' },
    { label: copy.ordersCount, value: String(analytics?.ordersCount || 0), tone: 'blue' },
    { label: copy.averageOrderValue, value: formatCurrency(averageOrderValue), tone: 'green' },
    {
      label: copy.refundsCount,
      value: String(analytics?.refundsCount || 0),
      helper: `${copy.refundedAmount}: ${formatCurrency(analytics?.refundedAmount || 0)}`,
      tone: 'amber',
    },
  ];

  return (
    <div className="organizer-data-page organizer-analytics-page">
      <section className="organizer-hero organizer-data-hero">
        <div>
          <div className="organizer-eyebrow">
            <BarChart3 aria-hidden="true" />
            <span>{copy.title}</span>
          </div>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <div className="organizer-hero-stats" aria-label={copy.totalRevenue}>
          <span>{formatCurrency(analytics?.totalRevenue || 0)}</span>
          <small>{copy.totalRevenue}</small>
        </div>
      </section>

      <section className="organizer-data-metrics organizer-analytics-metrics" aria-label={copy.title}>
        {metrics.map((metric) => {
          return (
            <article key={metric.label} className={`organizer-data-metric tone-${metric.tone}`}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                {'helper' in metric && metric.helper ? <p>{metric.helper}</p> : null}
              </div>
            </article>
          );
        })}
      </section>

      <section className="organizer-analytics-grid">
        <article className="organizer-panel organizer-data-panel organizer-sales-panel">
          <div className="organizer-panel-header">
            <div>
              <span className="organizer-section-label">{copy.salesByDay}</span>
              <h2>{copy.salesByDay}</h2>
              <p>{copy.salesByDayDesc}</p>
            </div>
          </div>

          {analytics?.salesByDay?.length ? (
            <div className="organizer-analytics-list">
              {analytics.salesByDay.map((day) => (
                <div key={day.date} className="organizer-analytics-row">
                  <div>
                    <strong>{day.date}</strong>
                    <span>{day.orders} {copy.orders} · {day.ticketsSold} {copy.tickets}</span>
                  </div>
                  <div className="organizer-row-value">
                    <strong>{formatCurrency(day.revenue)}</strong>
                    {day.reservations ? <span>{day.reservations} {copy.reservationsCount}</span> : null}
                  </div>
                  <div className="organizer-progress-track" aria-hidden="true">
                    <span style={{ width: `${(day.revenue / maxDayRevenue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="organizer-empty-state organizer-data-empty">
              <BarChart3 aria-hidden="true" />
              <h3>{copy.noSales}</h3>
            </div>
          )}
        </article>

        <aside className="organizer-analytics-side">
          <article className="organizer-panel organizer-data-panel">
            <div className="organizer-panel-header">
              <div>
                <span className="organizer-section-label">{copy.statusSplit}</span>
                <h2>{copy.publishedVsPending}</h2>
                <p>{copy.statusSplit}</p>
              </div>
            </div>

            <div className="organizer-breakdown-list">
              {[
                { label: copy.published, value: analytics?.eventStatuses?.published || 0, tone: 'success' },
                { label: copy.pending, value: analytics?.eventStatuses?.pending || 0, tone: 'warning' },
              ].map((item) => (
                <div key={item.label} className="organizer-breakdown-row">
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="organizer-progress-track" aria-hidden="true">
                    <span className={`tone-${item.tone}`} style={{ width: `${statusTotal ? (item.value / statusTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="organizer-panel organizer-data-panel">
            <div className="organizer-panel-header">
              <div>
                <span className="organizer-section-label">{copy.specialProgramSales}</span>
                <h2>{copy.specialProgramSales}</h2>
                <p>{copy.specialProgramDesc}</p>
              </div>
            </div>

            <div className="organizer-breakdown-list">
              {[
                { label: copy.fullEventPass, value: analytics?.specialPrograms?.fullEventPassTickets || 0, tone: 'success' },
                { label: copy.activityTickets, value: analytics?.specialPrograms?.activityTickets || 0, tone: 'violet' },
              ].map((item) => (
                <div key={item.label} className="organizer-breakdown-row">
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="organizer-progress-track" aria-hidden="true">
                    <span className={`tone-${item.tone}`} style={{ width: `${fullPassTotal ? (item.value / fullPassTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="organizer-panel organizer-data-panel">
        <div className="organizer-panel-header">
          <div>
            <span className="organizer-section-label">{copy.topEvents}</span>
            <h2>{copy.topEvents}</h2>
            <p>{copy.topEventsDesc}</p>
          </div>
        </div>

        {analytics?.topEvents?.length ? (
          <div className="organizer-analytics-list">
            {analytics.topEvents.map((event) => (
              <div key={event.eventId} className="organizer-analytics-row">
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.orders} {copy.orders} · {event.ticketsSold} {copy.tickets}</span>
                </div>
                <div className="organizer-row-value">
                  <strong>{formatCurrency(event.revenue)}</strong>
                  {event.reservedTickets ? <span>{event.reservedTickets} {copy.reservedTickets}</span> : null}
                </div>
                <div className="organizer-progress-track" aria-hidden="true">
                  <span style={{ width: `${(event.revenue / maxTopEventRevenue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="organizer-empty-state organizer-data-empty">
            <TrendingUp aria-hidden="true" />
            <h3>{copy.topEventsEmpty}</h3>
          </div>
        )}
      </section>
    </div>
  );
};
