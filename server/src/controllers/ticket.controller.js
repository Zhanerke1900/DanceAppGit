import { createFreedomPayPayment } from "../services/freedompay.service.js";
import {
  createPendingTicketOrderForUser,
  getMyTickets,
  markOrderPaidAndIssueTickets,
  refundTicketForUser,
  validateTicketScan,
} from "../services/ticket.service.js";

export async function purchaseTickets(req, res) {
  try {
    const { eventId, eventData, ticketDetails } = req.body || {};
    const order = await createPendingTicketOrderForUser({
      user: req.user,
      eventId,
      eventData,
      ticketDetails,
    });

    if (Number(order.total || 0) <= 0) {
      const result = await markOrderPaidAndIssueTickets(order, {
        paymentProvider: "manual",
        paidAt: new Date(),
      });
      return res.status(201).json({
        message: "Tickets created successfully",
        orderId: result.order._id,
        tickets: result.tickets,
      });
    }

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
    const tickets = await getMyTickets(req.user._id);
    return res.json({ tickets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load tickets" });
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
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Refund failed" });
  }
}
