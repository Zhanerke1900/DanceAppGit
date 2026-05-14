import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, CreditCard, ReceiptText, Ticket } from 'lucide-react';
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
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' KZT';

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
      emptyDesc: 'Orders and reservations will appear here when people buy or reserve tickets.',
      allEvents: 'All events',
      eventFilter: 'Event',
      shownOrders: 'Shown orders',
      soldTickets: 'Sold tickets',
      reservedTickets: 'Reserved tickets',
      order: 'Order',
      amount: 'Full Amount',
      paid: 'Paid',
      balance: 'Balance',
      deadline: 'Balance deadline',
      payment: 'Payment',
      checkIn: 'Check-in',
      status: { paid: 'paid', reserved: 'reserved', pending: 'pending', checked: 'checked', 'not-checked': 'not checked', 'checked-in': 'checked-in', 'not-checked-in': 'not checked', 'no-ticket-yet': 'no ticket yet' } as Record<string, string>,
    },
    ru: {
      title: 'Заказы',
      subtitle: 'Покупки и брони по вашим опубликованным событиям.',
      emptyTitle: 'Заказов пока нет',
      emptyDesc: 'Заказы и брони появятся здесь, когда люди купят или забронируют билеты.',
      allEvents: 'Все события',
      eventFilter: 'Событие',
      shownOrders: 'Показано заказов',
      soldTickets: 'Продано билетов',
      reservedTickets: 'Билетов в бронях',
      order: 'Заказ',
      amount: 'Полная сумма',
      paid: 'Оплачено',
      balance: 'Остаток',
      deadline: 'Оплатить до',
      payment: 'Оплата',
      checkIn: 'Вход',
      status: { paid: 'оплачено', reserved: 'бронь', pending: 'ожидает', checked: 'проверен', 'not-checked': 'не проверен', 'checked-in': 'вошёл', 'not-checked-in': 'не проверен', 'no-ticket-yet': 'билета ещё нет' } as Record<string, string>,
    },
    kk: {
      title: 'Тапсырыстар',
      subtitle: 'Жарияланған іс-шараларыңыз бойынша сатып алулар мен броньдар.',
      emptyTitle: 'Әзірге тапсырыс жоқ',
      emptyDesc: 'Адамдар билет сатып алғанда немесе брондағанда, тапсырыстар осында пайда болады.',
      allEvents: 'Барлық іс-шаралар',
      eventFilter: 'Іс-шара',
      shownOrders: 'Көрсетілген тапсырыс',
      soldTickets: 'Сатылған билеттер',
      reservedTickets: 'Броньдағы билеттер',
      order: 'Тапсырыс',
      amount: 'Толық сома',
      paid: 'Төленді',
      balance: 'Қалдық',
      deadline: 'Дейін төлеу',
      payment: 'Төлем',
      checkIn: 'Кіру',
      status: { paid: 'төленді', reserved: 'бронь', pending: 'күтуде', checked: 'тексерілді', 'not-checked': 'тексерілмеді', 'checked-in': 'кірді', 'not-checked-in': 'тексерілмеді', 'no-ticket-yet': 'билет әлі жоқ' } as Record<string, string>,
    },
  }[language];

  const [selectedEventId, setSelectedEventId] = useState('all');
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
  const visibleOrders = selectedEventId === 'all'
    ? orders
    : orders.filter((order) => String(order.eventId || order.eventTitle || order.id) === selectedEventId);
  const totalPaid = visibleOrders.reduce((sum, order) => sum + (Number(order.amountPaid ?? order.total) || 0), 0);
  const totalBalance = visibleOrders.reduce((sum, order) => sum + (Number(order.balanceDue) || 0), 0);
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
    { label: copy.shownOrders, value: visibleOrders.length, helper: selectedEventTitle, icon: ReceiptText, tone: 'violet' },
    { label: copy.soldTickets, value: ticketsSold, helper: selectedEventTitle, icon: Ticket, tone: 'blue' },
    { label: copy.reservedTickets, value: reservedTickets, helper: `${reservedCount} ${copy.status.reserved}`, icon: Clock3, tone: 'amber' },
    { label: copy.paid, value: formatCurrency(totalPaid), helper: copy.payment, icon: CreditCard, tone: 'green' },
    { label: copy.balance, value: formatCurrency(totalBalance), helper: `${reservedCount} ${copy.status.reserved}`, icon: Clock3, tone: 'amber' },
    { label: copy.checkIn, value: visibleOrders.length ? `${checkedInCount}/${visibleOrders.length}` : '0', helper: copy.checkIn, icon: CheckCircle2, tone: 'cyan' },
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
          const Icon = metric.icon;
          return (
            <article key={metric.label} className={`organizer-data-metric tone-${metric.tone}`}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
              <Icon aria-hidden="true" />
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
                    <span>{formatDate(order.purchaseDate)}</span>
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
