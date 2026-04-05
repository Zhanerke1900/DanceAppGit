import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket, ChevronRight, QrCode, Barcode, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { TicketRecord } from '../api/tickets';

interface MyTicketsProps {
  onBack?: () => void;
  tickets?: TicketRecord[];
  onOpenTicket?: (ticket: TicketRecord) => void;
  onRefundTicket?: (ticket: TicketRecord) => Promise<{ emailSent?: boolean } | void>;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number, currency = 'KZT') =>
  new Intl.NumberFormat('ru-KZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` ${currency}`;

const getRefundDeadlineMs = (ticket: TicketRecord) => {
  const rawDate = String(ticket.event.date || "").trim();
  const rawTime = String(ticket.event.time || "").trim();
  const direct = new Date(rawTime ? `${rawDate} ${rawTime}` : rawDate);
  if (!Number.isNaN(direct.getTime())) return direct.getTime() - Date.now();

  const monthRangeMatch = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*\d{1,2},\s*(\d{4})$/);
  if (monthRangeMatch) {
    const normalized = `${monthRangeMatch[1]} ${monthRangeMatch[2]}, ${monthRangeMatch[3]}${rawTime ? ` ${rawTime}` : ""}`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime() - Date.now();
  }

  const splitRange = rawDate.split("-").map((part) => part.trim()).filter(Boolean);
  if (splitRange.length > 1) {
    const parsed = new Date(rawTime ? `${splitRange[0]} ${rawTime}` : splitRange[0]);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime() - Date.now();
  }

  return -1;
};

export const MyTickets = ({ onBack, tickets = [], onOpenTicket, onRefundTicket }: MyTicketsProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [refundingTicketId, setRefundingTicketId] = useState<string | null>(null);
  const [refundCandidate, setRefundCandidate] = useState<TicketRecord | null>(null);
  const [refundSuccessMessage, setRefundSuccessMessage] = useState<string | null>(null);
  const [refundErrorMessage, setRefundErrorMessage] = useState<string | null>(null);

  const filteredTickets = useMemo(
    () => tickets.filter((ticket) => (activeTab === 'upcoming' ? !ticket.isPast : ticket.isPast)),
    [activeTab, tickets]
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">My Tickets</h1>
        <p className="text-gray-400">Your real purchased tickets with unique QR and barcode.</p>
      </div>

      <div className="mb-8 flex gap-2 border-b border-purple-500/20">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`relative px-6 py-3 font-semibold transition-all ${
            activeTab === 'upcoming' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Upcoming
          {activeTab === 'upcoming' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`relative px-6 py-3 font-semibold transition-all ${
            activeTab === 'past' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Past Events
          {activeTab === 'past' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </div>

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-900/50 transition-all hover:border-purple-500/30"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full flex-shrink-0 overflow-hidden md:h-auto md:w-64">
                  <ImageWithFallback
                    src={ticket.event.image}
                    alt={ticket.event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/50" />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-400">
                          {ticket.event.category}
                        </span>
                        <h3 className="text-2xl font-bold text-white">{ticket.event.title}</h3>
                        <p className="mt-2 text-sm text-gray-500">{ticket.ticketType}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          ticket.status === 'used'
                            ? 'bg-gray-700 text-gray-200'
                            : ticket.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{ticket.event.date}{ticket.event.time ? ` - ${ticket.event.time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{ticket.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                        <Ticket className="h-4 w-4" />
                        {ticket.ticketCode}
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      Purchased: <span className="text-white">{formatDate(ticket.purchasedAt)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      Price: <span className="text-white">{formatCurrency(ticket.price, ticket.currency)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700"
                    >
                      <QrCode className="h-4 w-4" />
                      Show Ticket
                    </button>
                    <button
                      onClick={() => onOpenTicket?.(ticket)}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-5 py-2 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10"
                    >
                      View Event
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {activeTab === 'upcoming' && ticket.status === 'active' && !ticket.isPast && (() => {
                      const refundDeadlineMs = getRefundDeadlineMs(ticket);
                      const canRefund = refundDeadlineMs >= 24 * 60 * 60 * 1000;
                      return (
                        <button
                          onClick={() => {
                            if (!canRefund || !onRefundTicket) return;
                            setRefundCandidate(ticket);
                          }}
                          disabled={!canRefund || !onRefundTicket || refundingTicketId === ticket.id}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
                        >
                          {refundingTicketId === ticket.id ? 'Processing refund...' : canRefund ? 'Refund Ticket' : 'Refund unavailable'}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                <div className="hidden items-center justify-center border-l border-white/10 p-6 lg:flex">
                  <div className="rounded-xl bg-white p-3">
                    <img src={ticket.qrCodeDataUrl} alt={`QR ${ticket.ticketCode}`} className="h-24 w-24" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600/10">
            <Ticket className="h-10 w-10 text-purple-500" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-white">No {activeTab} tickets</h3>
          <p className="mb-8 max-w-sm text-gray-400">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming tickets yet."
              : "You haven't attended any ticketed events yet."}
          </p>
          <button
            onClick={onBack}
            className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all shadow-lg shadow-purple-600/20 hover:bg-purple-700"
          >
            Explore Events
          </button>
        </motion.div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-purple-900/30">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-purple-300">Ticket</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{selectedTicket.ticketCode}</h2>
                <p className="mt-1 text-gray-400">{selectedTicket.event.title}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <QrCode className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">QR Code</span>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <img src={selectedTicket.qrCodeDataUrl} alt={`QR ${selectedTicket.ticketCode}`} className="mx-auto h-52 w-52" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <Barcode className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">Barcode</span>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <img src={selectedTicket.barcodeDataUrl} alt={`Barcode ${selectedTicket.ticketCode}`} className="w-full" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-5 text-sm text-gray-300">
                  <p><span className="text-gray-500">Ticket Type:</span> {selectedTicket.ticketType}</p>
                  <p className="mt-2"><span className="text-gray-500">Price:</span> {formatCurrency(selectedTicket.price, selectedTicket.currency)}</p>
                  <p className="mt-2"><span className="text-gray-500">Status:</span> {selectedTicket.status}</p>
                  <p className="mt-2"><span className="text-gray-500">Purchased:</span> {formatDate(selectedTicket.purchasedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {refundCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">Confirm Refund</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Are you sure?</h2>
              </div>
              <button
                onClick={() => setRefundCandidate(null)}
                className="rounded-xl bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-gray-300">
              You are about to refund <span className="font-semibold text-white">{refundCandidate.ticketCode}</span> for{" "}
              <span className="font-semibold text-white">{refundCandidate.event.title}</span>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              The ticket will be removed from your upcoming tickets, and the money should arrive within
              <span className="font-semibold text-white"> 3 business days</span>.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setRefundCandidate(null)}
                className="rounded-xl bg-white/5 px-4 py-2 font-semibold text-gray-300 transition-colors hover:bg-white/10"
              >
                Keep Ticket
              </button>
              <button
                onClick={async () => {
                  if (!onRefundTicket || !refundCandidate) return;
                  setRefundingTicketId(refundCandidate.id);
                  try {
                    const result = await onRefundTicket(refundCandidate);
                    setRefundCandidate(null);
                    setRefundSuccessMessage(
                      result?.emailSent === false
                        ? "Refund requested successfully. The ticket was removed, but the email could not be sent. Please restart the backend and check SMTP."
                        : "Refund requested successfully. The money should arrive within 3 business days."
                    );
                  } catch (error: any) {
                    setRefundErrorMessage(error?.message || "Refund failed. Please try again.");
                  } finally {
                    setRefundingTicketId(null);
                  }
                }}
                disabled={refundingTicketId === refundCandidate.id}
                className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-500/60"
              >
                {refundingTicketId === refundCandidate.id ? "Processing..." : "Yes, refund ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {refundSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-emerald-900/20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Refund Requested</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Everything is set</h2>
            <p className="mt-4 leading-relaxed text-gray-300">{refundSuccessMessage}</p>
            <button
              onClick={() => setRefundSuccessMessage(null)}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {refundErrorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl shadow-red-900/20">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">Refund Error</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Something went wrong</h2>
            <p className="mt-4 leading-relaxed text-gray-300">{refundErrorMessage}</p>
            <button
              onClick={() => setRefundErrorMessage(null)}
              className="mt-6 w-full rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
