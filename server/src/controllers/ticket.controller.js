import { getMyTickets, purchaseTicketsForUser, refundTicketForUser, validateTicketScan } from "../services/ticket.service.js";

export async function purchaseTickets(req, res) {
  try {
    const { eventId, eventData, ticketDetails } = req.body || {};
    const result = await purchaseTicketsForUser({
      user: req.user,
      eventId,
      eventData,
      ticketDetails,
    });
    return res.status(201).json({
      message: "Tickets created successfully",
      orderId: result.order._id,
      tickets: result.tickets,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error?.message || "Failed to create tickets" });
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
