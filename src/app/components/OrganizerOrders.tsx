import React from 'react';
import { Calendar, CheckCircle2, Mail, ShoppingCart, Ticket, User } from 'lucide-react';
import { useI18n } from '../i18n';

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
  const { language } = useI18n();
  const copy = {
    en: {
      title: 'Orders',
      subtitle: 'Real purchases for your published events.',
      emptyTitle: 'No orders yet',
      emptyDesc: 'Orders will appear here when people buy tickets for your published events.',
      order: 'Order',
      amount: 'Amount',
      payment: 'Payment',
      checkIn: 'Check-in',
      status: { paid: 'paid', pending: 'pending', checked: 'checked', 'not-checked': 'not checked', 'checked-in': 'checked-in' } as Record<string, string>,
    },
    ru: {
      title: 'Заказы',
      subtitle: 'Реальные покупки по вашим опубликованным событиям.',
      emptyTitle: 'Заказов пока нет',
      emptyDesc: 'Заказы появятся здесь, когда люди купят билеты на ваши опубликованные события.',
      order: 'Заказ',
      amount: 'Сумма',
      payment: 'Оплата',
      checkIn: 'Вход',
      status: { paid: 'оплачено', pending: 'ожидает', checked: 'проверен', 'not-checked': 'не проверен', 'checked-in': 'вошёл' } as Record<string, string>,
    },
    kk: {
      title: 'Тапсырыстар',
      subtitle: 'Жарияланған іс-шараларыңыз бойынша нақты сатып алулар.',
      emptyTitle: 'Әзірге тапсырыс жоқ',
      emptyDesc: 'Адамдар жарияланған іс-шараларыңызға билет сатып алғанда, тапсырыстар осында пайда болады.',
      order: 'Тапсырыс',
      amount: 'Сома',
      payment: 'Төлем',
      checkIn: 'Кіру',
      status: { paid: 'төленді', pending: 'күтуде', checked: 'тексерілді', 'not-checked': 'тексерілмеді', 'checked-in': 'кірді' } as Record<string, string>,
    },
  }[language];
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{copy.title}</h1>
          <p className="text-gray-400">{copy.subtitle}</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/15">
              <ShoppingCart className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">{copy.emptyTitle}</h2>
            <p className="text-gray-400">{copy.emptyDesc}</p>
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
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-300">{copy.order}</p>
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
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">{copy.amount}</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-800/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">{copy.payment}</p>
                      <p className="font-semibold capitalize text-emerald-300">{copy.status[order.paymentStatus] || order.paymentStatus}</p>
                    </div>
                    <div className="rounded-xl bg-gray-800/40 p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">{copy.checkIn}</p>
                      <p className="flex items-center gap-2 font-semibold text-white">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        {copy.status[order.checkInStatus] || order.checkInStatus}
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
