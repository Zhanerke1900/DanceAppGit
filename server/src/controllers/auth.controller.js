import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { getMailer } from "../config/mailer.js";
import { randomToken, hashToken, generate6DigitCode } from "../utils/crypto.js";
import { signAccessToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { isValidEmail, isStrongEnoughPassword } from "../utils/validators.js";

function publicUser(u) {
  return {
    id: u._id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    emailVerified: u.emailVerified
  };
}

async function sendVerifyEmail({ email, fullName, token, code }) {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";

 // Link goes directly to backend verify endpoint (works even if frontend has no verify page yet)
const verifyLink =
  `${BACKEND_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;


  const transporter = getMailer();

  // Fallback: if no SMTP, print link/code to console so you can test.
  if (!transporter) {
    console.log(" SMTP not configured. Verification link/code:");
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
    return;
  }

  try {
  const info = await transporter.sendMail({
  from,
  to: email,
  subject: "Verify your DanceTime account",
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Hi ${fullName} 👋</h2>
      <p>Welcome to DanceTime! Please verify your email to activate your account.</p>
      <p>
        <a href="${verifyLink}" style="display:inline-block;padding:10px 16px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px">
          Verify Email
        </a>
      </p>
      <p>Or use this code: <b style="font-size:18px">${code}</b></p>
      <p style="color:#666">This link/code expires in 30 minutes.</p>
    </div>
  `
});

console.log("EMAIL SENT OK");
console.log("messageId:", info.messageId);
console.log("accepted:", info.accepted);
console.log("rejected:", info.rejected);
console.log("response:", info.response);
} catch (err) {
  console.log("⚠️ SMTP error (email not sent). Fallback to console:");
  console.log("   SMTP:", err?.message || err);
  console.log("   LINK:", verifyLink);
  console.log("   CODE:", code);
}

}

export async function register(req, res) {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || String(fullName).trim().length < 2) {
    return res.status(400).json({ message: "Full name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!isStrongEnoughPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const verifyToken = randomToken(32);
  const verifyCode = generate6DigitCode();

  const expires = new Date(Date.now() + 30 * 60 * 1000);

  const user = await User.create({
    fullName: String(fullName).trim(),
    email: String(email).toLowerCase(),
    phone: phone ? String(phone).trim() : null,
    passwordHash,
    emailVerified: false,
    emailVerifyTokenHash: hashToken(verifyToken),
    emailVerifyTokenExpiresAt: expires,
    emailVerifyCodeHash: hashToken(verifyCode),
    emailVerifyCodeExpiresAt: expires
  });

  await sendVerifyEmail({
    email: user.email,
    fullName: user.fullName,
    token: verifyToken,
    code: verifyCode
  });

  return res.status(201).json({
    message: "Registered. Verification email sent.",
    user: publicUser(user)
  });
}

export async function verifyEmailByLink(req, res) {
  const { token, email } = req.query;
  if (!token || !email) return res.status(400).send("Missing token or email");

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).send("User not found");

  if (user.emailVerified) {
    return res.send("Email already verified. You can return to the app and log in.");
  }

  if (!user.emailVerifyTokenHash || !user.emailVerifyTokenExpiresAt) {
    return res.status(400).send("No verification token. Please resend verification.");
  }

  if (new Date() > user.emailVerifyTokenExpiresAt) {
    return res.status(400).send("Verification link expired. Please resend verification.");
  }

  const ok = hashToken(String(token)) === user.emailVerifyTokenHash;
  if (!ok) return res.status(400).send("Invalid verification token");

  user.emailVerified = true;
  user.emailVerifyTokenHash = null;
  user.emailVerifyTokenExpiresAt = null;
  user.emailVerifyCodeHash = null;
  user.emailVerifyCodeExpiresAt = null;
  await user.save();

  return res.send(" Email verified! Go back to the site and log in.");
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
  if (!password) return res.status(400).json({ message: "Password is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Email not verified",
      code: "EMAIL_NOT_VERIFIED"
    });
  }

  const token = signAccessToken(user._id.toString());
  setAuthCookie(res, token);

  return res.json({ message: "Logged in", user: publicUser(user) });
}

export async function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
export async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.emailVerified) {
    return res.json({ message: "Email already verified" });
  }

  const verifyToken = randomToken(32);
  const verifyCode = generate6DigitCode();
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  user.emailVerifyTokenHash = hashToken(verifyToken);
  user.emailVerifyTokenExpiresAt = expires;
  user.emailVerifyCodeHash = hashToken(verifyCode);
  user.emailVerifyCodeExpiresAt = expires;

  await user.save();

  await sendVerifyEmail({
    email: user.email,
    fullName: user.fullName,
    token: verifyToken,
    code: verifyCode
  });

  return res.json({ message: "Verification sent again" });
}
