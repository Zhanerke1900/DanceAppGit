import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import { getEventStartAt } from "../utils/eventDates.js";
import { getMailer, getMailerProvider, getMailFrom } from "../utils/mailer.js";
import { escapeHtml, getEmailCopy, localizeEventForEmail, normalizeEmailLanguage } from "../utils/emailLocale.js";

const DEFAULT_REMINDER_INTERVAL_MS = 15 * 60 * 1000;

function normalizeEventInfo(event = {}, language = "en") {
  const displayEvent = localizeEventForEmail(event, language);
  return {
    title: String(displayEvent.title || "DanceTime Event").trim(),
    date: String(displayEvent.date || "").trim(),
    time: String(displayEvent.time || "").trim(),
    location: String(displayEvent.location || displayEvent.venue || displayEvent.address || "").trim(),
    city: String(displayEvent.city || "").trim(),
  };
}

function eventLine(event = {}) {
  const info = normalizeEventInfo(event);
  return [info.date, info.time].filter(Boolean).join(" - ");
}

function buildEventDetailsHtml(event = {}, language = "en") {
  const copy = getEmailCopy(language);
  const info = normalizeEventInfo(event, language);
  return `
    <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa">
      <p style="margin:0 0 8px"><b>${escapeHtml(copy.event)}:</b> ${escapeHtml(info.title)}</p>
      <p style="margin:0 0 8px"><b>${escapeHtml(copy.date)}:</b> ${escapeHtml(eventLine(info) || "-")}</p>
      <p style="margin:0"><b>${escapeHtml(copy.location)}:</b> ${escapeHtml(info.location || info.city || "-")}</p>
    </div>`;
}

async function sendMail({ label, to, subject, html }) {
  const transporter = getMailer();
  const provider = transporter?.provider || getMailerProvider();
  const from = getMailFrom();

  if (!transporter) {
    console.log(`${label} SMTP NOT CONFIGURED`);
    console.log("   PROVIDER:", provider);
    console.log("   FROM:", from);
    console.log("   TO:", to);
    console.log("   SUBJECT:", subject);
    return false;
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`${label} SENT`);
    console.log("   to:", to);
    console.log("   provider:", info?.provider || provider);
    console.log("   messageId:", info?.messageId);
    return true;
  } catch (error) {
    console.error(`${label} FAILED:`, error?.message || error);
    return false;
  }
}

async function getNotificationRecipientsForEvent(eventId, { remindersOnly = false } = {}) {
  const [tickets, reservations] = await Promise.all([
    Ticket.find({ event: eventId, status: "active" })
      .populate("user", "fullName email language emailNotifications eventReminders accountStatus")
      .select("user userEmail userFullName ticketCode")
      .lean(),
    Order.find({
      event: eventId,
      paymentStatus: "reserved",
      $or: [{ balanceDueDeadlineAt: null }, { balanceDueDeadlineAt: { $gt: new Date() } }],
    })
      .populate("buyer", "fullName email language emailNotifications eventReminders accountStatus")
      .select("buyer buyerEmail buyerName buyerLanguage")
      .lean(),
  ]);

  const recipientsByUser = new Map();
  const addRecipient = ({ user, fallbackEmail, fallbackName, fallbackLanguage, ticketCode }) => {
    const email = String(user?.email || fallbackEmail || "").trim().toLowerCase();
    if (!email || user?.accountStatus === "blocked") return;
    if (user?.emailNotifications === false) return;
    if (remindersOnly && user?.eventReminders === false) return;

    const key = user?._id ? String(user._id) : email;
    const current = recipientsByUser.get(key) || {
      email,
      fullName: user?.fullName || fallbackName || "",
      language: normalizeEmailLanguage(user?.language || fallbackLanguage),
      ticketCodes: [],
    };
    if (ticketCode && !current.ticketCodes.includes(ticketCode)) {
      current.ticketCodes.push(ticketCode);
    }
    recipientsByUser.set(key, current);
  };

  for (const ticket of tickets) {
    addRecipient({
      user: ticket.user,
      fallbackEmail: ticket.userEmail,
      fallbackName: ticket.userFullName,
      ticketCode: ticket.ticketCode,
    });
  }

  for (const order of reservations) {
    addRecipient({
      user: order.buyer,
      fallbackEmail: order.buyerEmail,
      fallbackName: order.buyerName,
      fallbackLanguage: order.buyerLanguage,
    });
  }

  return Array.from(recipientsByUser.values());
}

export function queueEventUpdateNotifications(event, previousEvent = null) {
  setTimeout(() => {
    sendEventUpdateNotifications(event, previousEvent).catch((error) => {
      console.error("Event update notification error:", error?.message || error);
    });
  }, 0);
}

export async function sendEventUpdateNotifications(event, previousEvent = null) {
  if (!event?._id) return { sent: 0, skipped: true };

  const current = normalizeEventInfo(event);
  const previous = previousEvent ? normalizeEventInfo(previousEvent) : null;

  if (
    previous &&
    (String(previous.date || "") !== String(current.date || "") ||
      String(previous.time || "") !== String(current.time || ""))
  ) {
    await Ticket.updateMany(
      { event: event._id, status: "active" },
      { $set: { eventReminderSentAt: null } }
    );
  }

  const recipients = await getNotificationRecipientsForEvent(event._id);
  if (!recipients.length) return { sent: 0, skipped: false };

  const changedRows = previous
    ? [
        ["changedDate", eventLine(previous), eventLine(current)],
        ["changedLocation", previous.location || previous.city, current.location || current.city],
        ["changedTitle", previous.title, current.title],
      ].filter(([, before, after]) => String(before || "") !== String(after || ""))
    : [];

  let sent = 0;
  for (const recipient of recipients) {
    const lang = normalizeEmailLanguage(recipient.language);
    const copy = getEmailCopy(lang);
    const recipientCurrent = normalizeEventInfo(event, lang);
    const recipientPrevious = previousEvent ? normalizeEventInfo(previousEvent, lang) : null;
    const recipientChangedRows = recipientPrevious
      ? [
          ["changedDate", eventLine(recipientPrevious), eventLine(recipientCurrent)],
          ["changedLocation", recipientPrevious.location || recipientPrevious.city, recipientCurrent.location || recipientCurrent.city],
          ["changedTitle", recipientPrevious.title, recipientCurrent.title],
        ].filter(([, before, after]) => String(before || "") !== String(after || ""))
      : changedRows;
    const changesHtml = recipientChangedRows.length
      ? `<ul>${recipientChangedRows
          .map(([labelKey, before, after]) =>
            `<li><b>${escapeHtml(copy[labelKey])}:</b> ${escapeHtml(before || "-")} &rarr; ${escapeHtml(after || "-")}</li>`
          )
          .join("")}</ul>`
      : `<p>${escapeHtml(copy.eventUpdatedFallback)}</p>`;

    const html = `
      <div lang="${lang}" style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2>${escapeHtml(copy.eventUpdateTitle)}</h2>
        <p>${copy.greeting(escapeHtml(recipient.fullName || ""))}! ${copy.eventUpdateIntro(escapeHtml(recipientCurrent.title))}</p>
        ${changesHtml}
        ${buildEventDetailsHtml(event, lang)}
        <p style="color:#666;font-size:12px">${escapeHtml(copy.eventUpdateReason)}</p>
      </div>`;

    const ok = await sendMail({
      label: "EVENT UPDATE EMAIL",
      to: recipient.email,
      subject: copy.eventUpdateSubject(recipientCurrent.title),
      html,
    });
    if (ok) sent += 1;
  }

  return { sent, skipped: false };
}

export async function sendEventReminderEmail({ recipient, event }) {
  const lang = normalizeEmailLanguage(recipient.language);
  const copy = getEmailCopy(lang);
  const current = normalizeEventInfo(event, lang);
  const ticketCodes = recipient.ticketCodes?.length
    ? `<p><b>${escapeHtml(copy.yourTickets(recipient.ticketCodes.length))}:</b> ${recipient.ticketCodes.map(escapeHtml).join(", ")}</p>`
    : "";

  const html = `
    <div lang="${lang}" style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2>${escapeHtml(copy.reminderTitle)}</h2>
      <p>${copy.greeting(escapeHtml(recipient.fullName || ""))}! ${copy.reminderIntro(escapeHtml(current.title))}</p>
      ${buildEventDetailsHtml(event, lang)}
      ${ticketCodes}
      <p>${escapeHtml(copy.keepQrReady)}</p>
      <p style="color:#666;font-size:12px">${escapeHtml(copy.reminderPrefs)}</p>
    </div>`;

  return sendMail({
    label: "EVENT REMINDER EMAIL",
    to: recipient.email,
    subject: copy.reminderSubject(current.title),
    html,
  });
}

export async function sendDueEventReminders({ now = new Date(), windowMs = DEFAULT_REMINDER_INTERVAL_MS } = {}) {
  const upperBound = new Date(now.getTime() + 24 * 60 * 60 * 1000 + Number(windowMs || 0));
  const events = await Event.find({ status: "published" })
    .select("title date time location venue address city")
    .limit(1000)
    .lean();

  const dueEvents = events.filter((event) => {
    const startsAt = getEventStartAt(event);
    return startsAt && startsAt.getTime() > now.getTime() && startsAt.getTime() <= upperBound.getTime();
  });

  let sent = 0;
  let markedTickets = 0;
  for (const event of dueEvents) {
    const tickets = await Ticket.find({
      event: event._id,
      status: "active",
      eventReminderSentAt: null,
    })
      .populate("user", "fullName email language emailNotifications eventReminders accountStatus")
      .select("_id user userEmail userFullName ticketCode")
      .lean();

    const recipientsByUser = new Map();
    for (const ticket of tickets) {
      const user = ticket.user;
      const email = String(user?.email || ticket.userEmail || "").trim().toLowerCase();
      if (!email || user?.accountStatus === "blocked") continue;
      if (user?.emailNotifications === false || user?.eventReminders === false) continue;

      const key = user?._id ? String(user._id) : email;
      const current = recipientsByUser.get(key) || {
        email,
        fullName: user?.fullName || ticket.userFullName || "",
        language: normalizeEmailLanguage(user?.language),
        ticketCodes: [],
        ticketIds: [],
      };
      current.ticketCodes.push(ticket.ticketCode);
      current.ticketIds.push(ticket._id);
      recipientsByUser.set(key, current);
    }

    for (const recipient of recipientsByUser.values()) {
      const ok = await sendEventReminderEmail({ recipient, event });
      if (!ok) continue;

      const result = await Ticket.updateMany(
        { _id: { $in: recipient.ticketIds }, eventReminderSentAt: null },
        { $set: { eventReminderSentAt: new Date() } }
      );
      sent += 1;
      markedTickets += result.modifiedCount || 0;
    }
  }

  return { sent, markedTickets, dueEvents: dueEvents.length };
}

let reminderSweepRunning = false;

export function startEventReminderScheduler() {
  const intervalMs = Number(process.env.EVENT_REMINDER_SWEEP_INTERVAL_MS || DEFAULT_REMINDER_INTERVAL_MS);
  const run = async () => {
    if (reminderSweepRunning) return;
    reminderSweepRunning = true;
    try {
      const result = await sendDueEventReminders({ windowMs: intervalMs });
      if (result.sent || result.markedTickets) {
        console.log(`Event reminders sent: ${result.sent} email(s), ${result.markedTickets} ticket(s) marked`);
      }
    } catch (error) {
      console.error("Event reminder sweep error:", error?.message || error);
    } finally {
      reminderSweepRunning = false;
    }
  };

  const timer = setInterval(run, intervalMs);
  timer.unref?.();
  run();
  return timer;
}
