import { getMailer, getMailFrom } from "./mailer.js";
import { generateTicketQrBuffer } from "./ticketQr.js";
import { generateTicketBarcodeBuffer } from "./ticketBarcode.js";
import {
  escapeHtml,
  formatMoneyForEmail,
  getEmailCopy,
  localizeEventForEmail,
  normalizeEmailLanguage,
} from "./emailLocale.js";

export async function sendTicketEmail({ email, fullName, event, tickets, language = "en" }) {
  const lang = normalizeEmailLanguage(language);
  const copy = getEmailCopy(lang);
  const transporter = getMailer();
  const from = getMailFrom();
  const provider = transporter?.provider || "none";

  if (!transporter) {
    console.log("EMAIL provider not configured. Ticket email skipped.");
    console.log("PROVIDER:", provider);
    console.log("EMAIL:", email);
    console.log("LANGUAGE:", lang);
    console.log("TICKETS:", tickets.map((ticket) => ticket.ticketCode));
    return;
  }

  const attachmentPairs = await Promise.all(
    tickets.map(async (ticket) => {
      const safeCode = ticket.ticketCode.replace(/[^A-Z0-9-]/gi, "");
      const [qrBuffer, barcodeBuffer] = await Promise.all([
        generateTicketQrBuffer(ticket.qrToken),
        generateTicketBarcodeBuffer(ticket.ticketCode),
      ]);

      return [
        {
          filename: `${safeCode}-qr.png`,
          content: qrBuffer,
          cid: `qr-${safeCode}`,
        },
        {
          filename: `${safeCode}-barcode.png`,
          content: barcodeBuffer,
          cid: `barcode-${safeCode}`,
        },
      ];
    })
  );
  const attachments = attachmentPairs.flat();
  const displayEvent = localizeEventForEmail(event, lang);
  const eventTitle = displayEvent?.title || "DanceTime Event";
  const safeEventTitle = escapeHtml(eventTitle);
  const safeGreeting = copy.greeting(escapeHtml(fullName || ""));
  const eventDate = [displayEvent?.date, displayEvent?.time].filter(Boolean).join(" - ");

  const html = `
  <div lang="${lang}" style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
    <h2>${escapeHtml(copy.ticketsTitle)}</h2>
    <p>${safeGreeting}!</p>
    <p>${copy.ticketsThanks(safeEventTitle)}</p>

    <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:14px;background:#f9fafb">
      <p style="margin:0 0 8px"><strong>${escapeHtml(copy.event)}:</strong> ${safeEventTitle}</p>
      <p style="margin:0 0 8px"><strong>${escapeHtml(copy.date)}:</strong> ${escapeHtml(eventDate || "-")}</p>
      <p style="margin:0"><strong>${escapeHtml(copy.location)}:</strong> ${escapeHtml(displayEvent?.location || "-")}</p>
    </div>

    ${tickets.map((ticket) => {
      const safeCode = ticket.ticketCode.replace(/[^A-Z0-9-]/gi, "");
      return `
        <div style="margin:24px 0;padding:18px;border:1px solid #ddd6fe;border-radius:16px;background:#ffffff">
          <h3 style="margin:0 0 12px;color:#6d28d9">${escapeHtml(ticket.ticketCode)}</h3>
          <p style="margin:0 0 6px"><strong>${escapeHtml(copy.ticketType)}:</strong> ${escapeHtml(ticket.ticketType)}</p>
          <p style="margin:0 0 16px"><strong>${escapeHtml(copy.price)}:</strong> ${escapeHtml(formatMoneyForEmail(ticket.price, "KZT", lang))}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:18px">
            <tr>
              <td align="center" style="padding:0 0 24px">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#4b5563">${escapeHtml(copy.qrCode)}</p>
                <img src="cid:qr-${safeCode}" alt="QR ${escapeHtml(ticket.ticketCode)}" width="300" height="300" style="display:block;width:300px;height:300px;max-width:100%;border:1px solid #d8b4fe;border-radius:18px;padding:14px;background:#ffffff" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0">
                <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#6b7280">${escapeHtml(copy.barcode)}</p>
                <img src="cid:barcode-${safeCode}" alt="${escapeHtml(copy.barcode)} ${escapeHtml(ticket.ticketCode)}" width="360" style="display:block;width:360px;max-width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#ffffff" />
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join("")}

    <p style="font-size:12px;color:#6b7280;margin-top:24px">${escapeHtml(copy.presentQr)}</p>
  </div>`;

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: copy.ticketsSubject(eventTitle),
    html,
    attachments,
  });

  console.log("TICKET EMAIL SENT");
  console.log("   to:", email);
  console.log("   language:", lang);
  console.log("   provider:", info?.provider || provider);
  console.log("   messageId:", info?.messageId);
  console.log("   accepted:", info?.accepted);
  console.log("   rejected:", info?.rejected);
  console.log("   response:", info?.response);
}
