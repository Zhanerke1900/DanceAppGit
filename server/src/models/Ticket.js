import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["active", "used", "cancelled"], default: "active", index: true },
    purchasedAt: { type: Date, default: Date.now, index: true },
    usedAt: { type: Date, default: null },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    userFullName: { type: String, required: true },

    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
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

    ticketType: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KZT" },

    qrPayload: { type: String, required: true },
    qrSignature: { type: String, required: true },
    qrCodeDataUrl: { type: String, required: true },
    barcodeDataUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
