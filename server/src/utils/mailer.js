import nodemailer from "nodemailer";
import { Resend } from "resend";

const DEFAULT_FROM = "DanceTime <no-reply@dance.local>";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function isEnabled(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return TRUE_VALUES.has(String(value).trim().toLowerCase());
}

function normalizeProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "resend" || normalized === "smtp" || normalized === "log" || normalized === "auto") {
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

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
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

export function getMailFrom() {
  return process.env.RESEND_FROM || process.env.SMTP_FROM || DEFAULT_FROM;
}

export function getMailerProvider() {
  const requested = getRequestedProvider();

  if (requested === "log") return "log";
  if (requested === "resend" && process.env.RESEND_API_KEY) return "resend";
  if (requested === "smtp" && isSmtpConfigured()) return "smtp";

  if (process.env.RESEND_API_KEY) return "resend";
  if (isSmtpConfigured()) return "smtp";
  return "none";
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

      console.log("MAIL LOG DELIVERY");
      console.log("   provider:", "log");
      console.log("   reason:", reason);
      console.log("   from:", options.from || getMailFrom());
      console.log("   to:", recipients);
      if (cc.length) console.log("   cc:", cc);
      if (bcc.length) console.log("   bcc:", bcc);
      if (options.replyTo) console.log("   replyTo:", options.replyTo);
      if (options.subject) console.log("   subject:", options.subject);
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
  const resendMailer = createResendMailer();
  const smtpMailer = createSmtpMailer();
  const logFallbackEnabled = isEnabled(process.env.MAIL_LOG_FALLBACK, true);

  if (requested === "log") {
    return createLogMailer("MAIL_PROVIDER=log");
  }

  if (requested === "resend") {
    return withLogFallback(resendMailer, "resend") || withLogFallback(smtpMailer, "smtp") || (logFallbackEnabled ? createLogMailer("MAIL_PROVIDER=resend but no provider configured") : null);
  }

  if (requested === "smtp") {
    return withLogFallback(smtpMailer, "smtp") || withLogFallback(resendMailer, "resend") || (logFallbackEnabled ? createLogMailer("MAIL_PROVIDER=smtp but no provider configured") : null);
  }

  return withLogFallback(resendMailer, "resend") || withLogFallback(smtpMailer, "smtp") || (logFallbackEnabled ? createLogMailer("No email provider configured") : null);
}
