import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import validatorRoutes from "./routes/validator.routes.js";
import { archivePastPublishedEvents } from "./utils/eventDates.js";
import { seedMarketplaceEvents } from "./utils/seedMarketplaceEvents.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    if (req.path.startsWith("/api/") || req.path === "/health") {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/validator", validatorRoutes);

const PORT = process.env.PORT || 4000;
const ARCHIVE_SWEEP_INTERVAL_MS = Number(process.env.EVENT_ARCHIVE_SWEEP_INTERVAL_MS || 15 * 60 * 1000);

async function sweepPastEvents() {
  const result = await archivePastPublishedEvents();
  if (result.archivedCount > 0) {
    console.log(`Archived ${result.archivedCount} past published event(s)`);
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    try {
      await seedMarketplaceEvents();
    } catch (err) {
      console.error("Marketplace seed error:", err.message);
    }
    try {
      await sweepPastEvents();
    } catch (err) {
      console.error("Past event archive sweep error:", err.message);
    }
    const archiveSweep = setInterval(() => {
      sweepPastEvents().catch((err) => console.error("Past event archive sweep error:", err.message));
    }, ARCHIVE_SWEEP_INTERVAL_MS);
    archiveSweep.unref?.();
    console.log(
      `Deploy source commit: ${process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || "local"}`
    );
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
