import React from 'react';
import { BarChart3, Calendar, DollarSign, PieChart, ShoppingBag, Ticket } from 'lucide-react';

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
  const statusTotal = (analytics?.eventStatuses.published || 0) + (analytics?.eventStatuses.pending || 0);
  const fullPassTotal =
    (analytics?.specialPrograms.fullEventPassTickets || 0) + (analytics?.specialPrograms.activityTickets || 0);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Live performance snapshot for your organizer account.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(analytics?.totalRevenue || 0), icon: DollarSign },
            { label: 'Tickets Sold', value: String(analytics?.ticketsSold || 0), icon: Ticket },
            { label: 'Orders Count', value: String(analytics?.ordersCount || 0), icon: ShoppingBag },
            { label: 'Top Events', value: String(analytics?.topEvents.length || 0), icon: BarChart3 },
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
                <h2 className="text-xl font-bold text-white">Sales by Day</h2>
                <p className="text-sm text-gray-400">Revenue, orders, and tickets sold per date.</p>
              </div>
            </div>

            {analytics?.salesByDay.length ? (
              <div className="space-y-3">
                {analytics.salesByDay.map((day) => (
                  <div key={day.date} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 rounded-xl bg-gray-800/40 p-4 text-sm">
                    <span className="font-medium text-white">{day.date}</span>
                    <span className="text-gray-300">{formatCurrency(day.revenue)}</span>
                    <span className="text-gray-400">{day.orders} orders</span>
                    <span className="text-gray-400">{day.ticketsSold} tickets</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No sales yet.</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-600/15 p-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Published vs Pending</h2>
                  <p className="text-sm text-gray-400">Status split for your created events.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Published', value: analytics?.eventStatuses.published || 0, color: 'bg-emerald-500' },
                  { label: 'Pending', value: analytics?.eventStatuses.pending || 0, color: 'bg-amber-500' },
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
                  <h2 className="text-xl font-bold text-white">Special Program Sales</h2>
                  <p className="text-sm text-gray-400">Full event pass vs separate activities.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'Full Event Pass',
                    value: analytics?.specialPrograms.fullEventPassTickets || 0,
                    color: 'bg-fuchsia-500',
                  },
                  {
                    label: 'Activity Tickets',
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
          <h2 className="mb-5 text-xl font-bold text-white">Top Events</h2>
          {analytics?.topEvents.length ? (
            <div className="space-y-3">
              {analytics.topEvents.map((event) => (
                <div key={event.eventId} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 rounded-xl bg-gray-800/40 p-4 text-sm">
                  <span className="font-medium text-white">{event.title}</span>
                  <span className="text-gray-300">{formatCurrency(event.revenue)}</span>
                  <span className="text-gray-400">{event.orders} orders</span>
                  <span className="text-gray-400">{event.ticketsSold} tickets</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Top events will appear after your first sales.</p>
          )}
        </div>
      </div>
    </div>
  );
};
