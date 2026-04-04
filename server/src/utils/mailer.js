import nodemailer from "nodemailer";
import { Resend } from "resend";

function createResendMailer() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const resend = new Resend(apiKey);

  return {
    async sendMail(options = {}) {
      const toList = Array.isArray(options.to) ? options.to : [options.to].filter(Boolean);
      const ccList = Array.isArray(options.cc) ? options.cc : [options.cc].filter(Boolean);
      const bccList = Array.isArray(options.bcc) ? options.bcc : [options.bcc].filter(Boolean);

      const attachments = Array.isArray(options.attachments)
        ? options.attachments.map((attachment) => ({
            filename: attachment.filename,
            path: attachment.path,
            content: attachment.content,
            contentId: attachment.contentId || attachment.cid,
          }))
        : undefined;

      const payload = {
        from: options.from || process.env.RESEND_FROM || process.env.SMTP_FROM,
        to: toList,
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
        messageId: data?.id || null,
        accepted: toList,
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

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getMailer() {
  return createResendMailer() || createSmtpMailer();
}
