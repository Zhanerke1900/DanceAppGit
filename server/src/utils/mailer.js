import nodemailer from "nodemailer";
import { Resend } from "resend";

const DEFAULT_FROM = "DanceTime <no-reply@dance.local>";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function isEnabled(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return TRUE_VALUES.has(String(value).trim().toLowerCase());
}

function normalizeProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gmail" || normalized === "resend" || normalized === "smtp" || normalized === "log" || normalized === "auto") {
    return normalized;
  }
  return "";
}

function getRequestedProvider() {
  return normalizeProvider(process.env.MAIL_PROVIDER || process.env.EMAIL_PROVIDER);
}

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isGmailConfigured() {
  return Boolean(
    process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      process.env.GMAIL_SENDER
  );
}

function getGmailFrom() {
  if (!process.env.GMAIL_SENDER) return "";
  return process.env.GMAIL_FROM || `DanceTime <${process.env.GMAIL_SENDER}>`;
}

function isRailwayRuntime() {
  return Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID);
}

function shouldLogMailCopy() {
  return isEnabled(process.env.MAIL_LOG_COPY, isRailwayRuntime());
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

function stripHeaderBreaks(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function encodeHeader(value) {
  const cleanValue = stripHeaderBreaks(value);
  if (/^[\x20-\x7E]*$/.test(cleanValue)) return cleanValue;
  return `=?UTF-8?B?${Buffer.from(cleanValue, "utf8").toString("base64")}?=`;
}

function encodeBase64Lines(value) {
  const base64 = Buffer.isBuffer(value)
    ? value.toString("base64")
    : Buffer.from(String(value || ""), "utf8").toString("base64");
  return base64.match(/.{1,76}/g)?.join("\r\n") || "";
}

function encodeBase64Url(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function makeBoundary(label) {
  return `----=_DanceTime_${label}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function contentTypeFromFilename(filename = "") {
  const lowerFilename = String(filename).toLowerCase();
  if (lowerFilename.endsWith(".png")) return "image/png";
  if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) return "image/jpeg";
  if (lowerFilename.endsWith(".gif")) return "image/gif";
  if (lowerFilename.endsWith(".pdf")) return "application/pdf";
  if (lowerFilename.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function clipForLogs(value, maxLength = 12000) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n...[truncated ${text.length - maxLength} chars]`;
}

function summarizeAttachments(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];

  return attachments.map((attachment) => ({
    filename: attachment?.filename || null,
    contentId: attachment?.contentId || attachment?.cid || null,
    hasPath: Boolean(attachment?.path),
    hasContent: Boolean(attachment?.content),
    size: Buffer.isBuffer(attachment?.content) ? attachment.content.length : undefined,
  }));
}

function extractMailLinks(options = {}) {
  const source = [options.text, options.html].filter(Boolean).join("\n");
  const matches = source.match(/https?:\/\/[^\s"'<>]+/g) || [];

  return Array.from(
    new Set(
      matches
        .map((url) => url.replace(/&amp;/g, "&").replace(/[),.;]+$/g, ""))
        .filter(Boolean)
    )
  );
}

export function getMailFrom() {
  const requested = getRequestedProvider();
  const gmailFrom = getGmailFrom();
  if (requested === "gmail" && gmailFrom) return gmailFrom;
  if (isGmailConfigured() && gmailFrom && requested !== "resend" && requested !== "smtp") return gmailFrom;
  if (requested === "smtp") return process.env.SMTP_FROM || gmailFrom || process.env.RESEND_FROM || DEFAULT_FROM;
  if (requested === "resend") return process.env.RESEND_FROM || gmailFrom || process.env.SMTP_FROM || DEFAULT_FROM;
  return process.env.RESEND_FROM || process.env.SMTP_FROM || DEFAULT_FROM;
}

export function getMailerProvider() {
  const requested = getRequestedProvider();

  if (requested === "log") return "log";
  if (requested === "gmail" && isGmailConfigured()) return "gmail";
  if (requested === "resend" && process.env.RESEND_API_KEY) return "resend";
  if (requested === "smtp" && isSmtpConfigured()) return "smtp";

  if (isGmailConfigured()) return "gmail";
  if (process.env.RESEND_API_KEY) return "resend";
  if (isSmtpConfigured()) return "smtp";
  return "none";
}

async function getGmailAccessToken() {
  const response = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || "Gmail access token request failed");
  }

  return data.access_token;
}

function makeTextPart(contentType, value) {
  return [
    `Content-Type: ${contentType}; charset="UTF-8"`,
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(value),
  ].join("\r\n");
}

function makeBodyPart(options = {}) {
  const text = options.text || "";
  const html = options.html || "";

  if (text && html) {
    const boundary = makeBoundary("alternative");
    return [
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      makeTextPart("text/plain", text),
      `--${boundary}`,
      makeTextPart("text/html", html),
      `--${boundary}--`,
    ].join("\r\n");
  }

  if (html) return makeTextPart("text/html", html);
  return makeTextPart("text/plain", text || " ");
}

function makeAttachmentPart(attachment = {}) {
  const filename = stripHeaderBreaks(attachment.filename || "attachment");
  const contentId = stripHeaderBreaks(attachment.contentId || attachment.cid || "");
  const contentType = attachment.contentType || contentTypeFromFilename(filename);
  const disposition = contentId ? "inline" : "attachment";
  const content = Buffer.isBuffer(attachment.content)
    ? attachment.content
    : Buffer.from(attachment.content || "", "utf8");

  return [
    `Content-Type: ${contentType}; name="${filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: ${disposition}; filename="${filename}"`,
    contentId ? `Content-ID: <${contentId}>` : null,
    "",
    encodeBase64Lines(content),
  ]
    .filter((line) => line !== null)
    .join("\r\n");
}

function makeGmailRawMessage(options = {}) {
  const recipients = toList(options.to).map(stripHeaderBreaks);
  const cc = toList(options.cc).map(stripHeaderBreaks);
  const bcc = toList(options.bcc).map(stripHeaderBreaks);
  const attachments = Array.isArray(options.attachments) ? options.attachments : [];
  const from = stripHeaderBreaks(options.from || getMailFrom());

  if (!recipients.length) {
    throw new Error("Gmail email requires at least one recipient");
  }

  const headers = [
    `From: ${from}`,
    `To: ${recipients.join(", ")}`,
    cc.length ? `Cc: ${cc.join(", ")}` : "",
    bcc.length ? `Bcc: ${bcc.join(", ")}` : "",
    options.replyTo ? `Reply-To: ${stripHeaderBreaks(options.replyTo)}` : "",
    `Subject: ${encodeHeader(options.subject || "")}`,
    "MIME-Version: 1.0",
  ].filter(Boolean);

  let body = makeBodyPart(options);
  if (attachments.length) {
    const hasInlineAttachments = attachments.some((attachment) => attachment?.contentId || attachment?.cid);
    const multipartType = hasInlineAttachments ? "related" : "mixed";
    const boundary = makeBoundary(multipartType);
    body = [
      `Content-Type: multipart/${multipartType}; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      makeBodyPart(options),
      ...attachments.flatMap((attachment) => [`--${boundary}`, makeAttachmentPart(attachment)]),
      `--${boundary}--`,
    ].join("\r\n");
  }

  return `${headers.join("\r\n")}\r\n${body}`;
}

function createGmailMailer() {
  if (!isGmailConfigured()) return null;

  return {
    provider: "gmail",
    async sendMail(options = {}) {
      const recipients = toList(options.to);
      const accessToken = await getGmailAccessToken();
      const raw = encodeBase64Url(makeGmailRawMessage(options));

      const response = await fetch(GMAIL_SEND_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || "Gmail API email send failed");
      }

      return {
        provider: "gmail",
        messageId: data?.id || null,
        accepted: recipients,
        rejected: [],
        response: data?.threadId ? `${data.id} thread=${data.threadId}` : data?.id || "sent",
      };
    },
  };
}

function createResendMailer() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const resend = new Resend(apiKey);

  return {
    provider: "resend",
    async sendMail(options = {}) {
      const recipients = toList(options.to);
      const ccList = toList(options.cc);
      const bccList = toList(options.bcc);

      const attachments = Array.isArray(options.attachments)
        ? options.attachments.map((attachment) => ({
            filename: attachment.filename,
            path: attachment.path,
            content: attachment.content,
            contentId: attachment.contentId || attachment.cid,
          }))
        : undefined;

      const payload = {
        from: options.from || getMailFrom(),
        to: recipients,
        cc: ccList.length ? ccList : undefined,
        bcc: bccList.length ? bccList : undefined,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments,
      };

      const { data, error } = await resend.emails.send(payload);
      if (error) {
        throw new Error(error.message || "Resend email send failed");
      }

      return {
        provider: "resend",
        messageId: data?.id || null,
        accepted: recipients,
        rejected: [],
        response: data?.id || "queued",
      };
    },
  };
}

function createSmtpMailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return {
    provider: "smtp",
    async sendMail(options = {}) {
      const info = await transport.sendMail(options);
      return {
        provider: "smtp",
        ...info,
      };
    },
  };
}

function createLogMailer(reason = "MAIL_PROVIDER=log") {
  return {
    provider: "log",
    async sendMail(options = {}) {
      const recipients = toList(options.to);
      const cc = toList(options.cc);
      const bcc = toList(options.bcc);
      const html = clipForLogs(options.html);
      const text = clipForLogs(options.text);
      const attachments = summarizeAttachments(options.attachments);
      const links = extractMailLinks(options);

      console.log("MAIL LOG DELIVERY");
      console.log("   provider:", "log");
      console.log("   reason:", reason);
      console.log("   from:", options.from || getMailFrom());
      console.log("   to:", recipients);
      if (cc.length) console.log("   cc:", cc);
      if (bcc.length) console.log("   bcc:", bcc);
      if (options.replyTo) console.log("   replyTo:", options.replyTo);
      if (options.subject) console.log("   subject:", options.subject);
      links.forEach((link, index) => {
        console.log(`   LINK_${index + 1}:`, link);
      });
      if (text) {
        console.log("   text:");
        console.log(text);
      }
      if (html) {
        console.log("   html:");
        console.log(html);
      }
      if (attachments.length) {
        console.log("   attachments:", attachments);
      }
      console.log("MAIL LOG DELIVERY END");

      return {
        provider: "log",
        messageId: `log-${Date.now()}`,
        accepted: recipients,
        rejected: [],
        response: `logged-to-console (${reason})`,
      };
    },
  };
}

function withLogFallback(mailer, provider) {
  if (!mailer) return null;
  if (!isEnabled(process.env.MAIL_LOG_FALLBACK, true)) return mailer;

  return {
    provider,
    async sendMail(options = {}) {
      try {
        const info = await mailer.sendMail(options);
        if (shouldLogMailCopy()) {
          await createLogMailer(`${provider} send copy`).sendMail(options);
        }
        return {
          ...info,
          provider: info?.provider || provider,
        };
      } catch (error) {
        const reason = `${provider} send failed: ${error?.message || error}`;
        console.error(`[MAILER] ${reason}`);
        const fallbackInfo = await createLogMailer(reason).sendMail(options);

        return {
          ...fallbackInfo,
          provider: "log",
          fallbackFrom: provider,
          fallbackError: error?.message || String(error),
          response: `${fallbackInfo.response}; fallback-from=${provider}`,
        };
      }
    },
  };
}

export function getMailer() {
  const requested = getRequestedProvider();
  const gmailMailer = createGmailMailer();
  const resendMailer = createResendMailer();
  const smtpMailer = createSmtpMailer();
  const logFallbackEnabled = isEnabled(process.env.MAIL_LOG_FALLBACK, true);

  if (requested === "log") {
    return createLogMailer("MAIL_PROVIDER=log");
  }

  if (requested === "gmail") {
    return withLogFallback(gmailMailer, "gmail") || withLogFallback(resendMailer, "resend") || withLogFallback(smtpMailer, "smtp") || (logFallbackEnabled ? createLogMailer("MAIL_PROVIDER=gmail but no provider configured") : null);
  }

  if (requested === "resend") {
    return withLogFallback(resendMailer, "resend") || withLogFallback(smtpMailer, "smtp") || (logFallbackEnabled ? createLogMailer("MAIL_PROVIDER=resend but no provider configured") : null);
  }

  if (requested === "smtp") {
    return withLogFallback(smtpMailer, "smtp") || withLogFallback(resendMailer, "resend") || (logFallbackEnabled ? createLogMailer("MAIL_PROVIDER=smtp but no provider configured") : null);
  }

  return withLogFallback(gmailMailer, "gmail") || withLogFallback(resendMailer, "resend") || withLogFallback(smtpMailer, "smtp") || (logFallbackEnabled ? createLogMailer("No email provider configured") : null);
}
