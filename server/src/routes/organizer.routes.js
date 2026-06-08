import express from "express";
import bcrypt from "bcryptjs";

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { archivePastPublishedEvents, isEventPast } from "../utils/eventDates.js";
import { getLowestDisplayPrice } from "../utils/eventPricing.js";
import { makeCode, makeToken, hashToken } from "../utils/tokens.js";
import { sendValidatorInviteEmail } from "../utils/sendEmails.js";
import { normalizeEmailLanguage } from "../utils/emailLocale.js";
import { queueEventUpdateNotifications } from "../services/notification.service.js";
import { cancelEventOrdersForOrganizer } from "../services/ticket.service.js";
import { invalidatePublishedEventsCache } from "./events.routes.js";

const router = express.Router();
const EVENT_TRANSLATION_LANGUAGES = ["en", "ru", "kk"];
const ORGANIZER_SERVICE_FEE_RATE = 0.15;

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function organizerNetAmount(value) {
  return money(Number(value || 0) * (1 - ORGANIZER_SERVICE_FEE_RATE));
}

function requireOrganizer(req, res, next) {
  // Organizer routes доступны только пользователю, чья заявка уже approved.
  if (!req.user || !(req.user.isOrganizer || req.user.organizerStatus === "approved")) {
    return res.status(403).json({ message: "Organizer access required" });
  }
  next();
}

function organizerCanSendRequests(user) {
  return String(user?.organizerAccessStatus || "active") !== "deactivated";
}

// Сначала проверяем login, потом organizer-доступ для всех endpoints ниже.
router.use(requireAuth, requireOrganizer);

function publicValidator(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    assignedEventIds: (user.validatorAssignedEventIds || []).map((item) => String(item)),
    createdAt: user.createdAt,
  };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeStringList(value) {
  return Array.isArray(value) ? value.map((item) => normalizeText(item)).filter(Boolean) : [];
}

function normalizeEventTranslations(value = {}) {
  if (!value || typeof value !== "object") return {};

  const normalized = {};
  for (const language of EVENT_TRANSLATION_LANGUAGES) {
    const item = value[language];
    if (!item || typeof item !== "object") continue;

    const translation = {
      title: normalizeText(item.title),
      venue: normalizeText(item.venue),
      address: normalizeText(item.address),
      location: normalizeText(item.location),
      description: normalizeText(item.description),
      longDescription: normalizeText(item.longDescription),
      targetAudience: normalizeText(item.targetAudience),
      highlights: normalizeStringList(item.highlights),
      schedule: Array.isArray(item.schedule)
        ? item.schedule.map((scheduleItem) => ({
            title: normalizeText(scheduleItem?.title),
            description: normalizeText(scheduleItem?.description),
            location: normalizeText(scheduleItem?.location),
          }))
        : [],
      activities: Array.isArray(item.activities)
        ? item.activities.map((activity) => ({
            name: normalizeText(activity?.name),
            description: normalizeText(activity?.description),
            location: normalizeText(activity?.location),
            organizer: activity?.organizer
              ? {
                  name: normalizeText(activity.organizer?.name),
                  role: normalizeText(activity.organizer?.role),
                }
              : undefined,
          }))
        : [],
    };

    if (
      translation.title ||
      translation.venue ||
      translation.address ||
      translation.location ||
      translation.description ||
      translation.longDescription ||
      translation.targetAudience ||
      translation.highlights.length ||
      translation.schedule.length ||
      translation.activities.length
    ) {
      normalized[language] = translation;
    }
  }

  return normalized;
}

function hasEventImage(value) {
  return Boolean(normalizeText(value));
}

function normalizeHighlights(value) {
  return Array.isArray(value) ? value.map((item) => normalizeText(item)).filter(Boolean) : [];
}

function normalizeSchedule(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
        time: normalizeText(item?.time),
        title: normalizeText(item?.title),
        description: normalizeText(item?.description),
        location: normalizeText(item?.location),
      }))
    : [];
}

function normalizeActivities(value) {
  return Array.isArray(value)
    ? value.map((item, index) => ({
        id: normalizeText(item?.id) || `activity-${index + 1}`,
        name: normalizeText(item?.name),
        type: normalizeText(item?.type) || "Masterclass",
        time: normalizeText(item?.time),
        description: normalizeText(item?.description),
        instructor: normalizeText(item?.instructor),
        price: Number(item?.price || 0),
        ticketLimit: Number(item?.ticketLimit || 0),
        organizer: item?.organizer
          ? {
              name: normalizeText(item.organizer?.name),
              role: normalizeText(item.organizer?.role) || "Host",
            }
          : undefined,
        location: normalizeText(item?.location),
      }))
    : [];
}

function normalizeEventPayload(payload = {}) {
  // Приводим данные события к одному формату перед сохранением в MongoDB.
  const normalized = {
    status: normalizeText(payload.status),
    title: normalizeText(payload.title),
    eventType: normalizeText(payload.eventType),
    category: normalizeText(payload.category),
    date: normalizeText(payload.date),
    time: normalizeText(payload.time),
    city: normalizeText(payload.city),
    venue: normalizeText(payload.venue),
    address: normalizeText(payload.address),
    location: normalizeText(payload.location),
    description: normalizeText(payload.description),
    longDescription: normalizeText(payload.longDescription),
    targetAudience: normalizeText(payload.targetAudience),
    highlights: normalizeHighlights(payload.highlights),
    ageRestriction: normalizeText(payload.ageRestriction),
    dressCode: normalizeText(payload.dressCode),
    image: normalizeText(payload.image),
    price: normalizeText(payload.price),
    ticketLimit: Number(payload.ticketLimit || 0),
    ticketPricing: {
      generalAdmission: normalizeText(payload.ticketPricing?.generalAdmission),
      fullEventPass: normalizeText(payload.ticketPricing?.fullEventPass),
      fullEventPassDiscount: normalizeText(payload.ticketPricing?.fullEventPassDiscount),
    },
    fullPassPrice: Number(payload.fullPassPrice || 0),
    fullPassDiscount: Number(payload.fullPassDiscount || 0),
    schedule: normalizeSchedule(payload.schedule),
    activities: normalizeActivities(payload.activities),
    contentLanguage: normalizeEmailLanguage(payload.contentLanguage),
    translations: normalizeEventTranslations(payload.translations),
  };

  normalized.price = getLowestDisplayPrice(normalized);
  return normalized;
}

function applyEventData(event, data) {
  // Общая функция обновления Event, чтобы create/edit не расходились по полям.
  event.title = data.title;
  event.eventType = data.eventType;
  event.category = data.category;
  event.date = data.date;
  event.time = data.time;
  event.city = data.city;
  event.venue = data.venue;
  event.address = data.address;
  event.location = data.location;
  event.description = data.description;
  event.longDescription = data.longDescription;
  event.targetAudience = data.targetAudience;
  event.highlights = data.highlights;
  event.ageRestriction = data.ageRestriction;
  event.dressCode = data.dressCode;
  event.image = data.image;
  event.price = data.price;
  event.ticketLimit = data.ticketLimit;
  event.ticketPricing = data.ticketPricing;
  event.fullPassPrice = data.fullPassPrice;
  event.fullPassDiscount = data.fullPassDiscount;
  event.schedule = data.schedule;
  event.activities = data.activities;
  event.translations = {
    ...(event.translations || {}),
    ...(data.translations || {}),
  };
}

function snapshotEventData(event) {
  // Snapshot хранит старую published версию, если organizer меняет важные данные события.
  return {
    title: event.title,
    eventType: event.eventType,
    category: event.category,
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
    ticketPricing: {
      generalAdmission: event.ticketPricing?.generalAdmission || "",
      fullEventPass: event.ticketPricing?.fullEventPass || "",
      fullEventPassDiscount: event.ticketPricing?.fullEventPassDiscount || "",
    },
    fullPassPrice: Number(event.fullPassPrice || 0),
    fullPassDiscount: Number(event.fullPassDiscount || 0),
    schedule: normalizeSchedule(event.schedule),
    activities: normalizeActivities(event.activities),
  };
}

function hasCriticalPublishedChanges(currentEvent, nextData) {
  // Важные изменения published event должны пройти повторную проверку admin.
  const currentSnapshot = snapshotEventData(currentEvent);
  const criticalKeys = [
    "title",
    "eventType",
    "category",
    "date",
    "time",
    "city",
    "venue",
    "address",
    "location",
    "price",
    "fullPassPrice",
    "fullPassDiscount",
  ];

  const hasCriticalScalarChange = criticalKeys.some((key) => currentSnapshot[key] !== nextData[key]);
  if (hasCriticalScalarChange) return true;

  if (
    currentSnapshot.ticketPricing.generalAdmission !== nextData.ticketPricing.generalAdmission ||
    currentSnapshot.ticketPricing.fullEventPass !== nextData.ticketPricing.fullEventPass ||
    currentSnapshot.ticketPricing.fullEventPassDiscount !== nextData.ticketPricing.fullEventPassDiscount
  ) {
    return true;
  }

  return false;
}

function hasPublishedSnapshotChanges(currentEvent, previousSnapshot) {
  if (!previousSnapshot) return false;
  return JSON.stringify(snapshotEventData(currentEvent)) !== JSON.stringify(previousSnapshot);
}

function publicOrganizerEvent(event) {
  return {
    id: event._id,
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
    price: event.price,
    ticketLimit: Number(event.ticketLimit || 0),
    ticketPricing: event.ticketPricing || {},
    fullPassPrice: event.fullPassPrice,
    fullPassDiscount: event.fullPassDiscount,
    schedule: event.schedule || [],
    activities: event.activities || [],
    status: event.status,
    validators: (event.validators || []).map((item) => String(item)),
    createdAt: event.createdAt,
    isManagedEvent: true,
  };
}

async function loadOrganizerEventAvailability(events) {
  // Для кабинета organizer считаем sold/remaining tickets по его событиям.
  const eventIds = events.map((event) => event._id);
  if (!eventIds.length) return new Map();

  const inventoryOrders = await Order.aggregate([
    {
      $match: {
        event: { $in: eventIds },
        $or: [
          { paymentStatus: "paid" },
          { paymentStatus: "reserved", $or: [{ balanceDueDeadlineAt: null }, { balanceDueDeadlineAt: { $gt: new Date() } }] },
        ],
      },
    },
    { $group: { _id: "$event", soldTickets: { $sum: "$quantity" } } },
  ]);

  return new Map(inventoryOrders.map((item) => [String(item._id), Number(item.soldTickets || 0)]));
}

router.get("/events", async (req, res) => {
  try {
    await archivePastPublishedEvents({ organizer: req.user._id });
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 }).limit(200).lean();
    const soldMap = await loadOrganizerEventAvailability(events);
    return res.json({
      events: events.map((event) => {
        const soldTickets = soldMap.get(String(event._id)) || 0;
        const hasLimit = Number(event.ticketLimit || 0) > 0;
        const remainingTickets = hasLimit ? Math.max(Number(event.ticketLimit) - soldTickets, 0) : null;
        return {
          ...publicOrganizerEvent(event),
          soldTickets,
          remainingTickets,
          soldOut: hasLimit ? remainingTickets === 0 : false,
        };
      }),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      organizer: req.user._id,
      paymentStatus: { $in: ["paid", "reserved"] },
    }).sort({ createdAt: -1 }).limit(300).lean();
    const orderIds = orders.map((order) => order._id);
    const usedTickets = orderIds.length
      ? await Ticket.find({
          order: { $in: orderIds },
          status: "used",
        }).select("order").lean()
      : [];

    const checkedInOrderIds = new Set(usedTickets.map((ticket) => String(ticket.order)));

    return res.json({
      orders: orders.map((order) => ({
        id: order._id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        eventTitle: order.eventSnapshot?.title || "",
        eventId: order.event,
        ticketType: order.items.map((item) => item.name).join(", "),
        quantity: order.quantity,
        total: order.total,
        amountPaid: order.amountPaid,
        balanceDue: order.balanceDue,
        paymentType: order.paymentType,
        balanceDueDeadlineAt: order.balanceDueDeadlineAt,
        purchaseDate: order.createdAt,
        paymentStatus: order.paymentStatus,
        checkInStatus: order.paymentStatus === "reserved"
          ? "no-ticket-yet"
          : checkedInOrderIds.has(String(order._id))
            ? "checked-in"
            : order.checkInStatus,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    await archivePastPublishedEvents({ organizer: req.user._id });
    const [orders, events, refundedTicketStats, refundedReservationStats] = await Promise.all([
      Order.find({ organizer: req.user._id, paymentStatus: { $in: ["paid", "reserved"] } }).sort({ createdAt: -1 }).limit(1000).lean(),
      Event.find({ organizer: req.user._id }).limit(500).lean(),
      Ticket.aggregate([
        { $match: { organizer: req.user._id, status: "cancelled" } },
        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            organizer: req.user._id,
            paymentStatus: "refunded",
            $or: [{ ticketsIssuedAt: null }, { ticketsIssuedAt: { $exists: false } }],
          },
        },
        { $unwind: "$paymentTransactions" },
        {
          $match: {
            "paymentTransactions.type": "refund",
            "paymentTransactions.status": "success",
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: "$paymentTransactions.amount" },
          },
        },
      ]),
    ]);

    const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
    const reservedOrders = orders.filter((order) => order.paymentStatus === "reserved");
    const totalRevenue = orders.reduce((sum, order) => sum + organizerNetAmount(order.amountPaid || order.total || 0), 0);
    const ticketsSold = paidOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
    const reservedTickets = reservedOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
    const outstandingBalance = reservedOrders.reduce((sum, order) => sum + organizerNetAmount(order.balanceDue || 0), 0);
    const ordersCount = orders.length;
    const reservationsCount = reservedOrders.length;
    const ticketRefunds = refundedTicketStats[0] || { count: 0, amount: 0 };
    const reservationRefunds = refundedReservationStats[0] || { count: 0, amount: 0 };
    const refundsCount = Number(ticketRefunds.count || 0) + Number(reservationRefunds.count || 0);
    const refundedAmount = Number(ticketRefunds.amount || 0) + Number(reservationRefunds.amount || 0);

    const topEventsMap = new Map();
    for (const order of orders) {
      const key = String(order.event);
      const current = topEventsMap.get(key) || {
        eventId: key,
        title: order.eventSnapshot?.title || "Event",
        orders: 0,
        ticketsSold: 0,
        reservedTickets: 0,
        revenue: 0,
      };
      current.orders += 1;
      if (order.paymentStatus === "paid") current.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === "reserved") current.reservedTickets += Number(order.quantity || 0);
      current.revenue += organizerNetAmount(order.amountPaid || order.total || 0);
      topEventsMap.set(key, current);
    }

    const salesByDayMap = new Map();
    for (const order of orders) {
      const dayKey = order.createdAt.toISOString().slice(0, 10);
      const current = salesByDayMap.get(dayKey) || { date: dayKey, revenue: 0, orders: 0, ticketsSold: 0, reservations: 0 };
      current.revenue += organizerNetAmount(order.amountPaid || order.total || 0);
      current.orders += 1;
      if (order.paymentStatus === "paid") current.ticketsSold += Number(order.quantity || 0);
      if (order.paymentStatus === "reserved") current.reservations += 1;
      salesByDayMap.set(dayKey, current);
    }

    const publishedEvents = events.filter((event) => event.status === "published").length;
    const pendingEvents = events.filter((event) => ["pending", "pending-update-review"].includes(event.status)).length;

    let fullEventPassTickets = 0;
    let activityTickets = 0;
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        if (item.kind === "full-event-pass") fullEventPassTickets += Number(item.quantity || 0);
        if (item.kind === "activity") activityTickets += Number(item.quantity || 0);
      }
    }

    const topEvents = Array.from(topEventsMap.values()).sort((a, b) => b.revenue - a.revenue);

    return res.json({
      totalRevenue,
      ticketsSold,
      reservedTickets,
      reservationsCount,
      outstandingBalance,
      ordersCount,
      averageOrderValue: ordersCount ? totalRevenue / ordersCount : 0,
      refundsCount,
      refundedAmount,
      topEvents: topEvents.slice(0, 5),
      salesByDay: Array.from(salesByDayMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      eventStatuses: {
        published: publishedEvents,
        pending: pendingEvents,
      },
      specialPrograms: {
        fullEventPassTickets,
        activityTickets,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/validators", async (req, res) => {
  try {
    const validators = await User.find({
      role: "validator",
      validatorOwner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({
      validators: validators.map(publicValidator),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/validators", async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};
    const cleanName = String(fullName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (cleanName.length < 2) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!cleanEmail.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (cleanPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({
        message: "This email already belongs to an existing user. Please choose an email that is not already registered.",
        code: "EMAIL_ALREADY_REGISTERED",
      });
    }

    const token = makeToken();
    const code = makeCode();
    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    const validatorLanguage = normalizeEmailLanguage(req.body?.language || req.user.language);
    // Organizer создает отдельный validator account и привязывает его к себе через validatorOwner.
    const validator = await User.create({
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
      emailVerified: false,
      role: "validator",
      language: validatorLanguage,
      validatorOwner: req.user._id,
      verifyTokenHash: hashToken(token),
      verifyCodeHash: hashToken(code),
      verifyExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendValidatorInviteEmail({
      email: cleanEmail,
      fullName: cleanName,
      token,
      code,
      organizerName: req.user.fullName,
      language: validatorLanguage,
    });

    return res.status(201).json({
      message: "Validator account created. Activation email sent.",
      validator: publicValidator(validator),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/assign-validator", async (req, res) => {
  try {
    const { validatorId } = req.body || {};
    const [event, validator] = await Promise.all([
      Event.findOne({ _id: req.params.id, organizer: req.user._id }),
      User.findOne({ _id: validatorId, role: "validator", validatorOwner: req.user._id }),
    ]);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!validator) return res.status(404).json({ message: "Validator not found" });

    // Связь хранится с двух сторон: event.validators и validator.validatorAssignedEventIds.
    if (!event.validators.some((item) => String(item) === String(validator._id))) {
      event.validators.push(validator._id);
    }
    if (!(validator.validatorAssignedEventIds || []).some((item) => String(item) === String(event._id))) {
      validator.validatorAssignedEventIds = [...(validator.validatorAssignedEventIds || []), event._id];
    }

    await event.save();
    await validator.save();

    return res.json({
      message: "Validator assigned",
      validator: publicValidator(validator),
      event: {
        id: event._id,
        validators: (event.validators || []).map((item) => String(item)),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/unassign-validator", async (req, res) => {
  try {
    const { validatorId } = req.body || {};
    const [event, validator] = await Promise.all([
      Event.findOne({ _id: req.params.id, organizer: req.user._id }),
      User.findOne({ _id: validatorId, role: "validator", validatorOwner: req.user._id }),
    ]);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!validator) return res.status(404).json({ message: "Validator not found" });

    event.validators = (event.validators || []).filter((item) => String(item) !== String(validator._id));
    validator.validatorAssignedEventIds = (validator.validatorAssignedEventIds || []).filter(
      (item) => String(item) !== String(event._id)
    );

    await event.save();
    await validator.save();

    return res.json({
      message: "Validator unassigned",
      validator: publicValidator(validator),
      event: {
        id: event._id,
        validators: (event.validators || []).map((item) => String(item)),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const payload = normalizeEventPayload(req.body || {});
    const isDraft = payload.status === "draft";

    if (!isDraft && !organizerCanSendRequests(req.user)) {
      return res.status(403).json({ message: "Organizer account is deactivated. New moderation requests are disabled." });
    }
    if (!isDraft && !hasEventImage(payload.image)) {
      return res.status(400).json({ message: "Event poster is required before publishing." });
    }

    // Draft сохраняется без модерации, а обычная отправка идет в status pending для admin review.
    const event = new Event({
      organizer: req.user._id,
      submittedByEmail: req.user.email,
      submittedByName: req.user.fullName,
      title: payload.title,
      eventType: payload.eventType,
      category: payload.category,
      date: payload.date,
      time: payload.time,
      city: payload.city,
      venue: payload.venue,
      address: payload.address,
      location: payload.location,
      description: payload.description,
      longDescription: payload.longDescription,
      targetAudience: payload.targetAudience,
      highlights: payload.highlights,
      translations: payload.translations,
      ageRestriction: payload.ageRestriction,
      dressCode: payload.dressCode,
      image: payload.image,
      price: payload.price,
      ticketLimit: payload.ticketLimit,
      ticketPricing: payload.ticketPricing,
      fullPassPrice: payload.fullPassPrice,
      fullPassDiscount: payload.fullPassDiscount,
      schedule: payload.schedule,
      activities: payload.activities,
      status: isDraft ? "draft" : "pending",
    });

    await event.save({ validateBeforeSave: !isDraft });

    return res.status(201).json({
      message: isDraft ? "Draft saved" : "Event sent for moderation",
      event: publicOrganizerEvent(event),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const previousPublishedSnapshot = event.status === "published" ? snapshotEventData(event) : null;
    const payload = normalizeEventPayload(req.body || {});
    const requestedStatus = String(req.body?.status || "").trim();
    const isPublishedEvent = event.status === "published";
    const hasCriticalChanges = isPublishedEvent ? hasCriticalPublishedChanges(event, payload) : false;
    const willStayDraft = !isPublishedEvent && requestedStatus === "draft";

    if (!willStayDraft && !hasEventImage(payload.image)) {
      return res.status(400).json({ message: "Event poster is required before publishing." });
    }

    if (isPublishedEvent && hasCriticalChanges && !organizerCanSendRequests(req.user)) {
      return res.status(403).json({ message: "Organizer account is deactivated. New moderation requests are disabled." });
    }

    // Published event с критичными изменениями не меняется сразу на сайте, а уходит на admin review.
    if (isPublishedEvent && hasCriticalChanges) {
      event.pendingUpdateSnapshot = snapshotEventData(event);
      applyEventData(event, payload);
      event.status = "pending-update-review";
      await event.save();

      return res.json({
        message: "Critical changes sent for update review",
        event: publicOrganizerEvent(event),
      });
    }

    applyEventData(event, payload);

    if (!isPublishedEvent) {
      if (requestedStatus === "pending" && !organizerCanSendRequests(req.user)) {
        return res.status(403).json({ message: "Organizer account is deactivated. New moderation requests are disabled." });
      }
      if (requestedStatus === "draft") {
        event.status = "draft";
      } else if (requestedStatus === "pending" || event.status === "pending-update-review") {
        event.status = "pending";
      }
    }

    await event.save({ validateBeforeSave: event.status === "draft" ? false : true });
    if (isPublishedEvent && event.status === "published" && hasPublishedSnapshotChanges(event, previousPublishedSnapshot)) {
      queueEventUpdateNotifications(event, previousPublishedSnapshot);
    }

    return res.json({
      message: isPublishedEvent ? "Changes saved" : "Event changes saved",
      event: publicOrganizerEvent(event),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/change-to-draft", async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status !== "pending") {
      return res.status(400).json({ message: "Only pending events can be moved back to draft" });
    }

    event.status = "draft";
    await event.save({ validateBeforeSave: false });

    return res.json({
      message: "Event moved to draft",
      event: publicOrganizerEvent(event),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Draft/pending можно удалить полностью, потому что они еще не продавались публично.
    if (["draft", "pending"].includes(event.status)) {
      await Event.deleteOne({ _id: event._id });

      return res.json({
        message: "Event deleted",
        id: String(event._id),
      });
    }

    // Published event не удаляем: архивируем, отменяем заказы и запускаем возвраты.
    if (event.status === "published") {
      if (isEventPast(event)) {
        return res.status(400).json({ message: "Past published events cannot be cancelled from this action" });
      }

      const refundSummary = await cancelEventOrdersForOrganizer({
        event,
        cancelledBy: req.user,
      });

      event.status = "archived";
      event.cancelledAt = new Date();
      event.cancelledBy = req.user._id;
      event.cancellationRefundSummary = refundSummary;
      await event.save({ validateBeforeSave: false });
      invalidatePublishedEventsCache();

      return res.json({
        message: "Event cancelled and ticket refunds requested",
        id: String(event._id),
        event: publicOrganizerEvent(event),
        refundSummary,
      });
    }

    return res.status(400).json({ message: "Only draft, pending, or active published events can be deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: e?.message || "Server error",
      refundSummary: e?.refundSummary,
    });
  }
});

export default router;
