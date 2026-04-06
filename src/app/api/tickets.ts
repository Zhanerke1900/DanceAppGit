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
    paymentUrl?: string;
    paymentId?: string;
  };
}

export async function myTickets() {
  const { res, data } = await request<any>("/api/tickets/my", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load tickets");
  return data as { tickets: TicketRecord[] };
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
  return data as { ticketId: string; ticketCode: string; message: string; emailSent?: boolean };
}
