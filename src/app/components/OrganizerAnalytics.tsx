import React from 'react';
import { useI18n } from '../i18n';

interface AnalyticsData {
  totalRevenue: number;
  ticketsSold: number;
  reservedTickets?: number;
  reservationsCount?: number;
  outstandingBalance?: number;
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
  }).format(value) + ' ₸';

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
      ordersCount: 'Orders Count',
      topEvents: 'Top Events',
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
      topEventsEmpty: 'Top events will appear after your first sales.',
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
      ordersCount: 'Количество заказов',
      topEvents: 'Лучшие события',
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
      topEventsEmpty: 'Лучшие события появятся после первых продаж.',
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
      ordersCount: 'Тапсырыс саны',
      topEvents: 'Үздік іс-шаралар',
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
      topEventsEmpty: 'Үздік іс-шаралар алғашқы сатылымнан кейін пайда болады.',
      orders: 'тапсырыс',
      tickets: 'билет',
    },
  }[language];
  const statusTotal = (analytics?.eventStatuses.published || 0) + (analytics?.eventStatuses.pending || 0);
  const fullPassTotal =
    (analytics?.specialPrograms.fullEventPassTickets || 0) + (analytics?.specialPrograms.activityTickets || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Calibri", sans-serif' }}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{copy.title}</h1>
          <p className="text-gray-600">{copy.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: copy.totalRevenue, value: formatCurrency(analytics?.totalRevenue || 0) },
            { label: copy.ticketsSold, value: String(analytics?.ticketsSold || 0) },
            { label: copy.reservedTickets, value: String(analytics?.reservedTickets || 0) },
            { label: copy.outstandingBalance, value: formatCurrency(analytics?.outstandingBalance || 0) },
            { label: copy.ordersCount, value: String(analytics?.ordersCount || 0) },
            { label: copy.reservationsCount, value: String(analytics?.reservationsCount || 0) },
            { label: copy.topEvents, value: String(analytics?.topEvents.length || 0) },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <p className="mb-2 text-sm text-gray-600">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">{copy.salesByDay}</h2>
              <p className="text-sm text-gray-600">{copy.salesByDayDesc}</p>
            </div>

            {analytics?.salesByDay.length ? (
              <div className="space-y-3">
                {analytics.salesByDay.map((day) => (
                  <div key={day.date} className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4">
                    <span className="font-medium text-gray-900">{day.date}</span>
                    <span className="text-gray-700">{formatCurrency(day.revenue)}</span>
                    <span className="text-gray-600">{day.orders} {copy.orders}</span>
                    <span className="text-gray-600">{day.ticketsSold} {copy.tickets}</span>
                    {day.reservations ? <span className="text-amber-600">{day.reservations} {copy.reservationsCount}</span> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{copy.noSales}</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">{copy.publishedVsPending}</h2>
                <p className="text-sm text-gray-600">{copy.statusSplit}</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: copy.published, value: analytics?.eventStatuses.published || 0, color: 'role-bar-primary' },
                  { label: copy.pending, value: analytics?.eventStatuses.pending || 0, color: 'role-bar-secondary' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${statusTotal ? (item.value / statusTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">{copy.specialProgramSales}</h2>
                <p className="text-sm text-gray-600">{copy.specialProgramDesc}</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: copy.fullEventPass,
                    value: analytics?.specialPrograms.fullEventPassTickets || 0,
                    color: 'role-bar-primary',
                  },
                  {
                    label: copy.activityTickets,
                    value: analytics?.specialPrograms.activityTickets || 0,
                    color: 'role-bar-secondary',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${fullPassTotal ? (item.value / fullPassTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">{copy.topEvents}</h2>
          {analytics?.topEvents.length ? (
            <div className="space-y-3">
              {analytics.topEvents.map((event) => (
                <div key={event.eventId} className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4">
                  <span className="font-medium text-gray-900">{event.title}</span>
                  <span className="text-gray-700">{formatCurrency(event.revenue)}</span>
                  <span className="text-gray-600">{event.orders} {copy.orders}</span>
                  <span className="text-gray-600">{event.ticketsSold} {copy.tickets}</span>
                  {event.reservedTickets ? <span className="text-amber-600">{event.reservedTickets} {copy.reservedTickets}</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">{copy.topEventsEmpty}</p>
          )}
        </div>
      </div>
    </div>
  );
};
