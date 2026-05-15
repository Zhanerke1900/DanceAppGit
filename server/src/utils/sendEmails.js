import { getMailer, getMailerProvider, getMailFrom } from "./mailer.js";
import {
  escapeHtml,
  formatMoneyForEmail,
  getEmailCopy,
  localizeEventForEmail,
  normalizeEmailLanguage,
} from "./emailLocale.js";

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

function emailShell(language, body) {
  return `
  <div lang="${language}" style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
    ${body}
  </div>`;
}

function actionButton(href, label) {
  const safeHref = escapeHtml(href);
  return `
    <p>
      <a href="${safeHref}" style="display:inline-block;padding:12px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px">
        ${escapeHtml(label)}
      </a>
    </p>`;
}

function detailLine(label, value, isLast = false) {
  return `<p style="margin:0${isLast ? "" : " 0 8px"}"><b>${escapeHtml(label)}:</b> ${escapeHtml(value || "-")}</p>`;
}

function greeting(copy, fullName) {
  return `${copy.greeting(escapeHtml(fullName || ""))}!`;
}

export async function sendVerifyEmail({ email, fullName, token, code, language = "en" }) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
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
    console.log("   LANGUAGE:", lang);
    return;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.verifyTitle)}</h2>
    <p>${greeting(copy, fullName)}</p>
    <p>${escapeHtml(copy.verifyIntro)}</p>
    ${actionButton(verifyLink, copy.verifyButton)}
    <p>${escapeHtml(copy.copyLink)}</p>
    <p style="word-break:break-all">${escapeHtml(verifyLink)}</p>
    <p>${escapeHtml(copy.verifyCode)} <b style="font-size:18px">${escapeHtml(code)}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.ignore)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.verifySubject,
      html,
    });
    logMailSuccess("VERIFY EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      LINK: verifyLink,
      CODE: code,
      LANGUAGE: lang,
    });
  } catch (err) {
    logMailFailure("VERIFY EMAIL", err, { PROVIDER: provider, FROM: from, LINK: verifyLink, CODE: code, LANGUAGE: lang });
  }
}

export async function sendResetEmail({ email, fullName, token, code, language = "en" }) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
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
    console.log("   LANGUAGE:", lang);
    return;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.resetTitle)}</h2>
    <p>${greeting(copy, fullName)} ${escapeHtml(copy.resetIntro)}</p>
    ${actionButton(resetLink, copy.resetButton)}
    <p>${escapeHtml(copy.copyLink)}</p>
    <p style="word-break:break-all">${escapeHtml(resetLink)}</p>
    <p>${escapeHtml(copy.resetCode)} <b style="font-size:18px">${escapeHtml(code)}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.ignore)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.resetSubject,
      html,
    });
    logMailSuccess("RESET EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      RESET_LINK: resetLink,
      RESET_CODE: code,
      LANGUAGE: lang,
    });
  } catch (err) {
    logMailFailure("RESET EMAIL", err, { PROVIDER: provider, FROM: from, RESET_LINK: resetLink, RESET_CODE: code, LANGUAGE: lang });
  }
}

export async function sendValidatorInviteEmail({
  email,
  fullName,
  token,
  code,
  organizerName,
  language = "en",
}) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
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
    console.log("   LANGUAGE:", lang);
    return;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.validatorTitle)}</h2>
    <p>${greeting(copy, fullName)}</p>
    <p>${copy.validatorIntro(escapeHtml(organizerName || ""))}</p>
    <p>${escapeHtml(copy.validatorActionIntro)}</p>
    ${actionButton(verifyLink, copy.validatorButton)}
    <p>${escapeHtml(copy.copyLink)}</p>
    <p style="word-break:break-all">${escapeHtml(verifyLink)}</p>
    <p>${escapeHtml(copy.validatorCode)} <b style="font-size:18px">${escapeHtml(code)}</b></p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.validatorIgnore)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.validatorSubject,
      html,
    });
    logMailSuccess("VALIDATOR INVITE", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      LINK: verifyLink,
      CODE: code,
      LANGUAGE: lang,
    });
  } catch (err) {
    logMailFailure("VALIDATOR INVITE", err, { PROVIDER: provider, FROM: from, LINK: verifyLink, CODE: code, LANGUAGE: lang });
  }
}

export async function sendPasswordChangedEmail({ email, fullName, language = "en" }) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("PASSWORD CHANGED SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    console.log("   LANGUAGE:", lang);
    return;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.passwordChangedTitle)}</h2>
    <p>${greeting(copy, fullName)} ${escapeHtml(copy.passwordChangedIntro)}</p>
    <p>${escapeHtml(copy.passwordChangedOk)}</p>
    <p>${escapeHtml(copy.passwordChangedWarning)}</p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.securityNotice)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.passwordChangedSubject,
      html,
    });
    logMailSuccess("PASSWORD CHANGED EMAIL", email, info, { PROVIDER: info?.provider || provider, FROM: from, LANGUAGE: lang });
  } catch (err) {
    logMailFailure("PASSWORD CHANGED EMAIL", err, { PROVIDER: provider, FROM: from, EMAIL: email, LANGUAGE: lang });
  }
}

export async function sendRefundEmail({ email, fullName, ticketCode, ticketType, event, language = "en" }) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
  const displayEvent = localizeEventForEmail(event, lang);
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();

  if (!transporter) {
    console.log("REFUND EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    console.log("   TICKET:", ticketCode);
    console.log("   LANGUAGE:", lang);
    return false;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.refundTitle)}</h2>
    <p>${greeting(copy, fullName)} ${escapeHtml(copy.refundIntro)}</p>
    <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
      ${detailLine(copy.event, displayEvent?.title || "DanceTime Event")}
      ${detailLine(copy.date, displayEvent?.date || "-")}
      ${detailLine(copy.location, displayEvent?.location || "-")}
      ${detailLine(copy.ticketType, ticketType || "-")}
      ${detailLine(copy.ticketCode, ticketCode || "-", true)}
    </div>
    <p>${copy.refundProcessing}</p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.automaticNotice)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.refundSubject,
      html,
    });
    logMailSuccess("REFUND EMAIL", email, info, { PROVIDER: info?.provider || provider, FROM: from, LANGUAGE: lang });
    return true;
  } catch (err) {
    logMailFailure("REFUND EMAIL", err, { PROVIDER: provider, FROM: from, EMAIL: email, TICKET: ticketCode, LANGUAGE: lang });
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
  language = "en",
}) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
  const from = getMailFrom();
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();
  const displayEvent = localizeEventForEmail(event, lang);
  const eventTitle = displayEvent?.title || "DanceTime Event";
  const safeEventTitle = escapeHtml(eventTitle);
  const safeCodes = ticketCodes.length
    ? ticketCodes.map((code) => `<li>${escapeHtml(code)}</li>`).join("")
    : `<li>${escapeHtml(copy.bookingFallback)}</li>`;

  if (!transporter) {
    console.log("EVENT CANCELLATION EMAIL SMTP NOT CONFIGURED");
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   EMAIL:", email);
    console.log("   EVENT:", eventTitle);
    console.log("   ORDER:", orderId || "");
    console.log("   LANGUAGE:", lang);
    return false;
  }

  const html = emailShell(lang, `
    <h2>${escapeHtml(copy.cancelledTitle)}</h2>
    <p>${greeting(copy, fullName)} ${copy.cancelledIntro(safeEventTitle)}</p>
    <div style="margin:16px 0;padding:16px;border:1px solid #fecaca;border-radius:12px;background:#fff7f7">
      ${detailLine(copy.event, eventTitle)}
      ${detailLine(copy.date, displayEvent?.date || "-")}
      ${detailLine(copy.time, displayEvent?.time || "-")}
      ${detailLine(copy.location, displayEvent?.location || "-", true)}
    </div>
    <p>${escapeHtml(copy.bookingLabel(ticketCodes.length))}</p>
    <ul>${safeCodes}</ul>
    <p>${copy.refundRequested(formatMoneyForEmail(refundedAmount, currency, lang))}</p>
    <p>${copy.refundTimeline}</p>
    <hr />
    <p style="color:#666;font-size:12px">${escapeHtml(copy.automaticNotice)}</p>
  `);

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: copy.cancelledSubject(eventTitle),
      html,
    });
    logMailSuccess("EVENT CANCELLATION EMAIL", email, info, {
      PROVIDER: info?.provider || provider,
      FROM: from,
      EVENT: eventTitle,
      ORDER: orderId || "",
      LANGUAGE: lang,
    });
    return true;
  } catch (err) {
    logMailFailure("EVENT CANCELLATION EMAIL", err, {
      PROVIDER: provider,
      FROM: from,
      EMAIL: email,
      EVENT: eventTitle,
      ORDER: orderId || "",
      LANGUAGE: lang,
    });
    return false;
  }
}
