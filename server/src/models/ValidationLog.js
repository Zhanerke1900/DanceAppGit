import mongoose from "mongoose";

const validationLogSchema = new mongoose.Schema(
  {
    validator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    validatorEmail: { type: String, required: true, lowercase: true, index: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    qrToken: { type: String, default: "" },
    result: {
      type: String,
      enum: ["validated", "already-used", "invalid", "another-event"],
      required: true,
      index: true,
    },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ValidationLog", validationLogSchema);
