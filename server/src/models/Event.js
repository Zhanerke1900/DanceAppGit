import mongoose from "mongoose";

const scheduleItemSchema = new mongoose.Schema(
  {
    time: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    type: { type: String, default: "Masterclass" },
    time: { type: String, default: "" },
    description: { type: String, default: "" },
    instructor: { type: String, default: "" },
    price: { type: Number, default: 0 },
    ticketLimit: { type: Number, default: 0, min: 0 },
    organizer: {
      name: { type: String, default: "" },
      role: { type: String, default: "Host" },
    },
    location: { type: String, default: "" },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    submittedByEmail: { type: String, required: true, lowercase: true, index: true },
    submittedByName: { type: String, required: true },

    title: { type: String, required: true },
    eventType: { type: String, enum: ["usual-event", "special-program"], required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    city: { type: String, required: true },
    venue: { type: String, default: "" },
    address: { type: String, default: "" },
    location: { type: String, default: "" },

    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    targetAudience: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    ageRestriction: { type: String, default: "" },
    dressCode: { type: String, default: "" },

    image: { type: String, default: "" },
    price: { type: String, default: "" },
    ticketLimit: { type: Number, default: 0, min: 0 },
    ticketPricing: {
      generalAdmission: { type: String, default: "" },
      fullEventPass: { type: String, default: "" },
      fullEventPassDiscount: { type: String, default: "" },
    },
    fullPassPrice: { type: Number, default: 0 },
    fullPassDiscount: { type: Number, default: 0 },

    schedule: { type: [scheduleItemSchema], default: [] },
    activities: { type: [activitySchema], default: [] },
    validators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

    status: {
      type: String,
      enum: ["draft", "pending", "pending-update-review", "published", "archived"],
      default: "draft",
      index: true,
    },
    pendingUpdateSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
