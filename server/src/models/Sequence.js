import mongoose from "mongoose";

const sequenceSchema = new mongoose.Schema(
  {
    // Хранит счетчики, например ticket:2026 -> 15, чтобы генерировать DT-2026-000015.
    key: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Sequence", sequenceSchema);
