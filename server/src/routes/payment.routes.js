import express from "express";

import Order from "../models/Order.js";
import {
  buildFreedomPayXmlResponse,
  buildFrontendPaymentReturnUrl,
  getFreedomPayScriptName,
  verifyFreedomPaySignature,
} from "../services/freedompay.service.js";
import {
  completeReservationAndIssueTickets,
  getOrderPaymentDueNow,
  markOrderPaidAndIssueTickets,
  markOrderReserved,
} from "../services/ticket.service.js";
import { invalidatePublishedEventsCache } from "./events.routes.js";

const router = express.Router();

function getSecretKey() {
  const value = String(process.env.FREEDOMPAY_SECRET_KEY || "").trim();
  if (!value) throw new Error("FREEDOMPAY_SECRET_KEY is not configured");
  return value;
}

function normalizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      Array.isArray(value) ? String(value[0] ?? "") : String(value ?? ""),
    ])
  );
}

function readRequestStream(req) {
  if (req.readableEnded) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseMultipart(rawBody, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];
  if (!boundary) return {};

  const result = {};
  const parts = rawBody.split(`--${boundary}`);
  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const separatorIndex = part.indexOf("\r\n\r\n");
    if (separatorIndex < 0) continue;
    const rawValue = part.slice(separatorIndex + 4).replace(/\r\n--$/, "").replace(/\r\n$/, "");
    result[nameMatch[1]] = rawValue;
  }
  return result;
}

async function getPaymentPayload(req) {
  if (req.method === "GET") return normalizePayload(req.query || {});
  if (req.body && Object.keys(req.body).length > 0) return normalizePayload(req.body);

  const contentType = String(req.headers["content-type"] || "");
  const rawBody = await readRequestStream(req);
  if (!rawBody) return {};
  if (contentType.includes("multipart/form-data")) {
    return normalizePayload(parseMultipart(rawBody, contentType));
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return normalizePayload(Object.fromEntries(new URLSearchParams(rawBody)));
  }
  try {
    return normalizePayload(JSON.parse(rawBody));
  } catch {
    return normalizePayload(Object.fromEntries(new URLSearchParams(rawBody)));
  }
}

function sendFreedomPayResponse(req, res, params) {
  const scriptName = getFreedomPayScriptName(req.path);
  const xml = buildFreedomPayXmlResponse(scriptName, params);
  return res.status(200).type("application/xml").send(xml);
}

function pickOrderId(payload) {
  return String(payload.pg_order_id || payload.order_id || payload.orderId || "").trim();
}

function isSuccessfulPayment(payload) {
  const result = String(payload.pg_result || "").trim();
  const status = String(payload.pg_status || "").trim().toLowerCase();
  return result === "1" || status === "ok" || status === "success";
}

function canReject(payload) {
  return String(payload.pg_can_reject || "").trim() === "1";
}

function amountMatches(order, payload) {
  if (!payload.pg_amount) return true;
  const expectedAmount = getOrderPaymentDueNow(order);
  return Math.round(expectedAmount * 100) === Math.round(Number(payload.pg_amount || 0) * 100);
}

function currencyMatches(payload) {
  const expected = String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim().toUpperCase();
  const received = String(payload.pg_currency || expected).trim().toUpperCase();
  return received === expected;
}

async function rejectOrFailOrder(order, reason) {
  if (!order || order.paymentStatus === "paid") return;
  if (order.paymentStatus === "reserved") {
    order.paymentFailureReason = reason;
    await order.save();
    return;
  }
  order.paymentStatus = "failed";
  order.paymentFailureReason = reason;
  await order.save();
}

router.all("/check", async (req, res) => {
  try {
    const payload = await getPaymentPayload(req);
    const scriptName = getFreedomPayScriptName(req.path);
    const signatureOk = verifyFreedomPaySignature(scriptName, payload, getSecretKey());
    if (!signatureOk) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "error",
        pg_description: "Invalid signature",
      });
    }

    const order = await Order.findById(pickOrderId(payload));
    if (!order || !["pending", "reserved"].includes(order.paymentStatus)) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "rejected",
        pg_description: "Order is not available for payment",
      });
    }
    if (order.paymentStatus === "reserved" && order.balanceDueDeadlineAt && new Date(order.balanceDueDeadlineAt).getTime() <= Date.now()) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "rejected",
        pg_description: "Reservation must be fully paid at least 5 hours before the event",
      });
    }

    if (!amountMatches(order, payload) || !currencyMatches(payload)) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "rejected",
        pg_description: "Payment amount or currency mismatch",
      });
    }

    return sendFreedomPayResponse(req, res, {
      pg_status: "ok",
      pg_description: "Payment is allowed",
    });
  } catch (error) {
    console.error("Freedom Pay check error:", error?.message || error);
    return sendFreedomPayResponse(req, res, {
      pg_status: "error",
      pg_description: "Payment check failed",
    });
  }
});

router.all("/result", async (req, res) => {
  try {
    const payload = await getPaymentPayload(req);
    const scriptName = getFreedomPayScriptName(req.path);
    const signatureOk = verifyFreedomPaySignature(scriptName, payload, getSecretKey());
    if (!signatureOk) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "error",
        pg_description: "Invalid signature",
      });
    }

    const order = await Order.findById(pickOrderId(payload));
    if (!order) {
      return sendFreedomPayResponse(req, res, {
        pg_status: "error",
        pg_description: "Order not found",
      });
    }

    if (!isSuccessfulPayment(payload)) {
      await rejectOrFailOrder(order, payload.pg_error_description || "Payment failed");
      return sendFreedomPayResponse(req, res, {
        pg_status: "ok",
        pg_description: "Payment failure processed",
      });
    }

    if (!amountMatches(order, payload) || !currencyMatches(payload)) {
      const description = "Payment amount or currency mismatch";
      if (canReject(payload)) {
        await rejectOrFailOrder(order, description);
        return sendFreedomPayResponse(req, res, {
          pg_status: "rejected",
          pg_description: description,
        });
      }
      return sendFreedomPayResponse(req, res, {
        pg_status: "error",
        pg_description: description,
      });
    }

    const paymentFields = {
      paymentProvider: "freedompay",
      freedomPayPaymentId: String(payload.pg_payment_id || order.freedomPayPaymentId || ""),
      paymentAmount: getOrderPaymentDueNow(order),
      paidAt: order.paidAt || new Date(),
      paymentFailureReason: "",
    };

    if (order.paymentStatus === "pending" && order.paymentType === "deposit") {
      await markOrderReserved(order, paymentFields);
    } else if (order.paymentStatus === "reserved") {
      await completeReservationAndIssueTickets(order, paymentFields);
    } else {
      await markOrderPaidAndIssueTickets(order, paymentFields);
    }
    invalidatePublishedEventsCache();

    return sendFreedomPayResponse(req, res, {
      pg_status: "ok",
      pg_description: "Payment processed",
    });
  } catch (error) {
    console.error("Freedom Pay result error:", error?.message || error);
    return sendFreedomPayResponse(req, res, {
      pg_status: "error",
      pg_description: "Payment result processing failed",
    });
  }
});

router.all("/success", async (req, res) => {
  const payload = await getPaymentPayload(req);
  return res.redirect(303, buildFrontendPaymentReturnUrl("success", payload));
});

router.all("/failure", async (req, res) => {
  const payload = await getPaymentPayload(req);
  return res.redirect(303, buildFrontendPaymentReturnUrl("failure", payload));
});

export default router;
