import React from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, Ticket, MapPin, Download, Barcode } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { TicketRecord } from '../api/tickets';

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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black pb-16 pt-24">
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
          <h1 className="mb-3 text-center text-4xl font-bold text-white md:text-5xl">Purchase Complete!</h1>
          <p className="text-center text-lg text-gray-400">
            {tickets.length} real ticket{tickets.length > 1 ? 's have' : ' has'} been created and emailed to you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950 shadow-2xl shadow-purple-900/20"
        >
          <div className="relative h-52 overflow-hidden">
            <ImageWithFallback src={event.image} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            <div className="absolute right-4 top-4 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white">
              {tickets.length}x Ticket{tickets.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-8">
            <h2 className="mb-2 text-3xl font-bold text-white">{event.title}</h2>
            <p className="mb-6 font-semibold text-purple-400">{event.category}</p>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Date & Time</p>
                  <p className="font-semibold text-white">{event.date}</p>
                  <p className="text-sm text-gray-400">{event.time || 'Time TBA'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-semibold text-white">{event.location}</p>
                  {event.location && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            {event.location && (
              <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50">
                <iframe
                  src={mapEmbedUrl}
                  title="Event location map"
                  className="h-56 w-full border-0"
                  loading="lazy"
                />
              </div>
            )}

            {firstTicket && (
              <div className="mb-8 grid gap-6 rounded-3xl border border-white/10 py-8 md:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col items-center border-b border-white/10 px-8 md:border-b-0 md:border-r">
                  <p className="mb-4 text-sm text-gray-400">Primary ticket QR</p>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={firstTicket.qrCodeDataUrl} alt="Real QR Code" className="h-48 w-48" />
                  </div>
                  <p className="mt-4 font-mono text-xs text-gray-500">{firstTicket.ticketCode}</p>
                </div>
                <div className="px-8">
                  <div className="mb-4 flex items-center gap-2 text-white">
                    <Barcode className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold">First ticket barcode</h3>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={firstTicket.barcodeDataUrl} alt="Real barcode" className="w-full" />
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Every purchased ticket has its own unique code, QR, barcode, and database record.
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6 space-y-3">
              <h3 className="mb-3 font-semibold text-white">Ticket Details</h3>
              {ticketDetails.ticketTypes.map((ticket, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {ticket.name} x{ticket.quantity}
                  </span>
                  <span className="font-semibold text-white">{formatCurrency(ticket.price * ticket.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="font-bold text-white">Total Paid</span>
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
                  {formatCurrency(ticketDetails.total)}
                </span>
              </div>
            </div>

            <div className="mb-8 grid gap-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{ticket.ticketCode}</p>
                    <p className="text-sm text-gray-400">{ticket.ticketType}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white transition-all hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4" />
                    Download
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
                View My Tickets
              </button>
              <button
                onClick={onBackToHome}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                Back to Events
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
