import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    activityId: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: ["event-ticket", "full-event-pass", "activity"], default: "event-ticket" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true, lowercase: true, index: true },

    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    eventSnapshot: {
      title: { type: String, default: "" },
      category: { type: String, default: "" },
      eventType: { type: String, default: "" },
      date: { type: String, default: "" },
      time: { type: String, default: "" },
      location: { type: String, default: "" },
      city: { type: String, default: "" },
      image: { type: String, default: "" },
    },

    items: { type: [orderItemSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["full", "deposit"], default: "deposit", index: true },
    depositRate: { type: Number, default: 0.4, min: 0, max: 1 },
    depositAmount: { type: Number, default: 0, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    refundPolicyHours: { type: Number, default: 48, min: 0 },
    balanceDueDeadlineHours: { type: Number, default: 5, min: 0 },
    balanceDueDeadlineAt: { type: Date, default: null, index: true },
    reservedAt: { type: Date, default: null },

    paymentStatus: { type: String, enum: ["paid", "pending", "reserved", "failed", "refunded"], default: "paid" },
    paymentProvider: { type: String, enum: ["manual", "freedompay"], default: "manual", index: true },
    freedomPayPaymentId: { type: String, default: "", index: true },
    paymentFailureReason: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    ticketsIssuedAt: { type: Date, default: null },
    checkInStatus: { type: String, enum: ["not-checked-in", "checked-in"], default: "not-checked-in" },
  },
  { timestamps: true }
);

orderSchema.index({ event: 1, paymentStatus: 1, balanceDueDeadlineAt: 1 });
orderSchema.index({ buyer: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ organizer: 1, paymentStatus: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
