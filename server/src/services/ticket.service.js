import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import ValidationLog from "../models/ValidationLog.js";
import { generateNextTicketCode } from "../utils/ticketCode.js";
import { createSignedTicketToken, verifySignedTicketToken } from "../utils/ticketSecurity.js";
import { generateTicketQrDataUrl } from "../utils/ticketQr.js";
import { generateTicketBarcodeDataUrl } from "../utils/ticketBarcode.js";
import { sendTicketEmail } from "../utils/sendTicketEmail.js";
import { sendRefundEmail } from "../utils/sendEmails.js";
import { isAdminEmail } from "../utils/admin.js";

function queueTicketEmailDelivery({ email, fullName, event, tickets }) {
  setTimeout(() => {
    sendTicketEmail({ email, fullName, event, tickets }).catch((error) => {
      console.error("Ticket email error:", error?.message || error);
    });
  }, 0);
}

function toEventSnapshot(eventData = {}) {
  return {
    title: String(eventData.title || "").trim(),
    category: String(eventData.category || "").trim(),
    eventType: String(eventData.eventType || "").trim(),
    date: String(eventData.date || eventData.time || "").trim(),
    time: String(eventData.time || "").trim(),
    location: String(eventData.location || "").trim(),
    city: String(eventData.city || "").trim(),
    image: String(eventData.image || "").trim(),
  };
}

function normalizeTicketItems(ticketDetails = {}) {
  const items = Array.isArray(ticketDetails.ticketTypes) ? ticketDetails.ticketTypes : [];
  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      activityId: String(item?.activityId || "").trim(),
      quantity: Number(item?.quantity || 0),
      price: Number(item?.price || 0),
    }))
    .filter((item) => item.name && item.quantity > 0);
}

function ticketKindFromName(name) {
  const lowerName = String(name || "").toLowerCase();
  if (lowerName === "full event pass") return "full-event-pass";
  if (lowerName === "event ticket") return "event-ticket";
  return "activity";
}

function parseEventStartDate(eventSnapshot = {}) {
  const rawDate = String(eventSnapshot?.date || "").trim();
  const rawTime = String(eventSnapshot?.time || "").trim();

  const direct = new Date(rawTime ? `${rawDate} ${rawTime}` : rawDate);
  if (!Number.isNaN(direct.getTime())) return direct;

  const monthRangeMatch = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*\d{1,2},\s*(\d{4})$/);
  if (monthRangeMatch) {
    const normalized = `${monthRangeMatch[1]} ${monthRangeMatch[2]}, ${monthRangeMatch[3]}${rawTime ? ` ${rawTime}` : ""}`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const splitRange = rawDate.split("-").map((part) => part.trim()).filter(Boolean);
  if (splitRange.length > 1) {
    const parsed = new Date(rawTime ? `${splitRange[0]} ${rawTime}` : splitRange[0]);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function isPastEventSnapshot(eventSnapshot = {}) {
  const eventStart = parseEventStartDate(eventSnapshot);
  if (!eventStart || Number.isNaN(eventStart.getTime())) return false;
  return eventStart.getTime() < Date.now();
}

async function getEventSoldTickets(eventId) {
  const paidOrders = await Order.find({
    event: eventId,
    paymentStatus: "paid",
  }).select("quantity");

  return paidOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
}

async function getActivityUsageMap(event) {
  const usageMap = new Map((event.activities || []).map((activity) => [String(activity.id), 0]));
  if (!event?._id || !(event.activities || []).length) return usageMap;

  const paidOrders = await Order.find({
    event: event._id,
    paymentStatus: "paid",
  }).select("items");

  for (const order of paidOrders) {
    for (const item of order.items || []) {
      if (item.kind === "full-event-pass") {
        for (const activity of event.activities || []) {
          const key = String(activity.id);
          usageMap.set(key, (usageMap.get(key) || 0) + Number(item.quantity || 0));
        }
      } else if (item.kind === "activity" && item.activityId) {
        const key = String(item.activityId);
        usageMap.set(key, (usageMap.get(key) || 0) + Number(item.quantity || 0));
      }
    }
  }

  return usageMap;
}

export function publicTicket(ticket) {
  return {
    id: ticket._id,
    ticketId: ticket._id,
    ticketCode: ticket.ticketCode,
    status: ticket.status,
    purchasedAt: ticket.purchasedAt || ticket.createdAt,
    usedAt: ticket.usedAt,
    ticketType: ticket.ticketType,
    price: ticket.price,
    currency: ticket.currency,
    qrCodeDataUrl: ticket.qrCodeDataUrl,
    barcodeDataUrl: ticket.barcodeDataUrl,
    event: ticket.eventSnapshot,
    isPast: isPastEventSnapshot(ticket.eventSnapshot),
  };
}

async function buildTicketOrderDataForUser({ user, eventId, eventData, ticketDetails }) {
  const startedAt = Date.now();
  const items = normalizeTicketItems(ticketDetails);
  if (items.length === 0) {
    throw new Error("At least one ticket item is required");
  }

  let event = null;
  let organizerId = null;
  let snapshot;

  if (eventId) {
    event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
    if (event.status !== "published") throw new Error("Published event not found");
    snapshot = toEventSnapshot({
      title: event.title,
      category: event.category,
      eventType: event.eventType,
      date: event.date,
      time: event.time,
      location: event.location,
      city: event.city,
      image: event.image,
    });
    organizerId = event.organizer || null;
  } else {
    snapshot = toEventSnapshot(eventData);
  }

  if (!snapshot.title || !snapshot.date || !snapshot.location) {
    throw new Error("Event snapshot is incomplete");
  }

  const subtotal = Number(ticketDetails?.subtotal || items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const serviceFee = Number(ticketDetails?.serviceFee || 0);
  const total = Number(ticketDetails?.total || subtotal + serviceFee);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (event?.ticketLimit > 0) {
    const soldTickets = await getEventSoldTickets(event._id);
    const remainingTickets = Math.max(event.ticketLimit - soldTickets, 0);
    if (remainingTickets <= 0) {
      throw new Error("This event is sold out");
    }
    if (totalQuantity > remainingTickets) {
      throw new Error(`Only ${remainingTickets} tickets left for this event`);
    }
  }

  if (event?.eventType === "special-program" && (event.activities || []).length) {
    const activityUsageMap = await getActivityUsageMap(event);
    const requestedFullPassQty = items
      .filter((item) => ticketKindFromName(item.name) === "full-event-pass")
      .reduce((sum, item) => sum + item.quantity, 0);

    for (const activity of event.activities || []) {
      const activityLimit = Number(activity.ticketLimit || 0);
      if (activityLimit <= 0) continue;

      const soldForActivity = activityUsageMap.get(String(activity.id)) || 0;
      const requestedDirectQty = items
        .filter((item) => ticketKindFromName(item.name) === "activity" && item.activityId === String(activity.id))
        .reduce((sum, item) => sum + item.quantity, 0);
      const requestedQty = requestedDirectQty + requestedFullPassQty;
      const remainingForActivity = Math.max(activityLimit - soldForActivity, 0);

      if (remainingForActivity <= 0 && requestedQty > 0) {
        throw new Error(`"${activity.name}" is sold out`);
      }

      if (requestedQty > remainingForActivity) {
        throw new Error(`Only ${remainingForActivity} tickets left for "${activity.name}"`);
      }
    }
  }

  return {
    startedAt,
    items,
    totalQuantity,
    orderData: {
      buyer: user._id,
      buyerName: user.fullName,
      buyerEmail: user.email,
      event: event?._id || null,
      organizer: organizerId,
      eventSnapshot: snapshot,
      items: items.map((item) => ({
        name: item.name,
        activityId: item.activityId,
        quantity: item.quantity,
        price: item.price,
        kind: ticketKindFromName(item.name),
      })),
      quantity: totalQuantity,
      subtotal,
      serviceFee,
      total,
      checkInStatus: "not-checked-in",
    },
  };
}

export async function createTicketOrderForUser({
  user,
  eventId,
  eventData,
  ticketDetails,
  paymentStatus = "paid",
  paymentProvider = "manual",
}) {
  const { orderData } = await buildTicketOrderDataForUser({ user, eventId, eventData, ticketDetails });
  return Order.create({
    ...orderData,
    paymentStatus,
    paymentProvider,
  });
}

export function createPendingTicketOrderForUser({ user, eventId, eventData, ticketDetails }) {
  return createTicketOrderForUser({
    user,
    eventId,
    eventData,
    ticketDetails,
    paymentStatus: "pending",
    paymentProvider: "freedompay",
  });
}

export async function issueTicketsForPaidOrder(orderOrId) {
  const order = typeof orderOrId === "string" || orderOrId?._bsontype === "ObjectId"
    ? await Order.findById(orderOrId)
    : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }
  if (order.paymentStatus !== "paid") {
    throw new Error("Order is not paid");
  }

  const existingTickets = await Ticket.find({ order: order._id, status: { $ne: "cancelled" } }).sort({ createdAt: 1 });
  if (existingTickets.length >= Number(order.quantity || 0)) {
    return existingTickets.map(publicTicket);
  }
  if (existingTickets.length > 0) {
    throw new Error("Ticket issue is incomplete for this order");
  }

  const startedAt = Date.now();
  const createdTickets = [];
  for (const item of order.items || []) {
    for (let index = 0; index < Number(item.quantity || 0); index += 1) {
      const ticketCode = await generateNextTicketCode();
      const ticketDraft = new Ticket({
        ticketCode,
        user: order.buyer,
        userEmail: order.buyerEmail,
        userFullName: order.buyerName,
        order: order._id,
        event: order.event || null,
        organizer: order.organizer || null,
        eventSnapshot: order.eventSnapshot,
        ticketType: item.name,
        price: item.price,
        currency: "KZT",
        qrPayload: "",
        qrSignature: "",
        qrCodeDataUrl: "",
        barcodeDataUrl: "",
        status: "active",
      });

      const signed = createSignedTicketToken({
        ticketId: ticketDraft._id.toString(),
        ticketCode,
      });

      ticketDraft.qrPayload = signed.payload;
      ticketDraft.qrSignature = signed.signature;
      const [qrCodeDataUrl, barcodeDataUrl] = await Promise.all([
        generateTicketQrDataUrl(signed.token),
        generateTicketBarcodeDataUrl(ticketCode),
      ]);
      ticketDraft.qrCodeDataUrl = qrCodeDataUrl;
      ticketDraft.barcodeDataUrl = barcodeDataUrl;

      await ticketDraft.save();
      createdTickets.push({
        document: ticketDraft,
        qrToken: signed.token,
      });
    }
  }

  order.ticketsIssuedAt = new Date();
  await order.save();

  queueTicketEmailDelivery({
    email: order.buyerEmail,
    fullName: order.buyerName,
    event: order.eventSnapshot,
    tickets: createdTickets.map(({ document, qrToken }) => ({
      ticketCode: document.ticketCode,
      ticketType: document.ticketType,
      price: document.price,
      qrToken,
    })),
  });

  console.log(
    `TICKET ISSUE ${order.buyerEmail} ok (order=${order._id}, quantity=${order.quantity}, tickets=${createdTickets.length}, total=${Date.now() - startedAt}ms)`
  );

  return createdTickets.map(({ document }) => publicTicket(document));
}

export async function purchaseTicketsForUser({ user, eventId, eventData, ticketDetails }) {
  const startedAt = Date.now();
  const order = await createTicketOrderForUser({
    user,
    eventId,
    eventData,
    ticketDetails,
    paymentStatus: "paid",
    paymentProvider: "manual",
  });
  const tickets = await issueTicketsForPaidOrder(order);

  console.log(
    `TICKET PURCHASE ${user.email} ok (quantity=${order.quantity}, tickets=${tickets.length}, total=${Date.now() - startedAt}ms)`
  );

  return {
    order,
    tickets,
  };
}

export async function markOrderPaidAndIssueTickets(orderOrId, paymentFields = {}) {
  const order = typeof orderOrId === "string" || orderOrId?._bsontype === "ObjectId"
    ? await Order.findById(orderOrId)
    : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";
    order.paidAt = order.paidAt || new Date();
  }

  Object.assign(order, paymentFields);
  await order.save();

  const tickets = await issueTicketsForPaidOrder(order);
  return { order, tickets };
}

export async function getMyTickets(userId) {
  const tickets = await Ticket.find({ user: userId, status: { $ne: "cancelled" } }).sort({ createdAt: -1 }).limit(300);
  return tickets.map(publicTicket);
}

export async function refundTicketForUser({ ticketId, user }) {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    user: user._id,
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.status === "used") {
    throw new Error("Used tickets cannot be refunded");
  }

  if (ticket.status === "cancelled") {
    throw new Error("This ticket has already been refunded");
  }

  const eventStart = parseEventStartDate(ticket.eventSnapshot);
  if (!eventStart) {
    throw new Error("Refund is unavailable for this event");
  }

  const msUntilEvent = eventStart.getTime() - Date.now();
  if (msUntilEvent < 24 * 60 * 60 * 1000) {
    throw new Error("Refund is available only more than 1 day before the event");
  }

  const order = await Order.findById(ticket.order);
  if (!order) {
    throw new Error("Order not found");
  }

  ticket.status = "cancelled";
  await ticket.save();

  const targetKind = ticketKindFromName(ticket.ticketType);
  const itemIndex = (order.items || []).findIndex((item) => item.name === ticket.ticketType && item.kind === targetKind && Number(item.quantity || 0) > 0);
  if (itemIndex >= 0) {
    order.items[itemIndex].quantity = Math.max(Number(order.items[itemIndex].quantity || 0) - 1, 0);
    if (order.items[itemIndex].quantity === 0) {
      order.items.splice(itemIndex, 1);
    }
  }

  order.quantity = Math.max(Number(order.quantity || 0) - 1, 0);
  order.subtotal = Math.max(Number(order.subtotal || 0) - Number(ticket.price || 0), 0);
  order.total = Math.max(Number(order.total || 0) - Number(ticket.price || 0), 0);

  if (order.quantity === 0 || (order.items || []).length === 0) {
    await Order.deleteOne({ _id: order._id });
  } else {
    await order.save();
  }

  let emailSent = false;
  try {
    emailSent = await sendRefundEmail({
      email: user.email,
      fullName: user.fullName,
      ticketCode: ticket.ticketCode,
      ticketType: ticket.ticketType,
      event: ticket.eventSnapshot,
    });
  } catch (error) {
    console.error("Refund email error:", error?.message || error);
  }

  return {
    ticketId: ticket._id,
    ticketCode: ticket.ticketCode,
    message: "Refund requested successfully",
    emailSent,
  };
}

async function createValidationLog({ validator, ticket, event, qrToken, result, message }) {
  await ValidationLog.create({
    validator: validator._id,
    validatorEmail: validator.email,
    ticket: ticket?._id || null,
    event: event?._id || event || null,
    qrToken: qrToken || "",
    result,
    message,
  });
}

async function resolveTicketFromScanInput(scanInput) {
  const verified = verifySignedTicketToken(scanInput);
  if (verified.valid && verified.payload?.ticketId && verified.payload?.ticketCode) {
    const ticket = await Ticket.findById(verified.payload.ticketId);
    if (!ticket || ticket.ticketCode !== verified.payload.ticketCode) {
      return { ticket: null, mode: "invalid" };
    }
    return { ticket, mode: "qr" };
  }

  const barcodeTicket = await Ticket.findOne({ ticketCode: String(scanInput || "").trim() });
  if (barcodeTicket) {
    return { ticket: barcodeTicket, mode: "barcode" };
  }

  return { ticket: null, mode: "invalid" };
}

export async function validateTicketScan({ qrToken, currentUser, expectedEventId = "" }) {
  const { ticket } = await resolveTicketFromScanInput(qrToken);
  if (!ticket) {
    await createValidationLog({
      validator: currentUser,
      ticket: null,
      event: expectedEventId || null,
      qrToken,
      result: "invalid",
      message: "invalid ticket",
    });
    return { status: "invalid", message: "invalid ticket" };
  }

  const canValidate =
    isAdminEmail(currentUser?.email) ||
    (ticket.organizer && String(ticket.organizer) === String(currentUser?._id)) ||
    ((currentUser?.role === "validator" || currentUser?.isValidator) &&
      (currentUser?.validatorAssignedEventIds || []).some((item) => String(item) === String(ticket.event || expectedEventId || "")));

  if (!canValidate) {
    await createValidationLog({
      validator: currentUser,
      ticket,
      event: ticket.event,
      qrToken,
      result: "invalid",
      message: "invalid ticket",
    });
    return { status: "invalid", message: "invalid ticket" };
  }

  if (expectedEventId && String(ticket.event || "") !== String(expectedEventId)) {
    await createValidationLog({
      validator: currentUser,
      ticket,
      event: expectedEventId,
      qrToken,
      result: "another-event",
      message: "ticket belongs to another event",
    });
    return {
      status: "another-event",
      message: "ticket belongs to another event",
      ticket: publicTicket(ticket),
    };
  }

  if (ticket.status === "used") {
    await createValidationLog({
      validator: currentUser,
      ticket,
      event: ticket.event,
      qrToken,
      result: "already-used",
      message: "already used",
    });
    return {
      status: "already-used",
      message: "already used",
      ticket: publicTicket(ticket),
    };
  }

  if (ticket.status !== "active") {
    await createValidationLog({
      validator: currentUser,
      ticket,
      event: ticket.event,
      qrToken,
      result: "invalid",
      message: "invalid ticket",
    });
    return { status: "invalid", message: "invalid ticket" };
  }

  ticket.status = "used";
  ticket.usedAt = new Date();
  await ticket.save();
  if (ticket.order) {
    await Order.findByIdAndUpdate(ticket.order, {
      checkInStatus: "checked-in",
    });
  }
  await createValidationLog({
    validator: currentUser,
    ticket,
    event: ticket.event,
    qrToken,
    result: "validated",
    message: "ticket validated",
  });

  return {
    status: "validated",
    message: "ticket validated",
    ticket: publicTicket(ticket),
  };
}
