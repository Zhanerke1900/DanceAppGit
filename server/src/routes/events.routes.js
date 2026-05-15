import express from "express";

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import { archivePastPublishedEvents, getEventStartAt, isEventPast } from "../utils/eventDates.js";
import { getLowestDisplayPrice } from "../utils/eventPricing.js";

const router = express.Router();
const PUBLISHED_EVENTS_CACHE_MS = Number(process.env.PUBLISHED_EVENTS_CACHE_MS || 15000);
let publishedEventsCache = { expiresAt: 0, payload: null };
let publishedEventsInFlight = null;

export function invalidatePublishedEventsCache() {
  publishedEventsCache = { expiresAt: 0, payload: null };
}

function hasDisplayImage(event) {
  return Boolean(String(event?.image || "").trim());
}

function isSeededMarketplaceEvent(event) {
  return String(event?.seedKey || "").startsWith("marketplace-");
}

function getTimestamp(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function sortPublishedEvents(a, b) {
  const aIsSeed = isSeededMarketplaceEvent(a);
  const bIsSeed = isSeededMarketplaceEvent(b);
  if (aIsSeed !== bIsSeed) return aIsSeed ? 1 : -1;

  const aStart = getEventStartAt(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bStart = getEventStartAt(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (aStart !== bStart) return aStart - bStart;

  return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
}

function activeInventoryQuery(eventIds) {
  return {
    event: { $in: eventIds },
    $or: [
      { paymentStatus: "paid" },
      { paymentStatus: "reserved", $or: [{ balanceDueDeadlineAt: null }, { balanceDueDeadlineAt: { $gt: new Date() } }] },
    ],
  };
}

async function loadAvailability(events) {
  const eventIds = events.map((event) => event._id);
  const soldMap = new Map();
  const activityUsageByEvent = new Map(
    events.map((event) => [String(event._id), new Map((event.activities || []).map((activity) => [String(activity.id), 0]))])
  );
  if (!eventIds.length) return { soldMap, activityUsageByEvent };

  const eventsById = new Map(events.map((event) => [String(event._id), event]));
  const inventoryOrders = await Order.find(activeInventoryQuery(eventIds)).select("event items quantity").lean();

  for (const order of inventoryOrders) {
    const eventKey = String(order.event);
    const event = eventsById.get(eventKey);
    const usageMap = activityUsageByEvent.get(eventKey) || new Map();
    soldMap.set(eventKey, (soldMap.get(eventKey) || 0) + Number(order.quantity || 0));

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

    activityUsageByEvent.set(eventKey, usageMap);
  }

  return { soldMap, activityUsageByEvent };
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
    translations: event.translations || {},
    ageRestriction: event.ageRestriction,
    dressCode: event.dressCode,
    image: event.image,
    price: getLowestDisplayPrice(event),
    ticketLimit: Number(event.ticketLimit || 0),
    soldTickets: Number(availability.soldTickets || 0),
    remainingTickets: availability.remainingTickets ?? null,
    soldOut: Boolean(availability.soldOut),
    ticketPricing: event.ticketPricing || {},
    fullPassPrice: event.fullPassPrice,
    fullPassDiscount: event.fullPassDiscount,
    schedule: event.schedule || [],
    activities: (event.activities || []).map((activity) => ({
      ...activity,
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

async function buildPublishedEventsPayload() {
  const archiveResult = await archivePastPublishedEvents();
  if (archiveResult.archivedCount > 0) invalidatePublishedEventsCache();

  const allPublishedEvents = await Event.find({ status: "published", image: { $exists: true, $nin: ["", null] } })
    .sort({ createdAt: -1 })
    .limit(400)
    .lean();
  const events = allPublishedEvents.filter(hasDisplayImage).filter((event) => !isEventPast(event)).sort(sortPublishedEvents);
  const { soldMap, activityUsageByEvent } = await loadAvailability(events);

  return {
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
  };
}

router.get("/published", async (req, res) => {
  try {
    const skipCache = String(req.query.fresh || "") === "1";
    if (!skipCache && publishedEventsCache.payload && publishedEventsCache.expiresAt > Date.now()) {
      return res.set("X-Cache", "HIT").json(publishedEventsCache.payload);
    }

    if (!skipCache && publishedEventsInFlight) {
      const payload = await publishedEventsInFlight;
      return res.set("X-Cache", "INFLIGHT").json(payload);
    }

    publishedEventsInFlight = buildPublishedEventsPayload();
    const payload = await publishedEventsInFlight;
    publishedEventsCache = {
      expiresAt: Date.now() + PUBLISHED_EVENTS_CACHE_MS,
      payload,
    };
    return res.set("X-Cache", "MISS").json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  } finally {
    publishedEventsInFlight = null;
  }
});

export default router;
