import React from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, Ticket, MapPin, Download, Barcode } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { TicketRecord } from '../api/tickets';
import { useI18n } from '../i18n';

interface PurchaseSuccessProps {
  event: any;
  ticketDetails: {
    quantity: number;
    total: number;
    ticketTypes: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  tickets: TicketRecord[];
  onViewMyTickets: () => void;
  onBackToHome: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' KZT';

export const PurchaseSuccess = ({
  event,
  ticketDetails,
  tickets,
  onViewMyTickets,
  onBackToHome,
}: PurchaseSuccessProps) => {
  const { language } = useI18n();
  const copy = {
    title: language === 'ru' ? 'Покупка завершена!' : language === 'kk' ? 'Сатып алу аяқталды!' : 'Purchase Complete!',
    created: language === 'ru' ? 'настоящих билетов создано и отправлено вам на почту' : language === 'kk' ? 'нақты билет жасалып, email-іңізге жіберілді' : 'real tickets have been created and emailed to you',
    ticketSingle: language === 'ru' ? 'билет' : language === 'kk' ? 'билет' : 'Ticket',
    ticketsPlural: language === 'ru' ? 'билетов' : language === 'kk' ? 'билет' : 'Tickets',
    dateTime: language === 'ru' ? 'Дата и время' : language === 'kk' ? 'Күні мен уақыты' : 'Date & Time',
    timeTba: language === 'ru' ? 'Время уточняется' : language === 'kk' ? 'Уақыты кейін хабарланады' : 'Time TBA',
    location: language === 'ru' ? 'Локация' : language === 'kk' ? 'Орны' : 'Location',
    openMaps: language === 'ru' ? 'Открыть в картах' : language === 'kk' ? 'Картадан ашу' : 'Open in Maps',
    qr: language === 'ru' ? 'Основной QR билета' : language === 'kk' ? 'Негізгі билет QR-ы' : 'Primary ticket QR',
    barcode: language === 'ru' ? 'Штрихкод первого билета' : language === 'kk' ? 'Бірінші билеттің штрихкоды' : 'First ticket barcode',
    barcodeNote: language === 'ru' ? 'У каждого купленного билета есть свой уникальный код, QR, штрихкод и запись в базе.' : language === 'kk' ? 'Әр билетте бірегей код, QR, штрихкод және дерекқор жазбасы бар.' : 'Every purchased ticket has its own unique code, QR, barcode, and database record.',
    ticketDetails: language === 'ru' ? 'Детали билетов' : language === 'kk' ? 'Билет мәліметтері' : 'Ticket Details',
    totalPaid: language === 'ru' ? 'Оплачено всего' : language === 'kk' ? 'Жалпы төленді' : 'Total Paid',
    download: language === 'ru' ? 'Скачать' : language === 'kk' ? 'Жүктеу' : 'Download',
    viewTickets: language === 'ru' ? 'Мои билеты' : language === 'kk' ? 'Менің билеттерім' : 'View My Tickets',
    back: language === 'ru' ? 'Назад к событиям' : language === 'kk' ? 'Іс-шараларға оралу' : 'Back to Events',
  };
  const firstTicket = tickets[0];
  const mapQuery = encodeURIComponent(event.location || '');
  const mapUrl = event.location ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}` : '';
  const mapEmbedUrl = event.location ? `https://www.google.com/maps?q=${mapQuery}&output=embed` : '';

  const handleDownloadTicket = (ticket: TicketRecord) => {
    const html = `
      <html>
        <body style="font-family:Arial,sans-serif;padding:24px;background:#111827;color:white">
          <h1>${ticket.event.title}</h1>
          <p>${ticket.ticketCode}</p>
          <p>${ticket.ticketType}</p>
          <img src="${ticket.qrCodeDataUrl}" alt="QR" style="width:220px;height:220px;display:block;margin:20px 0;" />
          <img src="${ticket.barcodeDataUrl}" alt="Barcode" style="width:320px;display:block;" />
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ticket.ticketCode}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ede4f8] via-[#e7dcf5] to-[#e2d6f1] pb-16 pt-24 dark:from-purple-950 dark:via-black dark:to-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-purple-600 opacity-20 blur-xl"
            />
          </div>
          <h1 className="mb-3 text-center text-4xl font-bold text-foreground dark:text-white md:text-5xl">{copy.title}</h1>
          <p className="text-center text-lg text-muted-foreground dark:text-gray-400">
            {tickets.length} {tickets.length > 1 ? copy.ticketsPlural : copy.ticketSingle} {copy.created}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(229,215,246,0.98)_0%,rgba(214,198,238,0.99)_100%)] shadow-[0_24px_48px_rgba(61,41,110,0.16)] dark:border-purple-500/20 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 dark:shadow-2xl dark:shadow-purple-900/20"
        >
          <div className="relative h-52 overflow-hidden">
            <ImageWithFallback src={event.image} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d2343]/80 via-[#2d2343]/25 to-transparent dark:from-gray-900 dark:via-gray-900/50" />
            <div className="absolute right-4 top-4 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white">
              {tickets.length}x {tickets.length > 1 ? copy.ticketsPlural : copy.ticketSingle}
            </div>
          </div>

          <div className="p-8">
            <h2 className="mb-2 text-3xl font-bold text-foreground dark:text-white">{event.title}</h2>
            <p className="mb-6 font-semibold text-purple-700 dark:text-purple-400">{event.category}</p>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-purple-700 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{copy.dateTime}</p>
                  <p className="font-semibold text-foreground dark:text-white">{event.date}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{event.time || copy.timeTba}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-purple-700 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{copy.location}</p>
                  <p className="font-semibold text-foreground dark:text-white">{event.location}</p>
                  {event.location && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      {copy.openMaps}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {event.location && (
              <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-white/40 dark:border-white/10 dark:bg-slate-950/50">
                <iframe
                  src={mapEmbedUrl}
                  title="Event location map"
                  className="h-56 w-full border-0"
                  loading="lazy"
                />
              </div>
            )}

            {firstTicket && (
              <div className="mb-8 grid gap-6 rounded-3xl border border-border/80 bg-white/28 py-8 md:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-transparent">
                <div className="flex flex-col items-center border-b border-border/80 px-8 md:border-b-0 md:border-r dark:border-white/10">
                  <p className="mb-4 text-sm text-muted-foreground dark:text-gray-400">{copy.qr}</p>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={firstTicket.qrCodeDataUrl} alt="Real QR Code" className="h-48 w-48" />
                  </div>
                  <p className="mt-4 font-mono text-xs text-muted-foreground dark:text-gray-500">{firstTicket.ticketCode}</p>
                </div>
                <div className="px-8">
                  <div className="mb-4 flex items-center gap-2 text-foreground dark:text-white">
                    <Barcode className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold">{copy.barcode}</h3>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={firstTicket.barcodeDataUrl} alt="Real barcode" className="w-full" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground dark:text-gray-400">
                    {copy.barcodeNote}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6 space-y-3">
              <h3 className="mb-3 font-semibold text-foreground dark:text-white">{copy.ticketDetails}</h3>
              {ticketDetails.ticketTypes.map((ticket, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-gray-400">
                    {ticket.name} x{ticket.quantity}
                  </span>
                  <span className="font-semibold text-foreground dark:text-white">{formatCurrency(ticket.price * ticket.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border/80 pt-3 dark:border-white/10">
                <span className="font-bold text-foreground dark:text-white">{copy.totalPaid}</span>
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
                  {formatCurrency(ticketDetails.total)}
                </span>
              </div>
            </div>

            <div className="mb-8 grid gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-white/30 p-4 md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-foreground dark:text-white">{ticket.ticketCode}</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{ticket.ticketType}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white transition-all hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4" />
                    {copy.download}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={onViewMyTickets}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 font-semibold text-white transition-all shadow-lg shadow-purple-600/20 hover:from-purple-700 hover:to-fuchsia-700"
              >
                <Ticket className="h-5 w-5" />
                {copy.viewTickets}
              </button>
              <button
                onClick={onBackToHome}
                className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-white/30 px-6 py-3 font-semibold text-foreground transition-all hover:bg-white/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {copy.back}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
