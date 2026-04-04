import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { makeToken, hashToken, makeCode } from "../utils/tokens.js";
import { sendVerifyEmail, sendResetEmail, sendPasswordChangedEmail } from "../utils/sendEmails.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdminEmail } from "../utils/admin.js";
import { getUserRole } from "../middleware/role.middleware.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, authCookieOptions());
}

function publicUser(u) {
  const role = getUserRole(u);
  return {
    _id: u._id,
    fullName: u.fullName,
    email: u.email,
    emailVerified: u.emailVerified,
    role,
    isOrganizer: u.isOrganizer,
    organizerStatus: u.organizerStatus,
    organizerAccessStatus: u.organizerAccessStatus ?? "active",
    organizerApprovalNoticePending: u.organizerApprovalNoticePending ?? false,
    isAdmin: role === "admin",
    isValidator: role === "validator",
    language: u.language ?? "en",
    emailNotifications: u.emailNotifications ?? true,
    eventReminders: u.eventReminders ?? true,
    accountStatus: u.accountStatus ?? "active",
    blockedReason: u.blockedReason || "",
  };
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!cleanEmail.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const token = makeToken();
    const code = makeCode();

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      passwordHash,
      role: isAdminEmail(cleanEmail) ? "admin" : "user",
      emailVerified: false,
      verifyTokenHash: hashToken(token),
      verifyCodeHash: hashToken(code),
      verifyExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendVerifyEmail({ email: cleanEmail, fullName: user.fullName, token, code });

    return res.status(201).json({
      message: "Registered. Verification email sent.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// VERIFY EMAIL (token + email)
router.get("/verify-email", async (req, res) => {
  try {
    const { token, email } = req.query;
    const cleanEmail = String(email || "").trim().toLowerCase();
    const rawToken = String(token || "").trim();

    if (!cleanEmail || !rawToken) {
      return res.status(400).json({ message: "token and email are required" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (!user.verifyTokenHash || !user.verifyExpiresAt) {
      return res.status(400).json({ message: "No active verification request" });
    }

    if (user.verifyExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Verification token expired" });
    }

    if (hashToken(rawToken) !== user.verifyTokenHash) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    user.emailVerified = true;
    user.verifyTokenHash = null;
    user.verifyCodeHash = null;
    user.verifyExpiresAt = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// RESEND VERIFICATION
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.json({ message: "If user exists, email was sent" });

    if (user.emailVerified) return res.json({ message: "Email already verified" });

    const token = makeToken();
    const code = makeCode();

    user.verifyTokenHash = hashToken(token);
    user.verifyCodeHash = hashToken(code);
    user.verifyExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerifyEmail({ email: cleanEmail, fullName: user.fullName, token, code });

    return res.json({ message: "Verification email resent" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        code: "ACCOUNT_BLOCKED",
      });
    }

    // ✅ если не подтвержден — не логиним
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const ok = await bcrypt.compare(String(password || ""), user.passwordHash);
    if (!ok) {
      // ✅ это то, что ты хотела: “неправильный пароль”
      return res.status(401).json({ message: "Incorrect password", code: "WRONG_PASSWORD" });
    }

    setAuthCookie(res, user._id.toString());

    return res.json({ user: publicUser(user), message: "Logged in" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// ME
router.get("/me", requireAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  return res.json({ user: publicUser(req.user) });
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const { fullName, language, emailNotifications, eventReminders } = req.body || {};

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if ((user.organizerAccessStatus || "active") === "deactivated") {
      return res.status(403).json({ message: "Organizer access is deactivated. New organizer requests are disabled." });
    }

    const nextFullName = String(fullName || "").trim();
    if (!nextFullName || nextFullName.length < 2) {
      return res.status(400).json({ message: "Full name must be at least 2 characters" });
    }

    const allowedLanguages = new Set(["en", "ru", "kk"]);
    if (language && !allowedLanguages.has(String(language))) {
      return res.status(400).json({ message: "Invalid language" });
    }

    user.fullName = nextFullName;
    user.language = allowedLanguages.has(String(language)) ? String(language) : (user.language || "en");
    user.emailNotifications = Boolean(emailNotifications);
    user.eventReminders = Boolean(eventReminders);
    await user.save();

    return res.json({ user: publicUser(user), message: "Settings saved" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/organizer-request", requireAuth, async (req, res) => {
  try {
    const {
      organizationName,
      description,
      email,
      phone,
      website,
      instagram,
      facebook,
    } = req.body || {};

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    const cleanOrganizationName = String(organizationName || "").trim();
    const cleanDescription = String(description || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanWebsite = String(website || "").trim();
    const cleanInstagram = String(instagram || "").trim();
    const cleanFacebook = String(facebook || "").trim();

    if (!cleanOrganizationName) {
      return res.status(400).json({ message: "Organization name is required" });
    }
    if (cleanDescription.length < 50) {
      return res.status(400).json({ message: "Description must be at least 50 characters" });
    }
    if (!cleanEmail.includes("@")) {
      return res.status(400).json({ message: "Valid contact email is required" });
    }
    if (!cleanPhone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    user.organizerStatus = "pending";
    user.isOrganizer = false;
    user.role = isAdminEmail(user.email) ? "admin" : "user";
    user.organizerApprovalNoticePending = false;
    user.organizerRequestId = user.organizerRequestId || `ORG-${Date.now().toString().slice(-6)}`;
    user.organizerApplication = {
      organizationName: cleanOrganizationName,
      description: cleanDescription,
      contactEmail: cleanEmail,
      phone: cleanPhone,
      website: cleanWebsite,
      instagram: cleanInstagram,
      facebook: cleanFacebook,
      submittedAt: new Date(),
    };
    await user.save();

    return res.json({
      message: "Organizer application submitted",
      applicationId: user.organizerRequestId,
      user: publicUser(user),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/ack-organizer-approval", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    user.organizerApprovalNoticePending = false;
    await user.save();

    return res.json({ user: publicUser(user), message: "Organizer approval notice cleared" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        message: "Current password is incorrect",
        code: "WRONG_CURRENT_PASSWORD",
      });
    }

    const samePassword = await bcrypt.compare(String(newPassword), user.passwordHash);
    if (samePassword) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    user.resetTokenHash = null;
    user.resetCodeHash = null;
    user.resetExpiresAt = null;
    await user.save();

    await sendPasswordChangedEmail({
      email: user.email,
      fullName: user.fullName,
    });

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  res.clearCookie("token", authCookieOptions());
  return res.json({ message: "Logged out" });
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: cleanEmail });

    // всегда отвечаем “sent” (чтобы не палить существование email)
    if (!user) return res.json({ message: "If that email exists, reset link was sent" });

    const token = makeToken();
    const code = makeCode();

    user.resetTokenHash = hashToken(token);
    user.resetCodeHash = hashToken(code);
    user.resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendResetEmail({ email: cleanEmail, fullName: user.fullName, token, code });

    return res.json({ message: "Reset email sent" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const rawToken = String(token || "").trim();

    if (!cleanEmail || !rawToken) {
      return res.status(400).json({ message: "email and token are required" });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: "Invalid reset request" });

    if (!user.resetTokenHash || !user.resetExpiresAt) {
      return res.status(400).json({ message: "No active reset request" });
    }

    if (user.resetExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Reset token expired" });
    }

    if (hashToken(rawToken) !== user.resetTokenHash) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    user.resetTokenHash = null;
    user.resetCodeHash = null;
    user.resetExpiresAt = null;
    await user.save();

    return res.json({ message: "Password updated. You can log in now." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
