import { getMailer, getMailerProvider, getMailFrom } from "./mailer.js";

function appUrls() {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  return { BACKEND_URL, FRONTEND_URL };
}

function logMailSuccess(label, email, info, extra = {}) {
  console.log(`${label} SENT`);
  console.log("   to:", email);
  console.log("   messageId:", info?.messageId);
  console.log("   accepted:", info?.accepted);
  console.log("   rejected:", info?.rejected);
  console.log("   response:", info?.response);
  for (const [key, value] of Object.entries(extra)) {
    console.log(`   ${key}:`, value);
  }
}

function logMailFailure(label, err, extra = {}) {
  console.log(`${label} FAILED`);
  console.log("   SMTP:", err?.message || err);
  for (const [key, value] of Object.entries(extra)) {
    console.log(`   ${key}:`, value);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amount, currency = "KZT") {
  const value = Number(amount || 0);
  return `${new Intl.NumberFormat("ru-KZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

export async function sendVerifyEmail({ email, fullName, token, code }) {
  const { FRONTEND_URL } = appUrls();
  const from = getMailFrom();
  const verifyLink =
    `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("VERIFY EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Hi${fullName ? `, ${fullName}` : ""}</h2>
    <p>Confirm your email to activate your DanceTime account.</p>
    <p>
      <a href="${verifyLink}" style="display:inline-block;padding:12px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px">
        Verify email
      </a>
    </p>
    <p>If the button doesn't work, copy this link:</p>
    <p style="word-break:break-all">${verifyLink}</p>
    <p>Your verification code (optional): <b style="font-size:18px">${code}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">If you didn't request this, ignore the email.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your DanceTime email",
      html,
    });
    logMailSuccess("VERIFY EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      LINK: verifyLink,
      CODE: code,
    });
  } catch (err) {
    logMailFailure("VERIFY EMAIL", err, { PROVIDER: provider, FROM: from, LINK: verifyLink, CODE: code });
  }
}

export async function sendResetEmail({ email, fullName, token, code }) {
  const { FRONTEND_URL } = appUrls();
  const from = getMailFrom();
  const resetLink =
    `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("RESET EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   RESET LINK:", resetLink);
    console.log("   RESET CODE:", code);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Password reset</h2>
    <p>Hi${fullName ? `, ${fullName}` : ""}! You requested a password reset.</p>
    <p>
      <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px">
        Reset password
      </a>
    </p>
    <p>If the button doesn't work, copy this link:</p>
    <p style="word-break:break-all">${resetLink}</p>
    <p>Your reset code (optional): <b style="font-size:18px">${code}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">If you didn't request this, ignore the email.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your DanceTime password",
      html,
    });
    logMailSuccess("RESET EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      RESET_LINK: resetLink,
      RESET_CODE: code,
    });
  } catch (err) {
    logMailFailure("RESET EMAIL", err, { PROVIDER: provider, FROM: from, RESET_LINK: resetLink, RESET_CODE: code });
  }
}

export async function sendValidatorInviteEmail({ email, fullName, token, code, organizerName }) {
  const { FRONTEND_URL } = appUrls();
  const from = getMailFrom();
  const verifyLink =
    `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("VALIDATOR INVITE SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Hello${fullName ? `, ${fullName}` : ""}</h2>
    <p>${organizerName ? `<b>${organizerName}</b> has created a validator account for you on DanceTime.` : "A validator account has been created for you on DanceTime."}</p>
    <p>Please activate your email to start using the validator dashboard and ticket validation tools.</p>
    <p>
      <a href="${verifyLink}" style="display:inline-block;padding:12px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px">
        Activate validator account
      </a>
    </p>
    <p>If the button doesn't work, copy this link:</p>
    <p style="word-break:break-all">${verifyLink}</p>
    <p>Your activation code (optional): <b style="font-size:18px">${code}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">If you were not expecting this invitation, you can safely ignore this email.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Activate your DanceTime validator account",
      html,
    });
    logMailSuccess("VALIDATOR INVITE", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      LINK: verifyLink,
      CODE: code,
    });
  } catch (err) {
    logMailFailure("VALIDATOR INVITE", err, { PROVIDER: provider, FROM: from, LINK: verifyLink, CODE: code });
  }
}

export async function sendPasswordChangedEmail({ email, fullName }) {
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("PASSWORD CHANGED SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Password changed</h2>
    <p>Hi${fullName ? `, ${fullName}` : ""}! Your DanceTime password was changed successfully.</p>
    <p>If this was you, no further action is needed.</p>
    <p>If you did not change your password, please reset it immediately and review your account access.</p>
    <hr />
    <p style="color:#666;font-size:12px">This is a security notification from DanceTime.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Your DanceTime password was changed",
      html,
    });
    logMailSuccess("PASSWORD CHANGED EMAIL", email, info, { PROVIDER: info?.provider || provider, FROM: from });
  } catch (err) {
    logMailFailure("PASSWORD CHANGED EMAIL", err, { PROVIDER: provider, FROM: from, EMAIL: email });
  }
}

export async function sendRefundEmail({ email, fullName, ticketCode, ticketType, event }) {
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("REFUND EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    console.log("   TICKET:", ticketCode);
    return false;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Refund confirmed</h2>
    <p>Hi${fullName ? `, ${fullName}` : ""}! Your ticket refund was successfully requested.</p>
    <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
      <p style="margin:0 0 8px"><b>Event:</b> ${event?.title || "DanceTime Event"}</p>
      <p style="margin:0 0 8px"><b>Date:</b> ${event?.date || "-"}</p>
      <p style="margin:0 0 8px"><b>Location:</b> ${event?.location || "-"}</p>
      <p style="margin:0 0 8px"><b>Ticket Type:</b> ${ticketType || "-"}</p>
      <p style="margin:0"><b>Ticket Code:</b> ${ticketCode || "-"}</p>
    </div>
    <p>The refund is being processed. The money for your ticket should arrive within <b>3 business days</b>.</p>
    <hr />
    <p style="color:#666;font-size:12px">This is an automatic notification from DanceTime.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Your DanceTime refund is being processed",
      html,
    });
    logMailSuccess("REFUND EMAIL", email, info, { PROVIDER: info?.provider || provider, FROM: from });
    return true;
  } catch (err) {
    logMailFailure("REFUND EMAIL", err, { PROVIDER: provider, FROM: from, EMAIL: email, TICKET: ticketCode });
    return false;
  }
}

export async function sendEventCancelledEmail({
  email,
  fullName,
  event,
  ticketCodes = [],
  refundedAmount = 0,
  currency = "KZT",
  orderId,
}) {
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();
  const safeEventTitle = escapeHtml(event?.title || "DanceTime Event");
  const safeCodes = ticketCodes.length
    ? ticketCodes.map((code) => `<li>${escapeHtml(code)}</li>`).join("")
    : "<li>Reservation / booking</li>";

  if (!transporter) {
    console.log("EVENT CANCELLATION EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    console.log("   EVENT:", event?.title || "");
    console.log("   ORDER:", orderId || "");
    return false;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Event cancelled</h2>
    <p>Hi${fullName ? `, ${escapeHtml(fullName)}` : ""}. Unfortunately, <b>${safeEventTitle}</b> has been cancelled by the organizer.</p>
    <div style="margin:16px 0;padding:16px;border:1px solid #fecaca;border-radius:12px;background:#fff7f7">
      <p style="margin:0 0 8px"><b>Event:</b> ${safeEventTitle}</p>
      <p style="margin:0 0 8px"><b>Date:</b> ${escapeHtml(event?.date || "-")}</p>
      <p style="margin:0 0 8px"><b>Time:</b> ${escapeHtml(event?.time || "-")}</p>
      <p style="margin:0"><b>Location:</b> ${escapeHtml(event?.location || "-")}</p>
    </div>
    <p>Your ticket${ticketCodes.length === 1 ? "" : "s"} / booking:</p>
    <ul>${safeCodes}</ul>
    <p>A refund of <b>${formatMoney(refundedAmount, currency)}</b> has been requested through the payment provider.</p>
    <p>The money should arrive within <b>3 business days</b>, depending on your bank.</p>
    <hr />
    <p style="color:#666;font-size:12px">This is an automatic notification from DanceTime.</p>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `DanceTime event cancelled: ${event?.title || "Event"}`,
      html,
    });
    logMailSuccess("EVENT CANCELLATION EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      EVENT: event?.title || "",
      ORDER: orderId || "",
    });
    return true;
  } catch (err) {
    logMailFailure("EVENT CANCELLATION EMAIL", err, {
      PROVIDER: provider,
      FROM: from,
      EMAIL: email,
      EVENT: event?.title || "",
      ORDER: orderId || "",
    });
    return false;
  }
}
