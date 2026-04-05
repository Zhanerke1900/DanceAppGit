import { getMailer } from "./mailer.js";

function appUrls() {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  return { BACKEND_URL, FRONTEND_URL };
}

export async function sendVerifyEmail({ email, fullName, token, code }) {
  const { FRONTEND_URL } = appUrls();
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";

  // ✅ ВАЖНО: ссылка на ФРОНТ
  const verifyLink =
    `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();

  // если SMTP не настроен — НЕ КРАШИМ сервер
  if (!transporter) {
    console.log("⚠️ SMTP not configured. Fallback to console:");
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
    return;
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Hi${fullName ? `, ${fullName}` : ""} 👋</h2>
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
    <p style="color:#666;font-size:12px">If you didn’t request this, ignore the email.</p>
  </div>`;

  try {
    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your DanceTime email",
      html,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (err) {
    console.log("⚠️ SMTP error (email not sent). Fallback to console:");
    console.log("   SMTP:", err?.message || err);
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
  }
}

export async function sendResetEmail({ email, fullName, token, code }) {
  const { FRONTEND_URL } = appUrls();
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";

  // ✅ ссылка на ФРОНТ
  const resetLink =
    `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();

  if (!transporter) {
    console.log("⚠️ SMTP not configured. Fallback to console:");
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
    <p style="color:#666;font-size:12px">If you didn’t request this, ignore the email.</p>
  </div>`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your DanceTime password",
      html,
    });
  } catch (err) {
    console.log("⚠️ SMTP error (reset email not sent). Fallback to console:");
    console.log("   SMTP:", err?.message || err);
    console.log("   RESET LINK:", resetLink);
    console.log("   RESET CODE:", code);
  }
}

export async function sendValidatorInviteEmail({ email, fullName, token, code, organizerName }) {
  const { FRONTEND_URL } = appUrls();
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";

  const verifyLink =
    `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const transporter = getMailer();

  if (!transporter) {
    console.log("SMTP not configured. Validator invite fallback to console:");
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
    await transporter.sendMail({
      from,
      to: email,
      subject: "Activate your DanceTime validator account",
      html,
    });
  } catch (err) {
    console.log("SMTP error (validator invite email not sent). Fallback to console:");
    console.log("   SMTP:", err?.message || err);
    console.log("   LINK:", verifyLink);
    console.log("   CODE:", code);
  }
}

export async function sendPasswordChangedEmail({ email, fullName }) {
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";
  const transporter = getMailer();

  if (!transporter) {
    console.log("⚠️ SMTP not configured. Password changed email skipped.");
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
    await transporter.sendMail({
      from,
      to: email,
      subject: "Your DanceTime password was changed",
      html,
    });
  } catch (err) {
    console.log("⚠️ SMTP error (password changed email not sent).");
    console.log("   SMTP:", err?.message || err);
    console.log("   EMAIL:", email);
  }
}

export async function sendRefundEmail({ email, fullName, ticketCode, ticketType, event }) {
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";
  const transporter = getMailer();

  if (!transporter) {
    console.log("SMTP not configured. Refund email skipped.");
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
    await transporter.sendMail({
      from,
      to: email,
      subject: "Your DanceTime refund is being processed",
      html,
    });
    return true;
  } catch (err) {
    console.log("SMTP error (refund email not sent).");
    console.log("   SMTP:", err?.message || err);
    console.log("   EMAIL:", email);
    console.log("   TICKET:", ticketCode);
    return false;
  }
}
