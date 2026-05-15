import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Ticket - один проход на событие. ticketCode виден пользователю и в barcode.
    ticketCode: { type: String, required: true, unique: true, index: true },
    // active можно использовать, used уже прошел check-in, cancelled возвращен/refunded.
    status: { type: String, enum: ["active", "used", "cancelled"], default: "active", index: true },
    purchasedAt: { type: Date, default: Date.now, index: true },
    usedAt: { type: Date, default: null },
    eventReminderSentAt: { type: Date, default: null, index: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    userFullName: { type: String, required: true },

    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // Snapshot защищает билет от изменений Event после покупки.
    eventSnapshot: {
      title: { type: String, default: "" },
      category: { type: String, default: "" },
      eventType: { type: String, default: "" },
      date: { type: String, default: "" },
      time: { type: String, default: "" },
      location: { type: String, default: "" },
      city: { type: String, default: "" },
      image: { type: String, default: "" },
      translations: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    ticketType: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KZT" },
    paymentType: { type: String, enum: ["full", "deposit"], default: "deposit", index: true },
    depositRate: { type: Number, default: 0.4, min: 0, max: 1 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    orderTotal: { type: Number, default: 0, min: 0 },
    refundPolicyHours: { type: Number, default: 48, min: 0 },

    // QR подписан backend-ом. На scan проверяется подпись, чтобы билет нельзя было подделать.
    qrPayload: { type: String, required: true },
    qrSignature: { type: String, required: true },
    qrCodeDataUrl: { type: String, required: true },
    barcodeDataUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
