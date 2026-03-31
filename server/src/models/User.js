import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "organizer", "admin", "validator"], default: "user", index: true },

    // email verify
    verifyTokenHash: { type: String, default: null },
    verifyCodeHash: { type: String, default: null },
    verifyExpiresAt: { type: Date, default: null },

    // reset password
    resetTokenHash: { type: String, default: null },
    resetCodeHash: { type: String, default: null },
    resetExpiresAt: { type: Date, default: null },

    // optional organizer fields (если у тебя есть)
    isOrganizer: { type: Boolean, default: false },
    organizerStatus: { type: String, default: "none" }, // none | pending | approved | rejected
    organizerAccessStatus: { type: String, enum: ["active", "deactivated"], default: "active" },
    organizerApprovalNoticePending: { type: Boolean, default: false },
    organizerRequestId: { type: String, default: null },
    organizerApplication: {
      organizationName: { type: String, default: "" },
      description: { type: String, default: "" },
      contactEmail: { type: String, default: "" },
      phone: { type: String, default: "" },
      website: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      submittedAt: { type: Date, default: null },
    },

    language: { type: String, default: "en" },
    emailNotifications: { type: Boolean, default: true },
    eventReminders: { type: Boolean, default: true },
    accountStatus: { type: String, enum: ["active", "blocked"], default: "active", index: true },
    blockedReason: { type: String, default: "" },
    blockedAt: { type: Date, default: null },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    validatorOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    validatorAssignedEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
