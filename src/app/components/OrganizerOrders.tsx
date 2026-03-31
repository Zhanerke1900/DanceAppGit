import React from 'react';
import { Calendar, CheckCircle2, Mail, ShoppingCart, Ticket, User } from 'lucide-react';

interface OrganizerOrder {
  id: string;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  total: number;
  purchaseDate: string;
  paymentStatus: string;
  checkInStatus: string;
}

interface OrganizerOrdersProps {
  orders: OrganizerOrder[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' ₸';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const OrganizerOrders: React.FC<OrganizerOrdersProps> = ({ orders }) => {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Real purchases for your published events.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/15">
              <ShoppingCart className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">No orders yet</h2>
            <p className="text-gray-400">Orders will appear here when people buy tickets for your published events.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300">Order</p>
                      <h2 className="text-xl font-bold text-white">{order.eventTitle}</h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <User className="h-4 w-4 text-purple-400" />
                        <span>{order.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4 text-purple-400" />
                        <span className="break-all">{order.buyerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Ticket className="h-4 w-4 text-purple-400" />
                        <span>{order.quantity}x {order.ticketType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span>{formatDate(order.purchaseDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-[260px] grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-xl bg-gray-800/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-800/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Payment</p>
                      <p className="font-semibold capitalize text-emerald-300">{order.paymentStatus}</p>
                    </div>
                    <div className="rounded-xl bg-gray-800/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Check-in</p>
                      <p className="flex items-center gap-2 font-semibold text-white">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        {order.checkInStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
