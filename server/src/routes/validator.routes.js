import express from "express";

import Event from "../models/Event.js";
import ValidationLog from "../models/ValidationLog.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validateTicketScan } from "../services/ticket.service.js";

const router = express.Router();

router.use(requireAuth, requireRole("validator"));

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find({ validators: req.user._id, status: "published" }).sort({ date: 1, time: 1 }).limit(200);
    return res.json({
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        time: event.time,
        city: event.city,
        location: event.location,
        image: event.image,
        status: event.status,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/recent-scans", async (req, res) => {
  try {
    const logs = await ValidationLog.find({ validator: req.user._id })
      .populate("ticket", "ticketCode userFullName ticketType")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      logs: logs.map((log) => ({
        id: log._id,
        ticketId: log.ticket,
        eventId: log.event,
        ticketCode: log.ticket?.ticketCode || "",
        ticketHolderName: log.ticket?.userFullName || "",
        ticketType: log.ticket?.ticketType || "",
        eventTitle: log.event?.title || "",
        result: log.result,
        message: log.message,
        createdAt: log.createdAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/scan", async (req, res) => {
  try {
    const { qrToken, eventId } = req.body || {};
    const result = await validateTicketScan({
      qrToken: String(qrToken || "").trim(),
      expectedEventId: String(eventId || "").trim(),
      currentUser: req.user,
    });

    if (result.status === "invalid") {
      return res.status(400).json(result);
    }
    if (result.status === "another-event") {
      return res.status(409).json(result);
    }
    if (result.status === "already-used") {
      return res.status(409).json(result);
    }
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Scan failed" });
  }
});

export default router;
