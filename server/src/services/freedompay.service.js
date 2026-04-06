import crypto from "crypto";

const DEFAULT_INIT_URL = "https://api.freedompay.kz/init_payment";

function getRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function randomSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function md5(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function collectSignatureValues(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(collectSignatureValues);
  if (typeof value === "object") {
    return Object.keys(value)
      .filter((key) => key !== "pg_sig")
      .sort()
      .flatMap((key) => collectSignatureValues(value[key]));
  }
  return [String(value)];
}

export function getFreedomPayScriptName(urlOrPath) {
  const clean = String(urlOrPath || "").split("?")[0].replace(/\/+$/, "");
  const lastSegment = clean.split("/").filter(Boolean).pop();
  return lastSegment || clean || "";
}

export function makeFreedomPaySignature(scriptName, params, secretKey) {
  const values = [scriptName];
  for (const key of Object.keys(params || {}).filter((item) => item !== "pg_sig").sort()) {
    values.push(...collectSignatureValues(params[key]));
  }
  values.push(secretKey);
  return md5(values.join(";"));
}

export function verifyFreedomPaySignature(scriptName, params, secretKey) {
  const received = String(params?.pg_sig || "").trim().toLowerCase();
  if (!received) return false;
  const expected = makeFreedomPaySignature(scriptName, params, secretKey).toLowerCase();
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

export function buildFreedomPayXmlResponse(scriptName, params) {
  const secretKey = getRequiredEnv("FREEDOMPAY_SECRET_KEY");
  const payload = {
    ...params,
    pg_salt: params.pg_salt || randomSalt(),
  };
  payload.pg_sig = makeFreedomPaySignature(scriptName, payload, secretKey);

  const body = Object.entries(payload)
    .map(([key, value]) => `  <${key}>${escapeXml(value)}</${key}>`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>\n<response>\n${body}\n</response>`;
}

export function parseFreedomPayXml(xml) {
  const result = {};
  const text = String(xml || "");
  const tagPattern = /<(pg_[A-Za-z0-9_:-]+)>([\s\S]*?)<\/\1>/g;
  for (const match of text.matchAll(tagPattern)) {
    const [, tagName, rawValue] = match;
    result[tagName] = decodeXml(rawValue.trim());
  }
  return result;
}

export function getFreedomPayConfig() {
  return {
    merchantId: getRequiredEnv("FREEDOMPAY_MERCHANT_ID"),
    secretKey: getRequiredEnv("FREEDOMPAY_SECRET_KEY"),
    initUrl: String(process.env.FREEDOMPAY_INIT_URL || DEFAULT_INIT_URL).trim(),
    currency: String(process.env.FREEDOMPAY_CURRENCY || "KZT").trim(),
    testingMode: String(process.env.FREEDOMPAY_TESTING_MODE || "").trim(),
    backendUrl: trimTrailingSlash(getRequiredEnv("BACKEND_URL")),
    frontendUrl: trimTrailingSlash(getRequiredEnv("FRONTEND_URL")),
  };
}

export function buildFrontendPaymentReturnUrl(status, payload = {}) {
  const frontendUrl = trimTrailingSlash(process.env.FRONTEND_URL || "");
  const url = new URL(frontendUrl || "http://localhost:5173");
  url.searchParams.set("payment", status);
  if (payload.pg_order_id) url.searchParams.set("orderId", String(payload.pg_order_id));
  if (payload.pg_payment_id) url.searchParams.set("paymentId", String(payload.pg_payment_id));
  return url.toString();
}

function orderAmount(order) {
  return Number(Number(order?.total || 0).toFixed(2));
}

export async function createFreedomPayPayment(order) {
  const config = getFreedomPayConfig();
  const scriptName = getFreedomPayScriptName(config.initUrl);
  const paymentPath = "/api/payment";
  const resultUrl = `${config.backendUrl}${paymentPath}/result`;
  const checkUrl = `${config.backendUrl}${paymentPath}/check`;
  const successUrl = `${config.backendUrl}${paymentPath}/success`;
  const failureUrl = `${config.backendUrl}${paymentPath}/failure`;

  const request = {
    pg_merchant_id: config.merchantId,
    pg_order_id: String(order._id),
    pg_amount: orderAmount(order),
    pg_currency: config.currency,
    pg_description: `DanceTime tickets: ${order.eventSnapshot?.title || "event"}`,
    pg_result_url: resultUrl,
    pg_check_url: checkUrl,
    pg_request_method: "POST",
    pg_result_url_method: "POST",
    pg_check_url_method: "POST",
    pg_success_url: successUrl,
    pg_failure_url: failureUrl,
    pg_success_url_method: "GET",
    pg_failure_url_method: "GET",
    pg_user_contact_email: order.buyerEmail,
    pg_salt: randomSalt(),
  };

  if (config.testingMode) {
    request.pg_testing_mode = config.testingMode;
  }

  request.pg_sig = makeFreedomPaySignature(scriptName, request, config.secretKey);

  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(request)) {
    body.set(key, String(value));
  }

  const response = await fetch(config.initUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/xml, text/xml, */*",
    },
    body,
  });

  const responseText = await response.text();
  const parsed = parseFreedomPayXml(responseText);
  if (!response.ok) {
    throw new Error(`Freedom Pay init failed with HTTP ${response.status}`);
  }

  if (parsed.pg_sig && !verifyFreedomPaySignature(scriptName, parsed, config.secretKey)) {
    throw new Error("Freedom Pay response signature is invalid");
  }

  if (String(parsed.pg_status || "").toLowerCase() !== "ok" || !parsed.pg_redirect_url) {
    throw new Error(parsed.pg_error_description || parsed.pg_description || "Freedom Pay did not return a payment URL");
  }

  return {
    paymentUrl: parsed.pg_redirect_url,
    paymentId: parsed.pg_payment_id || "",
    raw: parsed,
  };
}
