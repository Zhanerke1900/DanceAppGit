import { createFreedomPayPayment } from "../services/freedompay.service.js";
import Order from "../models/Order.js";
import { invalidatePublishedEventsCache } from "../routes/events.routes.js";
import {
  cancelReservationForUser,
  completeReservationAndIssueTickets,
  createPendingTicketOrderForUser,
  getMyReservations,
  getMyTickets,
  getTicketForUser,
  getPurchaseHistory,
  markOrderPaidAndIssueTickets,
  markOrderReserved,
  refundTicketForUser,
  validateTicketScan,
} from "../services/ticket.service.js";

function freedomPayConfigMissing() {
  return !String(process.env.FREEDOMPAY_MERCHANT_ID || "").trim() ||
    !String(process.env.FREEDOMPAY_SECRET_KEY || "").trim();
}

function isLocalDevelopmentPaymentFallbackEnabled() {
  const nodeEnv = String(process.env.NODE_ENV || "development").trim().toLowerCase();
  const frontendUrl = String(process.env.FRONTEND_URL || "").trim();
  return nodeEnv !== "production" || frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1");
}

export async function purchaseTickets(req, res) {
  try {
    const { eventId, eventData, ticketDetails } = req.body || {};
    // Сначала создаем Order в статусе pending. Билеты появятся только после оплаты.
    const order = await createPendingTicketOrderForUser({
      user: req.user,
      eventId,
      eventData,
      ticketDetails,
    });

    // В local/dev можно обойти FreedomPay, чтобы тестировать покупку без реальной оплаты.
    if (Number(order.total || 0) <= 0 || (freedomPayConfigMissing() && isLocalDevelopmentPaymentFallbackEnabled())) {
      if (order.paymentType === "deposit" && Number(order.balanceDue || 0) > 0) {
        const result = await markOrderReserved(order, {
          paymentProvider: "manual",
          paymentFailureReason: "",
        });
        invalidatePublishedEventsCache();
        return res.status(201).json({
          message: "Reservation created",
          orderId: result.order._id,
          reservation: result.reservation,
        });
      }

      const result = await markOrderPaidAndIssueTickets(order, {
        paymentProvider: "manual",
        paidAt: new Date(),
        paymentFailureReason: "",
      });
      invalidatePublishedEventsCache();
      return res.status(201).json({
        message: "Tickets created successfully",
        orderId: result.order._id,
        tickets: result.tickets,
      });
    }

    // В production создаем платежную ссылку FreedomPay и ждем callback в payment.routes.js.
    let payment;
    try {
      payment = await createFreedomPayPayment(order);
    } catch (error) {
      order.paymentStatus = "failed";
      order.paymentFailureReason = `Freedom Pay init failed: ${error?.message || "unknown error"}`;
      await order.save();
      throw error;
    }

    if (payment.paymentId) {
      order.freedomPayPaymentId = String(payment.paymentId);
      await order.save();
    }

    return res.status(201).json({
      message: "Payment initialized",
      orderId: order._id,
      paymentUrl: payment.paymentUrl,
      paymentId: payment.paymentId,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Failed to initialize payment" });
  }
}

export async function myTickets(req, res) {
  try {
    // Пользователь видит отдельно готовые билеты и активные брони с остатком к оплате.
    const [tickets, reservations] = await Promise.all([
      getMyTickets(req.user._id),
      getMyReservations(req.user._id),
    ]);
    return res.json({ tickets, reservations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load tickets" });
  }
}

export async function purchaseHistory(req, res) {
  try {
    const tickets = await getPurchaseHistory(req.user._id);
    return res.json({ tickets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load purchase history" });
  }
}

export async function ticketDetails(req, res) {
  try {
    const ticketId = String(req.params?.ticketId || "").trim();
    const ticket = await getTicketForUser({
      ticketId,
      user: req.user,
    });
    return res.json({ ticket });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: error?.message || "Ticket not found" });
  }
}

export async function payReservationBalance(req, res) {
  try {
    const orderId = String(req.params?.orderId || "").trim();
    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user._id,
      paymentStatus: "reserved",
    });

    if (!order) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    // Бронь нужно закрыть до дедлайна, обычно за 5 часов до начала события.
    if (order.balanceDueDeadlineAt && new Date(order.balanceDueDeadlineAt).getTime() <= Date.now()) {
      order.paymentStatus = "failed";
      order.paymentFailureReason = "Reservation payment deadline has passed";
      await order.save();
      return res.status(400).json({ message: "Reservation must be fully paid at least 5 hours before the event" });
    }

    if (freedomPayConfigMissing() && isLocalDevelopmentPaymentFallbackEnabled()) {
      const result = await completeReservationAndIssueTickets(order, {
        paymentProvider: "manual",
        paidAt: new Date(),
        paymentFailureReason: "",
      });
      invalidatePublishedEventsCache();
      return res.status(201).json({
        message: "Reservation paid successfully",
        orderId: result.order._id,
        tickets: result.tickets,
      });
    }

    const payment = await createFreedomPayPayment(order);
    if (payment.paymentId) {
      order.freedomPayPaymentId = String(payment.paymentId);
      await order.save();
    }
    invalidatePublishedEventsCache();

    return res.status(201).json({
      message: "Balance payment initialized",
      orderId: order._id,
      paymentUrl: payment.paymentUrl,
      paymentId: payment.paymentId,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Failed to pay reservation balance" });
  }
}

export async function cancelReservation(req, res) {
  try {
    const orderId = String(req.params?.orderId || "").trim();
    const result = await cancelReservationForUser({
      orderId,
      user: req.user,
    });
    invalidatePublishedEventsCache();
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Reservation cancellation failed" });
  }
}

export async function validateTicket(req, res) {
  try {
    const qrToken = String(req.body?.qrToken || "").trim();
    const result = await validateTicketScan({
      qrToken,
      currentUser: req.user,
    });

    if (result.status === "invalid") {
      return res.status(400).json(result);
    }
    if (result.status === "already-used") {
      return res.status(409).json(result);
    }
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ticket validation failed" });
  }
}

export async function refundTicket(req, res) {
  try {
    const ticketId = String(req.params?.ticketId || "").trim();
    const result = await refundTicketForUser({
      ticketId,
      user: req.user,
    });
    invalidatePublishedEventsCache();
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Refund failed" });
  }
}
