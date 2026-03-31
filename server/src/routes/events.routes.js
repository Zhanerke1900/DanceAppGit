import express from "express";

import Event from "../models/Event.js";
import Order from "../models/Order.js";

const router = express.Router();

function isUpcomingOrCurrentEvent(dateString = "") {
  const parsed = new Date(`${String(dateString).trim()}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed.getTime() >= Date.now();
}

async function loadActivityUsage(events) {
  const eventIds = events.map((event) => event._id);
  if (!eventIds.length) return new Map();

  const paidOrders = await Order.find({
    event: { $in: eventIds },
    paymentStatus: "paid",
  }).select("event items");

  const usageByEvent = new Map(events.map((event) => [String(event._id), new Map((event.activities || []).map((activity) => [String(activity.id), 0]))]));

  for (const order of paidOrders) {
    const eventKey = String(order.event);
    const event = events.find((item) => String(item._id) === eventKey);
    const usageMap = usageByEvent.get(eventKey) || new Map();

    for (const item of order.items || []) {
      if (item.kind === "full-event-pass") {
        for (const activity of event?.activities || []) {
          const key = String(activity.id);
          usageMap.set(key, (usageMap.get(key) || 0) + Number(item.quantity || 0));
        }
      } else if (item.kind === "activity" && item.activityId) {
        const key = String(item.activityId);
        usageMap.set(key, (usageMap.get(key) || 0) + Number(item.quantity || 0));
      }
    }

    usageByEvent.set(eventKey, usageMap);
  }

  return usageByEvent;
}

function publicPublishedEvent(event, availability = {}) {
  return {
    id: event._id,
    isManagedEvent: true,
    title: event.title,
    category: event.category,
    eventType: event.eventType,
    date: event.date,
    time: event.time,
    city: event.city,
    venue: event.venue,
    address: event.address,
    location: event.location,
    description: event.description,
    longDescription: event.longDescription,
    targetAudience: event.targetAudience,
    highlights: event.highlights || [],
    ageRestriction: event.ageRestriction,
    dressCode: event.dressCode,
    image: event.image,
    price: event.price,
    ticketLimit: Number(event.ticketLimit || 0),
    soldTickets: Number(availability.soldTickets || 0),
    remainingTickets: availability.remainingTickets ?? null,
    soldOut: Boolean(availability.soldOut),
    ticketPricing: event.ticketPricing || {},
    fullPassPrice: event.fullPassPrice,
    fullPassDiscount: event.fullPassDiscount,
    schedule: event.schedule || [],
    activities: (event.activities || []).map((activity) => ({
      ...(activity.toObject ? activity.toObject() : activity),
      ticketLimit: Number(activity.ticketLimit || 0),
      soldTickets: Number(availability.activityUsage?.get(String(activity.id)) || 0),
      remainingTickets: Number(activity.ticketLimit || 0) > 0
        ? Math.max(Number(activity.ticketLimit) - Number(availability.activityUsage?.get(String(activity.id)) || 0), 0)
        : null,
      soldOut: Number(activity.ticketLimit || 0) > 0
        ? Math.max(Number(activity.ticketLimit) - Number(availability.activityUsage?.get(String(activity.id)) || 0), 0) === 0
        : false,
    })),
  };
}

router.get("/published", async (_req, res) => {
  try {
    const allPublishedEvents = await Event.find({ status: "published" }).sort({ createdAt: -1 }).limit(400);
    const events = allPublishedEvents.filter((event) => isUpcomingOrCurrentEvent(event.date));
    const eventIds = events.map((event) => event._id);
    const soldOrders = eventIds.length
      ? await Order.aggregate([
          { $match: { event: { $in: eventIds }, paymentStatus: "paid" } },
          { $group: { _id: "$event", soldTickets: { $sum: "$quantity" } } },
        ])
      : [];

    const soldMap = new Map(soldOrders.map((item) => [String(item._id), Number(item.soldTickets || 0)]));
    const activityUsageByEvent = await loadActivityUsage(events);

    return res.json({
      events: events.map((event) => {
        const soldTickets = soldMap.get(String(event._id)) || 0;
        const hasLimit = Number(event.ticketLimit || 0) > 0;
        const remainingTickets = hasLimit ? Math.max(Number(event.ticketLimit) - soldTickets, 0) : null;

        return publicPublishedEvent(event, {
          soldTickets,
          remainingTickets,
          soldOut: hasLimit ? remainingTickets === 0 : false,
          activityUsage: activityUsageByEvent.get(String(event._id)) || new Map(),
        });
      }),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
