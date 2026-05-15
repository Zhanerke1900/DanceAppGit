import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFrontendPaymentReturnUrl,
  getFreedomPayScriptName,
  makeFreedomPaySignature,
  parseFreedomPayXml,
  verifyFreedomPaySignature,
} from "../src/services/freedompay.service.js";

test("Freedom Pay signatures are deterministic and reject tampering", () => {
  const params = {
    pg_amount: "12000",
    pg_currency: "KZT",
    pg_merchant_id: "merchant-1",
    pg_order_id: "order-1",
    pg_salt: "fixed-salt",
  };
  const secret = "secret-key";
  const signature = makeFreedomPaySignature("check", params, secret);

  assert.equal(signature, makeFreedomPaySignature("check", params, secret));
  assert.equal(verifyFreedomPaySignature("check", { ...params, pg_sig: signature }, secret), true);
  assert.equal(verifyFreedomPaySignature("check", { ...params, pg_amount: "13000", pg_sig: signature }, secret), false);
});

test("Freedom Pay script name is extracted from callback and API URLs", () => {
  assert.equal(getFreedomPayScriptName("/api/payment/check"), "check");
  assert.equal(getFreedomPayScriptName("https://api.freedompay.kz/init_payment"), "init_payment");
  assert.equal(getFreedomPayScriptName("/api/payment/result?pg_order_id=1"), "result");
});

test("Freedom Pay XML parser decodes provider callback fields", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>Payment &amp; callback accepted</pg_description>
  <pg_order_id>order-42</pg_order_id>
</response>`;

  assert.deepEqual(parseFreedomPayXml(xml), {
    pg_status: "ok",
    pg_description: "Payment & callback accepted",
    pg_order_id: "order-42",
  });
});

test("frontend payment return URL preserves order and payment identifiers", () => {
  const previousFrontendUrl = process.env.FRONTEND_URL;
  const previousFrontendUrls = process.env.FRONTEND_URLS;
  process.env.FRONTEND_URL = "https://dance.example";
  delete process.env.FRONTEND_URLS;

  try {
    const url = new URL(buildFrontendPaymentReturnUrl("success", {
      pg_order_id: "order-42",
      pg_payment_id: "payment-99",
    }));

    assert.equal(url.origin, "https://dance.example");
    assert.equal(url.searchParams.get("payment"), "success");
    assert.equal(url.searchParams.get("orderId"), "order-42");
    assert.equal(url.searchParams.get("paymentId"), "payment-99");
  } finally {
    if (previousFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = previousFrontendUrl;
    }
    if (previousFrontendUrls === undefined) {
      delete process.env.FRONTEND_URLS;
    } else {
      process.env.FRONTEND_URLS = previousFrontendUrls;
    }
  }
});
