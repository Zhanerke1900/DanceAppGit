import assert from "node:assert/strict";
import test from "node:test";

import { getOrderPaymentDueNow } from "../src/services/ticket.service.js";

test("payment due amount uses reservation balance when order is reserved", () => {
  assert.equal(getOrderPaymentDueNow({
    paymentStatus: "reserved",
    balanceDue: 7000,
    amountPaid: 3000,
    total: 10000,
  }), 7000);
});

test("payment due amount uses deposit or total for pending orders", () => {
  assert.equal(getOrderPaymentDueNow({
    paymentStatus: "pending",
    depositAmount: 2500,
    total: 10000,
  }), 2500);
  assert.equal(getOrderPaymentDueNow({
    paymentStatus: "pending",
    total: 10000,
  }), 10000);
});
