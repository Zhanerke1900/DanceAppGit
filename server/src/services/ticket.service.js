import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import ValidationLog from "../models/ValidationLog.js";
import { generateNextTicketCode } from "../utils/ticketCode.js";
import { createSignedTicketToken, verifySignedTicketToken } from "../utils/ticketSecurity.js";
import { generateTicketQrDataUrl } from "../utils/ticketQr.js";
import { generateTicketBarcodeDataUrl } from "../utils/ticketBarcode.js";
import { sendTicketEmail } from "../utils/sendTicketEmail.js";
import { sendEventCancelledEmail, sendRefundEmail } from "../utils/sendEmails.js";
import { isAdminEmail } from "../utils/admin.js";
import { getEventStartAt, isEventPast } from "../utils/eventDates.js";
import { normalizeEmailLanguage } from "../utils/emailLocale.js";
import { refundFreedomPayPayment } from "./freedompay.service.js";

function queueTicketEmailDelivery({ email, fullName, event, tickets, language }) {
  setTimeout(() => {
    sendTicketEmail({ email, fullName, event, tickets, language }).catch((error) => {
      console.error("Ticket email error:", error?.message || error);
    });
  }, 0);
}

async function getOrderBuyerLanguage(order) {
  if (order?.buyer?.language) return normalizeEmailLanguage(order.buyer.language);

  const buyerId = order?.buyer?._id || order?.buyer;
  if (!buyerId) return normalizeEmailLanguage(order?.buyerLanguage);

  const buyer = await User.findById(buyerId).select("language").lean();
  return normalizeEmailLanguage(buyer?.language || order?.buyerLanguage);
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
    translations: eventData.translations && typeof eventData.translations === "object" ? eventData.translations : {},
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

function parsePriceValue(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const digits = String(value || "").replace(/\D/g, "");
  return Number(digits || 0);
}

function ticketKindFromName(name) {
  const lowerName = String(name || "").toLowerCase();
  if (lowerName === "full event pass") return "full-event-pass";
  if (lowerName === "event ticket") return "event-ticket";
  return "activity";
}

function applyManagedEventPrices(items, event) {
  if (!event) return items;

  const activitiesById = new Map((event.activities || []).map((activity) => [String(activity.id), activity]));
  const eventTicketPrice =
    parsePriceValue(event.ticketPricing?.generalAdmission) ||
    parsePriceValue(event.price);
  const fullPassPrice = Number(event.fullPassPrice || 0);

  return items.map((item) => {
    const kind = ticketKindFromName(item.name);
    let price = Number(item.price || 0);

    if (kind === "event-ticket" && eventTicketPrice > 0) {
      price = eventTicketPrice;
    } else if (kind === "full-event-pass" && fullPassPrice > 0) {
      price = fullPassPrice;
    } else if (kind === "activity" && item.activityId) {
      const activity = activitiesById.get(String(item.activityId));
      if (activity) price = Number(activity.price || 0);
    }

    return {
      ...item,
      price,
    };
  });
}

function parseEventStartDate(eventSnapshot = {}) {
  return getEventStartAt(eventSnapshot);
}

const DEFAULT_DEPOSIT_RATE = 0.4;
const DEFAULT_REFUND_POLICY_HOURS = 48;
const DEFAULT_BALANCE_DEADLINE_HOURS = 5;

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function normalizePaymentType(value) {
  return String(value || "deposit").trim().toLowerCase() === "full" ? "full" : "deposit";
}

function buildBalanceDueDeadline(eventSnapshot = {}) {
  const eventStart = parseEventStartDate(eventSnapshot);
  if (!eventStart) return null;
  return new Date(eventStart.getTime() - DEFAULT_BALANCE_DEADLINE_HOURS * 60 * 60 * 1000);
}

function buildBookingPaymentFields(total, ticketDetails = {}, eventSnapshot = {}) {
  // full = сразу вся сумма, deposit = 40% сейчас и остаток до дедлайна.
  const paymentType = normalizePaymentType(ticketDetails?.paymentType);
  const depositRate = paymentType === "deposit" ? DEFAULT_DEPOSIT_RATE : 1;
  const depositAmount = money(paymentType === "deposit" ? total * depositRate : total);
  const amountPaid = depositAmount;
  const balanceDue = money(Math.max(total - amountPaid, 0));

  return {
    paymentType,
    depositRate,
    depositAmount,
    amountPaid,
    balanceDue,
    refundPolicyHours: DEFAULT_REFUND_POLICY_HOURS,
    balanceDueDeadlineHours: DEFAULT_BALANCE_DEADLINE_HOURS,
    balanceDueDeadlineAt: paymentType === "deposit" ? buildBalanceDueDeadline(eventSnapshot) : null,
  };
}

function reservationCanBeCompleted(order) {
  if (order.paymentType !== "deposit") return true;
  if (!order.balanceDueDeadlineAt) return true;
  return new Date(order.balanceDueDeadlineAt).getTime() > Date.now();
}

export function getOrderPaymentDueNow(order) {
  // Для обычного pending order платится первый платеж, для reserved order платится только остаток.
  if (order.paymentStatus === "reserved") {
    return money(order.balanceDue || 0);
  }
  return money(order.amountPaid || order.depositAmount || order.total || 0);
}

function recordSuccessfulPayment(order, paymentFields = {}) {
  // Сохраняем успешные FreedomPay транзакции, чтобы потом можно было делать refund.
  order.paymentTransactions = order.paymentTransactions || [];
  const provider = String(paymentFields.paymentProvider || order.paymentProvider || "").trim();
  const paymentId = String(paymentFields.freedomPayPaymentId || "").trim();
  const amount = money(paymentFields.paymentAmount);

  if (provider !== "freedompay" || !paymentId || amount <= 0) return;

  const alreadyRecorded = (order.paymentTransactions || []).some((transaction) =>
    transaction.provider === "freedompay" &&
    transaction.type === "payment" &&
    String(transaction.paymentId || "") === paymentId
  );
  if (alreadyRecorded) return;

  order.paymentTransactions.push({
    provider: "freedompay",
    paymentId,
    amount,
    refundedAmount: 0,
    currency: String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim() || "KZT",
    type: "payment",
    status: "success",
    paidAt: paymentFields.paidAt || new Date(),
  });
}

function getRefundableFreedomPayTransactions(order) {
  const transactions = (order.paymentTransactions || [])
    .filter((transaction) => transaction.provider === "freedompay" && transaction.type === "payment" && transaction.status === "success" && transaction.paymentId)
    .map((transaction, index) => ({
      transaction,
      index,
      remaining: money(Number(transaction.amount || 0) - Number(transaction.refundedAmount || 0)),
    }))
    .filter((item) => item.remaining > 0);

  if (transactions.length > 0) return transactions;

  if (order.paymentProvider === "freedompay" && order.freedomPayPaymentId) {
    return [{
      transaction: {
        provider: "freedompay",
        paymentId: order.freedomPayPaymentId,
        amount: Number(order.amountPaid || order.total || 0),
        refundedAmount: 0,
      },
      index: -1,
      remaining: money(Number(order.amountPaid || order.total || 0)),
    }];
  }

  return [];
}

async function refundOrderPayment(order, amount, refundScopeId = "") {
  const refundAmount = money(amount);
  if (refundAmount <= 0) return [];
  if (order.paymentProvider !== "freedompay") return [];
  order.paymentTransactions = order.paymentTransactions || [];

  if ((order.paymentTransactions || []).length === 0 && order.freedomPayPaymentId) {
    order.paymentTransactions.push({
      provider: "freedompay",
      paymentId: order.freedomPayPaymentId,
      amount: money(order.amountPaid || order.total || refundAmount),
      refundedAmount: 0,
      currency: String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim() || "KZT",
      type: "payment",
      status: "success",
      paidAt: order.paidAt || order.updatedAt || new Date(),
    });
  }

  const transactions = getRefundableFreedomPayTransactions(order);
  if (transactions.length === 0) {
    throw new Error("Freedom Pay refund is unavailable: payment transaction was not found");
  }

  let remaining = refundAmount;
  const refunds = [];
  for (const item of transactions) {
    if (remaining <= 0) break;
    const amountForTransaction = money(Math.min(item.remaining, remaining));
    if (amountForTransaction <= 0) continue;

    const refund = await refundFreedomPayPayment({
      paymentId: item.transaction.paymentId,
      amount: amountForTransaction,
      orderId: order._id,
      idempotencyKey: `${order._id}-${refundScopeId || "refund"}-${item.transaction.paymentId}-${amountForTransaction}`,
    });
    refunds.push(refund);
    remaining = money(remaining - amountForTransaction);

    if (item.index >= 0 && order.paymentTransactions[item.index]) {
      order.paymentTransactions[item.index].refundedAmount = money(
        Number(order.paymentTransactions[item.index].refundedAmount || 0) + amountForTransaction
      );
    }
    order.paymentTransactions.push({
      provider: "freedompay",
      paymentId: item.transaction.paymentId,
      amount: amountForTransaction,
      refundedAmount: 0,
      currency: String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim() || "KZT",
      type: "refund",
      status: "success",
      paidAt: new Date(),
    });
  }

  if (remaining > 0) {
    throw new Error("Freedom Pay refund is unavailable: refundable payment amount is not enough");
  }

  return refunds;
}

function isPastEventSnapshot(eventSnapshot = {}) {
  return isEventPast(eventSnapshot);
}

async function getEventSoldTickets(eventId) {
  const inventoryOrders = await Order.find({
    event: eventId,
    $or: [
      { paymentStatus: "paid" },
      { paymentStatus: "reserved", $or: [{ balanceDueDeadlineAt: null }, { balanceDueDeadlineAt: { $gt: new Date() } }] },
    ],
  }).select("quantity").lean();

  return inventoryOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
}

async function getActivityUsageMap(event) {
  const usageMap = new Map((event.activities || []).map((activity) => [String(activity.id), 0]));
  if (!event?._id || !(event.activities || []).length) return usageMap;

  const inventoryOrders = await Order.find({
    event: event._id,
    $or: [
      { paymentStatus: "paid" },
      { paymentStatus: "reserved", $or: [{ balanceDueDeadlineAt: null }, { balanceDueDeadlineAt: { $gt: new Date() } }] },
    ],
  }).select("items").lean();

  for (const order of inventoryOrders) {
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

export function publicTicket(ticket, { includeMedia = true } = {}) {
  const result = {
    id: ticket._id,
    ticketId: ticket._id,
    orderId: ticket.order,
    ticketCode: ticket.ticketCode,
    status: ticket.status,
    purchasedAt: ticket.purchasedAt || ticket.createdAt,
    usedAt: ticket.usedAt,
    ticketType: ticket.ticketType,
    price: ticket.price,
    currency: ticket.currency,
    paymentType: ticket.paymentType || "full",
    depositRate: Number(ticket.depositRate || 1),
    amountPaid: Number(ticket.amountPaid || ticket.price || 0),
    balanceDue: Number(ticket.balanceDue || 0),
    orderTotal: Number(ticket.orderTotal || ticket.price || 0),
    refundPolicyHours: Number(ticket.refundPolicyHours || DEFAULT_REFUND_POLICY_HOURS),
    event: ticket.eventSnapshot,
    isPast: isPastEventSnapshot(ticket.eventSnapshot),
  };
  if (includeMedia) {
    result.qrCodeDataUrl = ticket.qrCodeDataUrl;
    result.barcodeDataUrl = ticket.barcodeDataUrl;
  }
  return result;
}

export function publicReservation(order) {
  return {
    id: order._id,
    orderId: order._id,
    status: order.paymentStatus,
    createdAt: order.createdAt,
    reservedAt: order.reservedAt || order.paidAt || order.createdAt,
    quantity: Number(order.quantity || 0),
    items: order.items || [],
    subtotal: Number(order.subtotal || 0),
    serviceFee: Number(order.serviceFee || 0),
    total: Number(order.total || 0),
    paymentType: order.paymentType || "deposit",
    depositRate: Number(order.depositRate || DEFAULT_DEPOSIT_RATE),
    amountPaid: Number(order.amountPaid || order.depositAmount || 0),
    balanceDue: Number(order.balanceDue || 0),
    balanceDueDeadlineAt: order.balanceDueDeadlineAt,
    balanceDueDeadlineHours: Number(order.balanceDueDeadlineHours || DEFAULT_BALANCE_DEADLINE_HOURS),
    refundPolicyHours: Number(order.refundPolicyHours || DEFAULT_REFUND_POLICY_HOURS),
    canPayBalance: reservationCanBeCompleted(order),
    isPast: isEventPast(order.eventSnapshot),
    event: order.eventSnapshot,
  };
}

async function buildTicketOrderDataForUser({ user, eventId, eventData, ticketDetails }) {
  const startedAt = Date.now();
  let items = normalizeTicketItems(ticketDetails);
  if (items.length === 0) {
    throw new Error("At least one ticket item is required");
  }

  let event = null;
  let organizerId = null;
  let snapshot;

  // Если eventId есть, цена и лимиты берутся с managed Event из базы, а не слепо с frontend.
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
      translations: event.translations || {},
    });
    organizerId = event.organizer || null;
    items = applyManagedEventPrices(items, event);
  } else {
    snapshot = toEventSnapshot(eventData);
  }

  if (!snapshot.title || !snapshot.date || !snapshot.location) {
    throw new Error("Event snapshot is incomplete");
  }

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = Number((event ? calculatedSubtotal : Number(ticketDetails?.subtotal || calculatedSubtotal)).toFixed(2));
  const serviceFee = 0;
  const total = Number(subtotal.toFixed(2));
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const bookingPayment = buildBookingPaymentFields(total, ticketDetails, snapshot);

  if (!Number.isFinite(subtotal) || !Number.isFinite(serviceFee) || !Number.isFinite(total) || total < 0) {
    throw new Error("Payment amount is invalid");
  }

  // Проверка общего лимита билетов на событие.
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

  // Для special program проверяем лимиты по каждой activity отдельно.
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
      buyerLanguage: normalizeEmailLanguage(user.language),
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
      ...bookingPayment,
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

  // Защита от повторной выдачи: если билеты уже есть, второй раз их не создаем.
  const existingTickets = await Ticket.find({ order: order._id, status: { $ne: "cancelled" } }).sort({ createdAt: 1 }).lean();
  if (existingTickets.length >= Number(order.quantity || 0)) {
    return existingTickets.map(publicTicket);
  }
  if (existingTickets.length > 0) {
    throw new Error("Ticket issue is incomplete for this order");
  }

  const startedAt = Date.now();
  const createdTickets = [];
  const orderAmountPaid = Number(order.amountPaid || order.total || 0);
  const orderBalanceDue = Number(order.balanceDue || 0);
  const orderSubtotal = Number(order.subtotal || 0);
  const ticketDrafts = [];
  for (const item of order.items || []) {
    for (let index = 0; index < Number(item.quantity || 0); index += 1) {
      const ticketCode = await generateNextTicketCode();
      const itemRatio = orderSubtotal > 0 ? Number(item.price || 0) / orderSubtotal : 1 / Number(order.quantity || 1);
      ticketDrafts.push(new Ticket({
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
        paymentType: order.paymentType || "full",
        depositRate: Number(order.depositRate || 1),
        amountPaid: money(orderAmountPaid * itemRatio),
        balanceDue: money(orderBalanceDue * itemRatio),
        orderTotal: Number(order.total || item.price || 0),
        refundPolicyHours: Number(order.refundPolicyHours || DEFAULT_REFUND_POLICY_HOURS),
        qrPayload: "",
        qrSignature: "",
        qrCodeDataUrl: "",
        barcodeDataUrl: "",
        status: "active",
      }));
    }
  }

  if (ticketDrafts.length === 0) {
    throw new Error("No tickets to issue");
  }

  const primaryTicket = ticketDrafts[0];
  const ticketIds = ticketDrafts.map((ticket) => ticket._id.toString());
  const ticketCodes = ticketDrafts.map((ticket) => ticket.ticketCode);
  // Один order-level QR покрывает все билеты, купленные в рамках этой оплаты.
  const signed = createSignedTicketToken({
    ticketId: primaryTicket._id.toString(),
    ticketCode: primaryTicket.ticketCode,
    orderId: order._id.toString(),
    ticketIds,
    ticketCodes,
  });

  const [qrCodeDataUrl, barcodeDataUrls] = await Promise.all([
    generateTicketQrDataUrl(signed.token),
    Promise.all(ticketDrafts.map((ticket) => generateTicketBarcodeDataUrl(ticket.ticketCode))),
  ]);

  for (let index = 0; index < ticketDrafts.length; index += 1) {
    const ticketDraft = ticketDrafts[index];
    ticketDraft.qrPayload = signed.payload;
    ticketDraft.qrSignature = signed.signature;
    ticketDraft.qrCodeDataUrl = qrCodeDataUrl;
    ticketDraft.barcodeDataUrl = barcodeDataUrls[index];

    await ticketDraft.save();
    createdTickets.push({
      document: ticketDraft,
      qrToken: signed.token,
    });
  }

  order.ticketsIssuedAt = new Date();
  await order.save();

  const buyerLanguage = await getOrderBuyerLanguage(order);

  queueTicketEmailDelivery({
    email: order.buyerEmail,
    fullName: order.buyerName,
    event: order.eventSnapshot,
    language: buyerLanguage,
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

  order.amountPaid = Number(order.total || order.amountPaid || 0);
  order.balanceDue = 0;
  order.depositAmount = Number(order.depositAmount || order.amountPaid || 0);
  recordSuccessfulPayment(order, paymentFields);
  Object.assign(order, paymentFields);
  await order.save();

  // Только после paid status выпускаем реальные Ticket документы.
  const tickets = await issueTicketsForPaidOrder(order);
  return { order, tickets };
}

export async function markOrderReserved(orderOrId, paymentFields = {}) {
  const order = typeof orderOrId === "string" || orderOrId?._bsontype === "ObjectId"
    ? await Order.findById(orderOrId)
    : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }
  if (order.paymentType !== "deposit") {
    throw new Error("Only deposit orders can be reserved");
  }

  // Deposit order становится reserved: место занято, но билеты еще не выданы.
  order.paymentStatus = "reserved";
  order.reservedAt = order.reservedAt || new Date();
  order.paidAt = order.paidAt || new Date();
  order.amountPaid = Number(order.depositAmount || order.amountPaid || 0);
  order.balanceDue = money(Math.max(Number(order.total || 0) - Number(order.amountPaid || 0), 0));
  recordSuccessfulPayment(order, paymentFields);
  Object.assign(order, paymentFields);
  await order.save();

  return { order, reservation: publicReservation(order) };
}

export async function completeReservationAndIssueTickets(orderOrId, paymentFields = {}) {
  const order = typeof orderOrId === "string" || orderOrId?._bsontype === "ObjectId"
    ? await Order.findById(orderOrId)
    : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }
  if (order.paymentStatus !== "reserved") {
    throw new Error("Reservation is not available for payment");
  }
  if (!reservationCanBeCompleted(order)) {
    order.paymentStatus = "failed";
    order.paymentFailureReason = "Reservation payment deadline has passed";
    await order.save();
    throw new Error("Reservation must be fully paid at least 5 hours before the event");
  }

  // После доплаты остатка reserved order превращается в paid и получает билеты.
  return markOrderPaidAndIssueTickets(order, {
    ...paymentFields,
    amountPaid: Number(order.total || 0),
    balanceDue: 0,
    paymentFailureReason: "",
  });
}

export async function getMyTickets(userId) {
  const tickets = await Ticket.find({ user: userId, status: { $ne: "cancelled" } })
    .select("-qrPayload -qrSignature -qrCodeDataUrl -barcodeDataUrl")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  return tickets.map((ticket) => publicTicket(ticket, { includeMedia: false }));
}

export async function getPurchaseHistory(userId) {
  const tickets = await Ticket.find({ user: userId })
    .select("-qrPayload -qrSignature -qrCodeDataUrl -barcodeDataUrl")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return tickets.map((ticket) => publicTicket(ticket, { includeMedia: false }));
}

export async function getTicketForUser({ ticketId, user }) {
  const ticket = await Ticket.findOne({
    _id: ticketId,
    user: user._id,
    status: { $ne: "cancelled" },
  }).lean();

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return publicTicket(ticket, { includeMedia: true });
}

export async function getMyReservations(userId) {
  const reservations = await Order.find({
    buyer: userId,
    paymentStatus: "reserved",
  }).sort({ createdAt: -1 }).limit(300).lean();

  return reservations.map(publicReservation);
}

export async function cancelEventOrdersForOrganizer({ event, cancelledBy }) {
  // При отмене published event отменяем все активные билеты/брони и запускаем refund.
  const orders = await Order.find({
    event: event._id,
    paymentStatus: { $in: ["paid", "reserved"] },
  }).populate("buyer", "language").sort({ createdAt: 1 });

  const summary = {
    orders: orders.length,
    processedOrders: 0,
    ticketsCancelled: 0,
    emailsSent: 0,
    emailsFailed: 0,
    refundedAmount: 0,
    freedomRefunds: 0,
    simulatedRefunds: 0,
    failedOrders: [],
  };

  for (const order of orders) {
    const tickets = await Ticket.find({
      order: order._id,
      status: { $ne: "cancelled" },
    }).select("ticketCode").lean();
    const ticketCodes = tickets.map((ticket) => ticket.ticketCode).filter(Boolean);
    const refundAmount = money(order.amountPaid || order.depositAmount || order.total || 0);

    try {
      const refunds = refundAmount > 0
        ? await refundOrderPayment(order, refundAmount, `event-cancel-${event._id}-${order._id}`)
        : [];

      const ticketUpdate = await Ticket.updateMany(
        { order: order._id, status: { $ne: "cancelled" } },
        { $set: { status: "cancelled" } }
      );

      order.paymentStatus = "refunded";
      order.balanceDue = 0;
      order.paymentFailureReason = `Event cancelled by organizer${cancelledBy?.email ? ` (${cancelledBy.email})` : ""}; refund requested`;
      await order.save();

      const emailSent = await sendEventCancelledEmail({
        email: order.buyerEmail,
        fullName: order.buyerName,
        event: order.eventSnapshot,
        ticketCodes,
        refundedAmount: refundAmount,
        currency: String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim() || "KZT",
        orderId: order._id,
        language: await getOrderBuyerLanguage(order),
      }).catch((error) => {
        console.error("Event cancellation email error:", error?.message || error);
        return false;
      });

      summary.ticketsCancelled += Number(ticketUpdate.modifiedCount || 0);
      summary.processedOrders += 1;
      summary.refundedAmount = money(summary.refundedAmount + refundAmount);
      summary.freedomRefunds += refunds.length;
      summary.simulatedRefunds += refunds.filter((refund) => refund.simulated).length;
      if (emailSent) summary.emailsSent += 1;
      else summary.emailsFailed += 1;
    } catch (error) {
      summary.failedOrders.push({
        orderId: String(order._id),
        buyerEmail: order.buyerEmail,
        message: error?.message || "Refund failed",
      });
      const failure = new Error(error?.message || "Failed to refund event order");
      failure.refundSummary = summary;
      throw failure;
    }
  }

  return summary;
}

export async function cancelReservationForUser({ orderId, user }) {
  const order = await Order.findOne({
    _id: orderId,
    buyer: user._id,
    paymentStatus: "reserved",
  });

  if (!order) {
    throw new Error("Reservation not found");
  }

  const eventStart = parseEventStartDate(order.eventSnapshot);
  if (!eventStart) {
    throw new Error("Reservation refund is unavailable for this event");
  }

  const msUntilEvent = eventStart.getTime() - Date.now();
  const refundPolicyMs = Number(order.refundPolicyHours || DEFAULT_REFUND_POLICY_HOURS) * 60 * 60 * 1000;
  const refundEligible = msUntilEvent > refundPolicyMs;
  let refunds = [];

  if (refundEligible) {
    refunds = await refundOrderPayment(order, order.amountPaid || order.depositAmount || 0, `reservation-${order._id}`);
  }

  order.paymentStatus = refundEligible ? "refunded" : "failed";
  order.paymentFailureReason = refundEligible
    ? "Reservation cancelled by user; prepayment refund requested"
    : "Reservation cancelled by user; prepayment is non-refundable";
  await order.save();

  return {
    orderId: order._id,
    refundEligible,
    paymentRefunds: refunds,
    message: refundEligible
      ? refunds.some((refund) => refund.simulated)
        ? "Reservation cancelled. Test refund was simulated because Freedom Pay test mode rejected the refund operation"
        : "Reservation cancellation requested successfully"
      : "Reservation cancelled. Prepayment is non-refundable less than 48 hours before the event",
  };
}

export async function refundTicketForUser({ ticketId, user }) {
  let ticket = await Ticket.findOne({
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

  // Atomically mark ticket as cancelled to prevent double refunds
  // Сначала атомарно переводим билет в cancelled, чтобы не было двойного refund.
  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    { status: "cancelled" },
    { new: true, runValidators: false }
  );

  if (!updatedTicket || updatedTicket.status !== "cancelled") {
    throw new Error("Failed to process refund - ticket state changed");
  }

  ticket = updatedTicket;

  const eventStart = parseEventStartDate(ticket.eventSnapshot);
  if (!eventStart) {
    throw new Error("Refund is unavailable for this event");
  }

  const msUntilEvent = eventStart.getTime() - Date.now();
  const order = await Order.findById(ticket.order);
  if (!order) {
    throw new Error("Order not found");
  }

  const refundPolicyMs = Number(order.refundPolicyHours || ticket.refundPolicyHours || DEFAULT_REFUND_POLICY_HOURS) * 60 * 60 * 1000;
  if (order.paymentType === "deposit" && msUntilEvent <= refundPolicyMs) {
    throw new Error("Prepayment is non-refundable less than 48 hours before the event");
  }
  if (order.paymentType !== "deposit" && msUntilEvent < 24 * 60 * 60 * 1000) {
    throw new Error("Refund is available only more than 1 day before the event");
  }

  const refundAmount = money(ticket.amountPaid || ticket.price || 0);
  const refunds = await refundOrderPayment(order, refundAmount, `ticket-${ticket._id}`);

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
  order.amountPaid = Math.max(Number(order.amountPaid || 0) - Number(ticket.amountPaid || 0), 0);
  order.depositAmount = Math.max(Number(order.depositAmount || 0) - Number(ticket.amountPaid || 0), 0);
  order.balanceDue = Math.max(Number(order.balanceDue || 0) - Number(ticket.balanceDue || 0), 0);

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
      language: user.language,
    });
  } catch (error) {
    console.error("Refund email error:", error?.message || error);
  }

  return {
    ticketId: ticket._id,
    ticketCode: ticket.ticketCode,
    message: "Refund requested successfully",
    refundedAmount: refundAmount,
    paymentRefunds: refunds,
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
  if (verified.valid && verified.payload?.orderId) {
    const ticketIds = Array.isArray(verified.payload.ticketIds)
      ? verified.payload.ticketIds.map((item) => String(item)).filter(Boolean)
      : [];
    const ticketCodes = Array.isArray(verified.payload.ticketCodes)
      ? verified.payload.ticketCodes.map((item) => String(item)).filter(Boolean)
      : [];
    const query = {
      order: verified.payload.orderId,
      ...(ticketIds.length > 0 ? { _id: { $in: ticketIds } } : {}),
    };
    const orderTickets = await Ticket.find(query).sort({ createdAt: 1 });
    const matchingTickets = ticketCodes.length > 0
      ? orderTickets.filter((ticket) => ticketCodes.includes(ticket.ticketCode))
      : orderTickets;
    const tickets = matchingTickets.length > 0 ? matchingTickets : orderTickets;
    const ticket = tickets.find((item) => item.status !== "cancelled") || tickets[0] || null;
    if (!ticket) {
      return { ticket: null, tickets: [], mode: "invalid" };
    }
    return { ticket, tickets, mode: "order-qr" };
  }

  if (verified.valid && verified.payload?.ticketId && verified.payload?.ticketCode) {
    const ticket = await Ticket.findById(verified.payload.ticketId);
    if (!ticket || ticket.ticketCode !== verified.payload.ticketCode) {
      return { ticket: null, mode: "invalid" };
    }
    return { ticket, tickets: [ticket], mode: "qr" };
  }

  const barcodeTicket = await Ticket.findOne({ ticketCode: String(scanInput || "").trim() });
  if (barcodeTicket) {
    return { ticket: barcodeTicket, tickets: [barcodeTicket], mode: "barcode" };
  }

  return { ticket: null, tickets: [], mode: "invalid" };
}

function userIsAssignedToEvent(user, eventId) {
  const normalizedEventId = String(eventId || "");
  if (!normalizedEventId) return false;
  return (user?.validatorAssignedEventIds || []).some((item) => String(item) === normalizedEventId);
}

export function getScanAccess({ currentUser, ticketEventId, ticketOrganizerId, expectedEventId = "" }) {
  const isValidator = currentUser?.role === "validator" || currentUser?.isValidator;
  const isAdmin = currentUser?.role === "admin" || currentUser?.isAdmin || isAdminEmail(currentUser?.email);
  const isTicketOrganizer = Boolean(ticketOrganizerId && String(ticketOrganizerId) === String(currentUser?._id));
  const canValidateAssignedTicket = isValidator && userIsAssignedToEvent(currentUser, ticketEventId);
  const canInspectSelectedEvent = isValidator && userIsAssignedToEvent(currentUser, expectedEventId);

  return {
    canValidateTicket: isAdmin || isTicketOrganizer || canValidateAssignedTicket,
    canReportAnotherEvent: isAdmin || isTicketOrganizer || canInspectSelectedEvent,
  };
}

export async function validateTicketScan({ qrToken, currentUser, expectedEventId = "" }) {
  const resolvedScan = await resolveTicketFromScanInput(qrToken);
  const { ticket } = resolvedScan;
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

  const scanTickets = resolvedScan.tickets?.length ? resolvedScan.tickets : [ticket];
  const activeTickets = scanTickets.filter((item) => item.status === "active");
  const nonCancelledTickets = scanTickets.filter((item) => item.status !== "cancelled");
  const ticketEventId = String(ticket.event || "");
  const selectedEventId = String(expectedEventId || "");
  const scanAccess = getScanAccess({
    currentUser,
    ticketEventId,
    ticketOrganizerId: ticket.organizer,
    expectedEventId: selectedEventId,
  });

  if (selectedEventId && ticketEventId !== selectedEventId) {
    if (!scanAccess.canReportAnotherEvent) {
      await createValidationLog({
        validator: currentUser,
        ticket,
        event: selectedEventId || ticket.event,
        qrToken,
        result: "invalid",
        message: "invalid ticket",
      });
      return { status: "invalid", message: "invalid ticket" };
    }

    await createValidationLog({
      validator: currentUser,
      ticket,
      event: selectedEventId,
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

  // Проверять билет может admin, organizer этого события или назначенный validator.
  if (!scanAccess.canValidateTicket) {
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

  if (activeTickets.length === 0 && nonCancelledTickets.some((item) => item.status === "used")) {
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
      ticketCount: nonCancelledTickets.length,
      ticketCodes: nonCancelledTickets.map((item) => item.ticketCode),
    };
  }

  if (activeTickets.length === 0) {
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

  // Успешный order-level QR scan одноразово проводит все активные билеты этой покупки.
  const usedAt = new Date();
  await Ticket.updateMany(
    { _id: { $in: activeTickets.map((item) => item._id) }, status: "active" },
    { $set: { status: "used", usedAt } }
  );
  for (const item of activeTickets) {
    item.status = "used";
    item.usedAt = usedAt;
  }
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
    message: activeTickets.length > 1 ? `${activeTickets.length} tickets validated` : "ticket validated",
  });

  return {
    status: "validated",
    message: activeTickets.length > 1 ? `${activeTickets.length} tickets validated` : "ticket validated",
    ticket: publicTicket(activeTickets[0] || ticket),
    tickets: activeTickets.map(publicTicket),
    ticketCount: activeTickets.length,
    ticketCodes: activeTickets.map((item) => item.ticketCode),
  };
}
