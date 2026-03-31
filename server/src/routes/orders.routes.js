import express from "express";

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { eventId, ticketDetails } = req.body || {};

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status !== "published") {
      return res.status(404).json({ message: "Published event not found" });
    }

    const items = Array.isArray(ticketDetails?.ticketTypes) ? ticketDetails.ticketTypes : [];
    if (items.length === 0) {
      return res.status(400).json({ message: "At least one ticket item is required" });
    }

    const normalizedItems = items
      .map((item) => {
        const name = String(item?.name || "").trim();
        const quantity = Number(item?.quantity || 0);
        const price = Number(item?.price || 0);
        const lowerName = name.toLowerCase();

        return {
          name,
          activityId: String(item?.activityId || "").trim(),
          quantity,
          price,
          kind: lowerName === "full event pass"
            ? "full-event-pass"
            : lowerName === "event ticket"
              ? "event-ticket"
              : "activity",
        };
      })
      .filter((item) => item.name && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: "Valid ticket items are required" });
    }

    const quantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    if (Number(event.ticketLimit || 0) > 0) {
      const paidOrders = await Order.find({ event: event._id, paymentStatus: "paid" }).select("quantity");
      const soldTickets = paidOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
      const remainingTickets = Math.max(Number(event.ticketLimit) - soldTickets, 0);
      if (remainingTickets <= 0) {
        return res.status(400).json({ message: "This event is sold out" });
      }
      if (quantity > remainingTickets) {
        return res.status(400).json({ message: `Only ${remainingTickets} tickets left for this event` });
      }
    }
    const subtotal = Number(ticketDetails?.subtotal || normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const serviceFee = Number(ticketDetails?.serviceFee || 0);
    const total = Number(ticketDetails?.total || subtotal + serviceFee);

    const order = await Order.create({
      buyer: req.user._id,
      buyerName: req.user.fullName,
      buyerEmail: req.user.email,
      event: event._id,
      organizer: event.organizer,
      eventSnapshot: {
        title: event.title,
        category: event.category,
        eventType: event.eventType,
        date: event.date,
        time: event.time,
        location: event.location,
        city: event.city,
        image: event.image,
      },
      items: normalizedItems,
      quantity,
      subtotal,
      serviceFee,
      total,
      paymentStatus: "paid",
      checkInStatus: "not-checked-in",
    });

    return res.status(201).json({
      message: "Order created",
      order: {
        id: order._id,
        quantity: order.quantity,
        total: order.total,
        paymentStatus: order.paymentStatus,
        checkInStatus: order.checkInStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
