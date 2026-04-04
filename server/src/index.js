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
import ticketRoutes from "./routes/ticket.routes.js";
import validatorRoutes from "./routes/validator.routes.js";

dotenv.config();

const app = express();
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview/production domains without requiring every preview URL in env.
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;

  return false;
}

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
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/validator", validatorRoutes);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
