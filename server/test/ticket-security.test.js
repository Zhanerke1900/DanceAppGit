import assert from "node:assert/strict";
import test from "node:test";

import {
  createSignedTicketToken,
  verifySignedTicketToken,
} from "../src/utils/ticketSecurity.js";

test("ticket QR tokens contain signed ticket identity", () => {
  const previousSecret = process.env.QR_SECRET;
  process.env.QR_SECRET = "test-qr-secret";

  try {
    const signed = createSignedTicketToken({
      ticketId: "ticket-1",
      ticketCode: "DT-2026-000001",
    });
    const verified = verifySignedTicketToken(signed.token);

    assert.equal(verified.valid, true);
    assert.equal(verified.payload.ticketId, "ticket-1");
    assert.equal(verified.payload.ticketCode, "DT-2026-000001");
    assert.match(verified.payload.issuedAt, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    if (previousSecret === undefined) {
      delete process.env.QR_SECRET;
    } else {
      process.env.QR_SECRET = previousSecret;
    }
  }
});

test("ticket QR verification rejects malformed or tampered tokens", () => {
  const previousSecret = process.env.QR_SECRET;
  process.env.QR_SECRET = "test-qr-secret";

  try {
    const signed = createSignedTicketToken({
      ticketId: "ticket-1",
      ticketCode: "DT-2026-000001",
    });
    const [payload, signature] = signed.token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({
      ticketId: "ticket-2",
      ticketCode: "DT-2026-000002",
      issuedAt: new Date().toISOString(),
    })).toString("base64url");

    assert.equal(verifySignedTicketToken("").valid, false);
    assert.equal(verifySignedTicketToken(`${tamperedPayload}.${signature}`).valid, false);
    assert.equal(verifySignedTicketToken(`${payload}.bad-signature`).valid, false);
  } finally {
    if (previousSecret === undefined) {
      delete process.env.QR_SECRET;
    } else {
      process.env.QR_SECRET = previousSecret;
    }
  }
});
