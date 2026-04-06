import express from "express";

const router = express.Router();

function pickPaymentField(payload, names) {
  for (const name of names) {
    const value = payload?.[name];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

router.all("/result", (req, res) => {
  const payload = req.method === "GET" ? req.query : req.body;
  const orderId = pickPaymentField(payload, ["order_id", "orderId", "invoice_id", "invoiceId"]);
  const paymentId = pickPaymentField(payload, ["payment_id", "paymentId", "transaction_id", "transactionId"]);
  const status = pickPaymentField(payload, ["status", "payment_status", "paymentStatus"]);

  console.log("Payment result callback received", {
    method: req.method,
    orderId,
    paymentId,
    status,
    keys: Object.keys(payload || {}).slice(0, 20),
  });

  return res.json({
    ok: true,
    message: "Payment result received",
  });
});

export default router;
