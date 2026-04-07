import React from 'react';
import { BarChart3, Calendar, DollarSign, PieChart, ShoppingBag, Ticket } from 'lucide-react';
import { useI18n } from '../i18n';

interface AnalyticsData {
  totalRevenue: number;
  ticketsSold: number;
  ordersCount: number;
  topEvents: Array<{
    eventId: string;
    title: string;
    orders: number;
    ticketsSold: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
    ticketsSold: number;
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
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{copy.title}</h1>
          <p className="text-gray-400">{copy.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: copy.totalRevenue, value: formatCurrency(analytics?.totalRevenue || 0), icon: DollarSign },
            { label: copy.ticketsSold, value: String(analytics?.ticketsSold || 0), icon: Ticket },
            { label: copy.ordersCount, value: String(analytics?.ordersCount || 0), icon: ShoppingBag },
            { label: copy.topEvents, value: String(analytics?.topEvents.length || 0), icon: BarChart3 },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6"
              >
                <div className="mb-4 inline-flex rounded-xl bg-purple-600/15 p-3">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <p className="mb-2 text-sm text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/15 p-2">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{copy.salesByDay}</h2>
                <p className="text-sm text-gray-400">{copy.salesByDayDesc}</p>
              </div>
            </div>

            {analytics?.salesByDay.length ? (
              <div className="space-y-3">
                {analytics.salesByDay.map((day) => (
                  <div key={day.date} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 rounded-xl bg-gray-800/40 p-4 text-sm">
                    <span className="font-medium text-white">{day.date}</span>
                    <span className="text-gray-300">{formatCurrency(day.revenue)}</span>
                    <span className="text-gray-400">{day.orders} {copy.orders}</span>
                    <span className="text-gray-400">{day.ticketsSold} {copy.tickets}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{copy.noSales}</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-600/15 p-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{copy.publishedVsPending}</h2>
                  <p className="text-sm text-gray-400">{copy.statusSplit}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: copy.published, value: analytics?.eventStatuses.published || 0, color: 'bg-emerald-500' },
                  { label: copy.pending, value: analytics?.eventStatuses.pending || 0, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${statusTotal ? (item.value / statusTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-600/15 p-2">
                  <Ticket className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{copy.specialProgramSales}</h2>
                  <p className="text-sm text-gray-400">{copy.specialProgramDesc}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: copy.fullEventPass,
                    value: analytics?.specialPrograms.fullEventPassTickets || 0,
                    color: 'bg-fuchsia-500',
                  },
                  {
                    label: copy.activityTickets,
                    value: analytics?.specialPrograms.activityTickets || 0,
                    color: 'bg-sky-500',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800">
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

        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
          <h2 className="mb-5 text-xl font-bold text-white">{copy.topEvents}</h2>
          {analytics?.topEvents.length ? (
            <div className="space-y-3">
              {analytics.topEvents.map((event) => (
                <div key={event.eventId} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 rounded-xl bg-gray-800/40 p-4 text-sm">
                  <span className="font-medium text-white">{event.title}</span>
                  <span className="text-gray-300">{formatCurrency(event.revenue)}</span>
                  <span className="text-gray-400">{event.orders} {copy.orders}</span>
                  <span className="text-gray-400">{event.ticketsSold} {copy.tickets}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">{copy.topEventsEmpty}</p>
          )}
        </div>
      </div>
    </div>
  );
};
