import Event from "../models/Event.js";

const MONTH_INDEX = new Map(
  [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].map((month, index) => [month, index])
);

const ARCHIVE_GRACE_HOURS = Number(process.env.EVENT_ARCHIVE_GRACE_HOURS || 6);

function localDate(year, monthIndex, day, time = {}) {
  const hour = Number.isFinite(time.hour) ? time.hour : 0;
  const minute = Number.isFinite(time.minute) ? time.minute : 0;
  const second = Number.isFinite(time.second) ? time.second : 0;
  const millisecond = Number.isFinite(time.millisecond) ? time.millisecond : 0;
  return new Date(Number(year), Number(monthIndex), Number(day), hour, minute, second, millisecond);
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addHours(date, hours) {
  return new Date(date.getTime() + Number(hours || 0) * 60 * 60 * 1000);
}

function parseTimeParts(value, mode = "start") {
  const matches = String(value || "").match(/\b(\d{1,2}):(\d{2})\b/g);
  if (!matches?.length) return null;

  const selected = mode === "end" ? matches[matches.length - 1] : matches[0];
  const [, hour, minute] = selected.match(/(\d{1,2}):(\d{2})/) || [];
  const normalizedHour = Number(hour);
  const normalizedMinute = Number(minute);

  if (normalizedHour > 23 || normalizedMinute > 59) return null;
  return { hour: normalizedHour, minute: normalizedMinute };
}

function parseDateRange(value = "") {
  const rawDate = String(value || "").trim();
  if (!rawDate) return null;

  const isoRange = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})\s*-\s*(\d{4})-(\d{2})-(\d{2})$/);
  if (isoRange) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = isoRange;
    const startMonthIndex = Number(startMonth) - 1;
    const endMonthIndex = Number(endMonth) - 1;
    if (startMonthIndex < 0 || startMonthIndex > 11 || endMonthIndex < 0 || endMonthIndex > 11) return null;
    return {
      start: { year: Number(startYear), monthIndex: startMonthIndex, day: Number(startDay) },
      end: { year: Number(endYear), monthIndex: endMonthIndex, day: Number(endDay) },
    };
  }

  const iso = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    const monthIndex = Number(month) - 1;
    if (monthIndex < 0 || monthIndex > 11) return null;
    return {
      start: { year: Number(year), monthIndex, day: Number(day) },
      end: { year: Number(year), monthIndex, day: Number(day) },
    };
  }

  const sameMonthRange = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),\s*(\d{4})$/);
  if (sameMonthRange) {
    const [, monthName, startDay, endDay, year] = sameMonthRange;
    const monthIndex = MONTH_INDEX.get(monthName.toLowerCase());
    if (monthIndex === undefined) return null;
    return {
      start: { year: Number(year), monthIndex, day: Number(startDay) },
      end: { year: Number(year), monthIndex, day: Number(endDay) },
    };
  }

  const singleEnglishDate = rawDate.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (singleEnglishDate) {
    const [, monthName, day, year] = singleEnglishDate;
    const monthIndex = MONTH_INDEX.get(monthName.toLowerCase());
    if (monthIndex === undefined) return null;
    return {
      start: { year: Number(year), monthIndex, day: Number(day) },
      end: { year: Number(year), monthIndex, day: Number(day) },
    };
  }

  const direct = new Date(rawDate);
  if (!Number.isNaN(direct.getTime())) {
    return {
      start: { year: direct.getFullYear(), monthIndex: direct.getMonth(), day: direct.getDate() },
      end: { year: direct.getFullYear(), monthIndex: direct.getMonth(), day: direct.getDate() },
    };
  }

  return null;
}

export function getEventStartAt(event = {}) {
  // Приводит date/time события к Date, чтобы сортировать, архивировать и считать deadlines.
  const range = parseDateRange(event.date);
  if (!range) return null;

  const time = parseTimeParts(event.time, "start") || { hour: 0, minute: 0 };
  const date = localDate(range.start.year, range.start.monthIndex, range.start.day, time);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getEventEndAt(event = {}) {
  // Конец события нужен для archive. Если времени конца нет, берем конец дня.
  const range = parseDateRange(event.date);
  if (!range) return null;

  const time = parseTimeParts(event.time, "end");
  const base = localDate(range.end.year, range.end.monthIndex, range.end.day, time || {});
  if (Number.isNaN(base.getTime())) return null;

  if (!time) return endOfDay(base);

  const startTime = parseTimeParts(event.time, "start");
  const endTimeText = String(event.time || "");
  const crossesMidnight =
    startTime &&
    /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/.test(endTimeText) &&
    (time.hour < startTime.hour || (time.hour === startTime.hour && time.minute <= startTime.minute));

  return addHours(crossesMidnight ? addHours(base, 24) : base, ARCHIVE_GRACE_HOURS);
}

export function isEventPast(event = {}, now = new Date()) {
  const eventEnd = getEventEndAt(event);
  if (!eventEnd || Number.isNaN(eventEnd.getTime())) return false;
  return eventEnd.getTime() < now.getTime();
}

export async function archivePastPublishedEvents(filter = {}) {
  // Published events, которые уже прошли, автоматически уходят в archived и исчезают из marketplace.
  const events = await Event.find({ ...filter, status: "published" }).select("_id date time").lean();
  const pastIds = events.filter((event) => isEventPast(event)).map((event) => event._id);

  if (!pastIds.length) return { archivedCount: 0 };

  const result = await Event.updateMany(
    { _id: { $in: pastIds }, status: "published" },
    { $set: { status: "archived" } }
  );

  return { archivedCount: result.modifiedCount || 0 };
}
