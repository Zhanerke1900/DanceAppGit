import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getUserRole, requireRole } from "../middleware/role.middleware.js";
import { getLowestDisplayPrice } from "../utils/eventPricing.js";
import { queueEventUpdateNotifications } from "../services/notification.service.js";

const router = express.Router();
const ADMIN_ANALYTICS_SERVICE_FEE_RATE = 0.15;

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function organizerNetAmount(value) {
  return money(Number(value || 0) * (1 - ADMIN_ANALYTICS_SERVICE_FEE_RATE));
}

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function hasEventImage(event) {
  return Boolean(String(event?.image || "").trim());
}

function publicAdminEvent(event) {
  return {
    id: event._id,
    title: event.title,
    city: event.city,
    category: event.category,
    date: event.date,
    time: event.time,
    status: event.status,
    submittedBy: event.submittedByEmail,
    description: event.description,
    longDescription: event.longDescription,
    location: event.location,
    address: event.address,
    eventType: event.eventType,
    image: event.image,
    price: getLowestDisplayPrice(event),
  };
}

// Все endpoints ниже доступны только авторизованному admin.
router.use(requireAuth, requireRole("admin"));

router.get("/overview", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const organizerFilter = {
      $or: [
        { role: "organizer" },
        { isOrganizer: true },
        { organizerStatus: "approved" },
      ],
    };

    // Dashboard админки собирает счетчики параллельно, чтобы не ждать каждый запрос по очереди.
    const [
      totalUsers,
      totalOrganizers,
      pendingOrganizerApplications,
      publishedEvents,
      pendingEvents,
      usersAddedThisMonth,
      organizersAddedThisMonth,
      eventsAddedThisMonth,
      usersByMonth,
      organizersByMonth,
      eventsByMonth,
      activeReservations,
      paidAndReservedOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments(organizerFilter),
      User.countDocuments({ organizerStatus: "pending" }),
      Event.countDocuments({ status: "published" }),
      Event.countDocuments({ status: { $in: ["pending", "pending-update-review"] } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ ...organizerFilter, createdAt: { $gte: startOfMonth } }),
      Event.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.aggregate([
        { $match: { createdAt: { $gte: startOfWindow } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      User.aggregate([
        { $match: { ...organizerFilter, createdAt: { $gte: startOfWindow } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Event.aggregate([
        { $match: { createdAt: { $gte: startOfWindow } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.countDocuments({ paymentStatus: "reserved" }),
      Order.find({ paymentStatus: { $in: ["paid", "reserved"] } }).select("paymentStatus amountPaid total balanceDue").lean(),
    ]);

    const collectedRevenue = paidAndReservedOrders.reduce(
      (sum, order) => sum + Number(order.amountPaid || order.total || 0),
      0
    );
    const outstandingBalance = paidAndReservedOrders
      .filter((order) => order.paymentStatus === "reserved")
      .reduce((sum, order) => sum + Number(order.balanceDue || 0), 0);

    const monthLabels = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
      };
    });

    const toMap = (items) =>
      new Map(items.map((item) => [`${item._id.year}-${item._id.month}`, item.count]));

    const usersMap = toMap(usersByMonth);
    const organizersMap = toMap(organizersByMonth);
    const eventsMap = toMap(eventsByMonth);

    const monthlyGrowth = monthLabels.map(({ key, label }) => ({
      label,
      users: usersMap.get(key) || 0,
      organizers: organizersMap.get(key) || 0,
      events: eventsMap.get(key) || 0,
    }));

    return res.json({
      totalUsers,
      totalOrganizers,
      pendingOrganizerApplications,
      publishedEvents,
      pendingEvents,
      usersAddedThisMonth,
      organizersAddedThisMonth,
      eventsAddedThisMonth,
      activeReservations,
      collectedRevenue,
      outstandingBalance,
      monthlyGrowth,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const organizerFilter = {
      $or: [
        { role: "organizer" },
        { isOrganizer: true },
        { organizerStatus: "approved" },
      ],
    };

    const [organizers, events, orders, refundedTicketStats, refundedReservationStats] = await Promise.all([
      User.find(organizerFilter)
        .select("fullName email role isOrganizer organizerStatus organizerAccessStatus organizerApplication createdAt")
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean(),
      Event.find({})
        .select("organizer status title")
        .limit(10000)
        .lean(),
      Order.find({ paymentStatus: { $in: ["paid", "reserved"] } })
        .select("buyerName buyerEmail event organizer eventSnapshot items quantity total amountPaid balanceDue paymentType paymentStatus checkInStatus balanceDueDeadlineAt createdAt")
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean(),
      Ticket.aggregate([
        { $match: { status: "cancelled" } },
        { $group: { _id: "$organizer", count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } },
      ]),
      Order.aggregate([
        {
          $match: {
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
            _id: "$organizer",
            count: { $sum: 1 },
            amount: { $sum: "$paymentTransactions.amount" },
          },
        },
      ]),
    ]);

    const organizerInfoMap = new Map(
      organizers.map((organizer) => {
        const id = String(organizer._id);
        return [id, {
          organizerId: id,
          organizerName: organizer.fullName || organizer.email || "Organizer",
          organizerEmail: organizer.email || "",
          organizationName: organizer.organizerApplication?.organizationName || "",
          organizerStatus: organizer.organizerStatus || "none",
          organizerAccessStatus: organizer.organizerAccessStatus || "active",
        }];
      })
    );

    const getOrganizerInfo = (organizerId) => {
      const id = String(organizerId || "unknown");
      return organizerInfoMap.get(id) || {
        organizerId: id,
        organizerName: "Unknown organizer",
        organizerEmail: "",
        organizationName: "",
        organizerStatus: "none",
        organizerAccessStatus: "active",
      };
    };

    const eventStatsMap = new Map();
    for (const event of events) {
      const key = String(event.organizer || "unknown");
      const current = eventStatsMap.get(key) || {
        eventsCount: 0,
        publishedEvents: 0,
        pendingEvents: 0,
        draftEvents: 0,
        archivedEvents: 0,
      };
      current.eventsCount += 1;
      if (event.status === "published") current.publishedEvents += 1;
      if (["pending", "pending-update-review"].includes(event.status)) current.pendingEvents += 1;
      if (event.status === "draft") current.draftEvents += 1;
      if (event.status === "archived") current.archivedEvents += 1;
      eventStatsMap.set(key, current);
    }

    const refundStatsMap = new Map();
    const addRefundStats = (items) => {
      for (const item of items) {
        const key = String(item._id || "unknown");
        const current = refundStatsMap.get(key) || { refundsCount: 0, refundedAmount: 0 };
        current.refundsCount += Number(item.count || 0);
        current.refundedAmount += Number(item.amount || 0);
        refundStatsMap.set(key, current);
      }
    };
    addRefundStats(refundedTicketStats);
    addRefundStats(refundedReservationStats);

    const orderRows = orders.map((order) => {
      const organizerId = String(order.organizer || "unknown");
      const organizerInfo = getOrganizerInfo(organizerId);
      const grossPaid = money(Number(order.amountPaid ?? order.total ?? 0));
      const netRevenue = organizerNetAmount(grossPaid);
      const grossBalanceDue = order.paymentStatus === "reserved" ? money(Number(order.balanceDue || 0)) : 0;
      const fullEventPassTickets = (order.items || []).reduce(
        (sum, item) => sum + (item.kind === "full-event-pass" ? Number(item.quantity || 0) : 0),
        0
      );
      const activityTickets = (order.items || []).reduce(
        (sum, item) => sum + (item.kind === "activity" ? Number(item.quantity || 0) : 0),
        0
      );

      return {
        id: String(order._id),
        organizerId,
        organizerName: organizerInfo.organizerName,
        organizerEmail: organizerInfo.organizerEmail,
        organizationName: organizerInfo.organizationName,
        eventId: String(order.event || ""),
        eventTitle: order.eventSnapshot?.title || "Event",
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        ticketType: (order.items || []).map((item) => item.name).filter(Boolean).join(", "),
        quantity: Number(order.quantity || 0),
        total: money(Number(order.total || 0)),
        grossPaid,
        netRevenue,
        platformFee: money(grossPaid - netRevenue),
        grossBalanceDue,
        netBalanceDue: organizerNetAmount(grossBalanceDue),
        paymentType: order.paymentType,
        paymentStatus: order.paymentStatus,
        checkInStatus: order.checkInStatus,
        balanceDueDeadlineAt: order.balanceDueDeadlineAt,
        purchaseDate: order.createdAt,
        day: dateKey(order.createdAt),
        fullEventPassTickets,
        activityTickets,
      };
    });

    const organizerRowsMap = new Map();
    const ensureOrganizerRow = (organizerId) => {
      const id = String(organizerId || "unknown");
      const current = organizerRowsMap.get(id);
      if (current) return current;

      const info = getOrganizerInfo(id);
      const eventStats = eventStatsMap.get(id) || {
        eventsCount: 0,
        publishedEvents: 0,
        pendingEvents: 0,
        draftEvents: 0,
        archivedEvents: 0,
      };
      const refundStats = refundStatsMap.get(id) || { refundsCount: 0, refundedAmount: 0 };
      const next = {
        ...info,
        ...eventStats,
        refundsCount: Number(refundStats.refundsCount || 0),
        refundedAmount: money(refundStats.refundedAmount || 0),
        grossRevenue: 0,
        totalRevenue: 0,
        platformFee: 0,
        outstandingBalance: 0,
        ordersCount: 0,
        ticketsSold: 0,
        reservedTickets: 0,
        reservationsCount: 0,
        salaryDue: 0,
      };
      organizerRowsMap.set(id, next);
      return next;
    };

    organizers.forEach((organizer) => ensureOrganizerRow(organizer._id));
    for (const key of eventStatsMap.keys()) ensureOrganizerRow(key);

    const topEventsMap = new Map();
    const salesByDayMap = new Map();
    let fullEventPassTickets = 0;
    let activityTickets = 0;

    for (const order of orderRows) {
      const organizerRow = ensureOrganizerRow(order.organizerId);
      organizerRow.grossRevenue += order.grossPaid;
      organizerRow.totalRevenue += order.netRevenue;
      organizerRow.platformFee += order.platformFee;
      organizerRow.outstandingBalance += order.netBalanceDue;
      organizerRow.ordersCount += 1;
      organizerRow.salaryDue += order.netRevenue;
      if (order.paymentStatus === "paid") {
        organizerRow.ticketsSold += order.quantity;
        fullEventPassTickets += Number(order.fullEventPassTickets || 0);
        activityTickets += Number(order.activityTickets || 0);
      }
      if (order.paymentStatus === "reserved") {
        organizerRow.reservedTickets += order.quantity;
        organizerRow.reservationsCount += 1;
      }

      const eventKey = order.eventId || `${order.organizerId}-${order.eventTitle}`;
      const eventRow = topEventsMap.get(eventKey) || {
        eventId: order.eventId,
        title: order.eventTitle,
        organizerId: order.organizerId,
        organizerName: order.organizerName,
        orders: 0,
        ticketsSold: 0,
        reservedTickets: 0,
        revenue: 0,
        grossRevenue: 0,
        platformFee: 0,
      };
      eventRow.orders += 1;
      eventRow.revenue += order.netRevenue;
      eventRow.grossRevenue += order.grossPaid;
      eventRow.platformFee += order.platformFee;
      if (order.paymentStatus === "paid") eventRow.ticketsSold += order.quantity;
      if (order.paymentStatus === "reserved") eventRow.reservedTickets += order.quantity;
      topEventsMap.set(eventKey, eventRow);

      if (order.day) {
        const dayRow = salesByDayMap.get(order.day) || {
          date: order.day,
          revenue: 0,
          grossRevenue: 0,
          platformFee: 0,
          orders: 0,
          ticketsSold: 0,
          reservations: 0,
        };
        dayRow.revenue += order.netRevenue;
        dayRow.grossRevenue += order.grossPaid;
        dayRow.platformFee += order.platformFee;
        dayRow.orders += 1;
        if (order.paymentStatus === "paid") dayRow.ticketsSold += order.quantity;
        if (order.paymentStatus === "reserved") dayRow.reservations += 1;
        salesByDayMap.set(order.day, dayRow);
      }
    }

    const organizerRows = Array.from(organizerRowsMap.values()).map((row) => ({
      ...row,
      grossRevenue: money(row.grossRevenue),
      totalRevenue: money(row.totalRevenue),
      platformFee: money(row.platformFee),
      outstandingBalance: money(row.outstandingBalance),
      salaryDue: money(row.salaryDue),
    })).sort((a, b) => b.salaryDue - a.salaryDue);

    const refundsCount = organizerRows.reduce((sum, organizer) => sum + Number(organizer.refundsCount || 0), 0);
    const refundedAmount = organizerRows.reduce((sum, organizer) => sum + Number(organizer.refundedAmount || 0), 0);
    const totalRevenue = orderRows.reduce((sum, order) => sum + order.netRevenue, 0);
    const grossRevenue = orderRows.reduce((sum, order) => sum + order.grossPaid, 0);
    const platformFee = orderRows.reduce((sum, order) => sum + order.platformFee, 0);
    const outstandingBalance = orderRows.reduce((sum, order) => sum + order.netBalanceDue, 0);
    const ticketsSold = orderRows
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.quantity, 0);
    const reservedTickets = orderRows
      .filter((order) => order.paymentStatus === "reserved")
      .reduce((sum, order) => sum + order.quantity, 0);
    const reservationsCount = orderRows.filter((order) => order.paymentStatus === "reserved").length;

    return res.json({
      serviceFeeRate: ADMIN_ANALYTICS_SERVICE_FEE_RATE,
      summary: {
        totalRevenue: money(totalRevenue),
        grossRevenue: money(grossRevenue),
        platformFee: money(platformFee),
        salaryDue: money(totalRevenue),
        ticketsSold,
        reservedTickets,
        reservationsCount,
        outstandingBalance: money(outstandingBalance),
        ordersCount: orderRows.length,
        averageOrderValue: orderRows.length ? money(totalRevenue / orderRows.length) : 0,
        organizersCount: organizerRows.length,
        refundsCount,
        refundedAmount: money(refundedAmount),
      },
      organizers: organizerRows,
      orders: orderRows,
      topEvents: Array.from(topEventsMap.values())
        .map((row) => ({
          ...row,
          revenue: money(row.revenue),
          grossRevenue: money(row.grossRevenue),
          platformFee: money(row.platformFee),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      salesByDay: Array.from(salesByDayMap.values())
        .map((row) => ({
          ...row,
          revenue: money(row.revenue),
          grossRevenue: money(row.grossRevenue),
          platformFee: money(row.platformFee),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      eventStatuses: {
        published: events.filter((event) => event.status === "published").length,
        pending: events.filter((event) => ["pending", "pending-update-review"].includes(event.status)).length,
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

router.get("/requests", async (req, res) => {
  try {
    const status = String(req.query.status || "pending").trim().toLowerCase();
    const allowedStatuses = new Set(["pending", "rejected"]);
    const queryStatus = allowedStatuses.has(status) ? status : "pending";

    const requests = await User.find({ organizerStatus: queryStatus })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      requests: requests.map((user) => ({
        id: user._id,
        requestId: user.organizerRequestId,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.organizerApplication?.submittedAt || user.createdAt,
        organizerStatus: user.organizerStatus,
        organizationName: user.organizerApplication?.organizationName || "",
        description: user.organizerApplication?.description || "",
        contactEmail: user.organizerApplication?.contactEmail || user.email,
        phone: user.organizerApplication?.phone || "",
        website: user.organizerApplication?.website || "",
        instagram: user.organizerApplication?.instagram || "",
        facebook: user.organizerApplication?.facebook || "",
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);

    return res.json({
      users: users.map((user) => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: getUserRole(user),
        organizerStatus: user.organizerStatus,
        organizerAccessStatus: user.organizerAccessStatus || "active",
        accountStatus: user.accountStatus || "active",
        blockedReason: user.blockedReason || "",
        createdAt: user.createdAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/deactivate-organizer", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (getUserRole(user) === "admin") {
      return res.status(400).json({ message: "Admin organizer access cannot be changed" });
    }
    if (!(user.role === "organizer" || user.organizerStatus === "approved" || user.isOrganizer)) {
      return res.status(400).json({ message: "Only approved organizers can be deactivated" });
    }

    user.organizerAccessStatus = "deactivated";
    await user.save();

    return res.json({
      message: "Organizer access deactivated",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: getUserRole(user),
        organizerStatus: user.organizerStatus,
        organizerAccessStatus: user.organizerAccessStatus || "active",
        accountStatus: user.accountStatus || "active",
        blockedReason: user.blockedReason || "",
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/activate-organizer", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(user.role === "organizer" || user.organizerStatus === "approved" || user.isOrganizer)) {
      return res.status(400).json({ message: "Only approved organizers can be activated" });
    }

    user.organizerAccessStatus = "active";
    await user.save();

    return res.json({
      message: "Organizer access activated",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: getUserRole(user),
        organizerStatus: user.organizerStatus,
        organizerAccessStatus: user.organizerAccessStatus || "active",
        accountStatus: user.accountStatus || "active",
        blockedReason: user.blockedReason || "",
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/block", async (req, res) => {
  try {
    const reason = String(req.body?.reason || "").trim();
    const allowedReasons = new Set(["Fraud", "Spam", "Fake event", "Abuse"]);
    if (!allowedReasons.has(reason)) {
      return res.status(400).json({ message: "Valid block reason is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (getUserRole(user) === "admin") {
      return res.status(400).json({ message: "Admin account cannot be blocked" });
    }

    // Блокировка хранится в User. Потом requireAuth не пустит такого пользователя в защищенные routes.
    user.accountStatus = "blocked";
    user.blockedReason = reason;
    user.blockedAt = new Date();
    user.blockedBy = req.user._id;
    await user.save();

    return res.json({
      message: "User blocked",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: getUserRole(user),
        organizerStatus: user.organizerStatus,
        organizerAccessStatus: user.organizerAccessStatus || "active",
        accountStatus: user.accountStatus,
        blockedReason: user.blockedReason,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/unblock", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accountStatus = "active";
    user.blockedReason = "";
    user.blockedAt = null;
    user.blockedBy = null;
    await user.save();

    return res.json({
      message: "User unblocked",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: getUserRole(user),
        organizerStatus: user.organizerStatus,
        organizerAccessStatus: user.organizerAccessStatus || "active",
        accountStatus: user.accountStatus,
        blockedReason: user.blockedReason,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/requests/:id/approve", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Request not found" });

    // Одобрение заявки превращает обычного пользователя в organizer.
    user.isOrganizer = true;
    user.organizerStatus = "approved";
    user.organizerAccessStatus = "active";
    if (user.role !== "admin") user.role = "organizer";
    user.organizerApprovalNoticePending = true;
    await user.save();

    return res.json({
      message: "Organizer request approved",
      request: {
        id: user._id,
        requestId: user.organizerRequestId,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.organizerApplication?.submittedAt || user.createdAt,
        organizerStatus: user.organizerStatus,
        organizationName: user.organizerApplication?.organizationName || "",
        description: user.organizerApplication?.description || "",
        contactEmail: user.organizerApplication?.contactEmail || user.email,
        phone: user.organizerApplication?.phone || "",
        website: user.organizerApplication?.website || "",
        instagram: user.organizerApplication?.instagram || "",
        facebook: user.organizerApplication?.facebook || "",
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/requests/:id/reject", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Request not found" });

    user.isOrganizer = false;
    user.organizerStatus = "rejected";
    if (user.role !== "admin" && user.role !== "validator") user.role = "user";
    user.organizerApprovalNoticePending = false;
    await user.save();

    return res.json({
      message: "Organizer request archived",
      request: {
        id: user._id,
        requestId: user.organizerRequestId,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.organizerApplication?.submittedAt || user.createdAt,
        organizerStatus: user.organizerStatus,
        organizationName: user.organizerApplication?.organizationName || "",
        description: user.organizerApplication?.description || "",
        contactEmail: user.organizerApplication?.contactEmail || user.email,
        phone: user.organizerApplication?.phone || "",
        website: user.organizerApplication?.website || "",
        instagram: user.organizerApplication?.instagram || "",
        facebook: user.organizerApplication?.facebook || "",
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const status = String(req.query.status || "").trim().toLowerCase();
    // Для админа pending включает новые события и изменения уже опубликованных событий.
    const filter = status === "pending"
      ? { status: { $in: ["pending", "pending-update-review"] } }
      : status
        ? { status }
        : {};
    const events = await Event.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json({ events: events.map(publicAdminEvent) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/approve", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!hasEventImage(event)) {
      return res.status(400).json({ message: "Event poster is required before publishing." });
    }
    // Если это update review, snapshot нужен для уведомления покупателей об изменениях.
    const previousSnapshot = event.status === "pending-update-review" ? event.pendingUpdateSnapshot : null;
    event.status = "published";
    event.pendingUpdateSnapshot = null;
    await event.save();
    if (previousSnapshot) {
      queueEventUpdateNotifications(event, previousSnapshot);
    }
    return res.json({ event: publicAdminEvent(event), message: "Event approved" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/events/:id/reject", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    // Reject для update review не удаляет событие, а откатывает его к старой published версии.
    if (event.status === "pending-update-review" && event.pendingUpdateSnapshot) {
      Object.assign(event, event.pendingUpdateSnapshot);
      event.status = "published";
      event.pendingUpdateSnapshot = null;
      await event.save();
      return res.json({ event: publicAdminEvent(event), message: "Event update rejected" });
    }
    event.status = "archived";
    await event.save();
    return res.json({ event: publicAdminEvent(event), message: "Event rejected" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
