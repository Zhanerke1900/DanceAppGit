import { request } from "./http";

export type TicketRecord = {
  id: string;
  ticketId: string;
  ticketCode: string;
  status: "active" | "used" | "cancelled";
  purchasedAt: string;
  usedAt?: string | null;
  ticketType: string;
  price: number;
  currency: string;
  paymentType?: "full" | "deposit";
  depositRate?: number;
  amountPaid?: number;
  balanceDue?: number;
  orderTotal?: number;
  refundPolicyHours?: number;
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
  event: {
    title: string;
    category: string;
    eventType: string;
    date: string;
    time: string;
    location: string;
    city: string;
    image: string;
  };
  isPast: boolean;
};

export type ReservationRecord = {
  id: string;
  orderId: string;
  status: "reserved" | "failed" | "refunded" | "paid";
  createdAt: string;
  reservedAt?: string;
  quantity: number;
  items: Array<{
    name: string;
    activityId?: string;
    quantity: number;
    price: number;
    kind?: string;
  }>;
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentType: "deposit";
  depositRate: number;
  amountPaid: number;
  balanceDue: number;
  balanceDueDeadlineAt?: string | null;
  balanceDueDeadlineHours: number;
  refundPolicyHours: number;
  canPayBalance: boolean;
  isPast: boolean;
  event: TicketRecord["event"];
};

export async function purchaseTickets(payload: { eventId?: string; eventData: any; ticketDetails: any }) {
  const { res, data } = await request<any>("/api/tickets/purchase", {
    method: "POST",
    json: payload,
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to purchase tickets");
  return data as {
    message: string;
    orderId: string;
    tickets?: TicketRecord[];
    reservation?: ReservationRecord;
    paymentUrl?: string;
    paymentId?: string;
  };
}

export async function myTickets() {
  const { res, data } = await request<any>("/api/tickets/my", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load tickets");
  return data as { tickets: TicketRecord[]; reservations?: ReservationRecord[] };
}

export async function payReservationBalance(orderId: string) {
  const { res, data } = await request<any>(`/api/tickets/reservations/${encodeURIComponent(orderId)}/pay-balance`, {
    method: "POST",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to pay reservation balance");
  return data as {
    message: string;
    orderId: string;
    tickets?: TicketRecord[];
    paymentUrl?: string;
    paymentId?: string;
  };
}

export async function cancelReservation(orderId: string) {
  const { res, data } = await request<any>(`/api/tickets/reservations/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to cancel reservation");
  return data as { orderId: string; message: string; refundEligible?: boolean };
}

export async function validateTicket(qrToken: string) {
  const { res, data } = await request<any>("/api/tickets/validate", {
    method: "POST",
    json: { qrToken },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to validate ticket");
  return data;
}

export async function refundTicket(ticketId: string) {
  const { res, data } = await request<any>(`/api/tickets/${encodeURIComponent(ticketId)}/refund`, {
    method: "POST",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to refund ticket");
  return data as { ticketId: string; ticketCode: string; message: string; refundedAmount?: number; emailSent?: boolean };
}
