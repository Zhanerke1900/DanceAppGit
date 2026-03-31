import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getUserRole, requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

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
    price: event.price,
  };
}

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
    ]);

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
      monthlyGrowth,
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
    event.status = "published";
    event.pendingUpdateSnapshot = null;
    await event.save();
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
