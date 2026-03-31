import crypto from "crypto";

function getQrSecret() {
  return process.env.QR_SECRET || process.env.JWT_SECRET || "danceapp-ticket-secret";
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signTicketPayload(payload) {
  return crypto.createHmac("sha256", getQrSecret()).update(payload).digest("hex");
}

export function createSignedTicketToken({ ticketId, ticketCode }) {
  const payload = JSON.stringify({
    ticketId,
    ticketCode,
    issuedAt: new Date().toISOString(),
  });
  const encodedPayload = toBase64Url(payload);
  const signature = signTicketPayload(payload);
  return {
    token: `${encodedPayload}.${signature}`,
    payload,
    signature,
  };
}

export function verifySignedTicketToken(token) {
  try {
    const [encodedPayload, signature] = String(token || "").split(".");
    if (!encodedPayload || !signature) return { valid: false };

    const payload = fromBase64Url(encodedPayload);
    const expectedSignature = signTicketPayload(payload);
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!isValid) return { valid: false };

    return {
      valid: true,
      payload: JSON.parse(payload),
      rawPayload: payload,
      signature,
    };
  } catch {
    return { valid: false };
  }
}
