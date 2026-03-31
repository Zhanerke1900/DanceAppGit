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

    paymentStatus: { type: String, enum: ["paid", "pending", "failed", "refunded"], default: "paid" },
    checkInStatus: { type: String, enum: ["not-checked-in", "checked-in"], default: "not-checked-in" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
