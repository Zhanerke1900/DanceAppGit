import { getMailer } from "./mailer.js";
import { generateTicketQrBuffer } from "./ticketQr.js";
import { generateTicketBarcodeBuffer } from "./ticketBarcode.js";

function formatCurrency(amount) {
  return new Intl.NumberFormat("ru-KZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " KZT";
}

export async function sendTicketEmail({ email, fullName, event, tickets }) {
  const transporter = getMailer();
  const from = process.env.SMTP_FROM || "DanceTime <no-reply@dance.local>";

  if (!transporter) {
    console.log("SMTP not configured. Ticket email skipped.");
    console.log("EMAIL:", email);
    console.log("TICKETS:", tickets.map((ticket) => ticket.ticketCode));
    return;
  }

  const attachments = [];
  for (const ticket of tickets) {
    const safeCode = ticket.ticketCode.replace(/[^A-Z0-9-]/gi, "");
    attachments.push({
      filename: `${safeCode}-qr.png`,
      content: await generateTicketQrBuffer(ticket.qrToken),
      cid: `qr-${safeCode}`,
    });
    attachments.push({
      filename: `${safeCode}-barcode.png`,
      content: await generateTicketBarcodeBuffer(ticket.ticketCode),
      cid: `barcode-${safeCode}`,
    });
  }

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
    <h2>Your DanceTime tickets are ready</h2>
    <p>Hi${fullName ? `, ${fullName}` : ""}!</p>
    <p>Thank you for your purchase. Your tickets for <strong>${event.title}</strong> are attached below.</p>

    <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:14px;background:#f9fafb">
      <p style="margin:0 0 8px"><strong>Event:</strong> ${event.title}</p>
      <p style="margin:0 0 8px"><strong>Date:</strong> ${event.date}${event.time ? ` - ${event.time}` : ""}</p>
      <p style="margin:0"><strong>Location:</strong> ${event.location}</p>
    </div>

    ${tickets.map((ticket) => {
      const safeCode = ticket.ticketCode.replace(/[^A-Z0-9-]/gi, "");
      return `
        <div style="margin:24px 0;padding:18px;border:1px solid #ddd6fe;border-radius:16px;background:#ffffff">
          <h3 style="margin:0 0 12px;color:#6d28d9">${ticket.ticketCode}</h3>
          <p style="margin:0 0 6px"><strong>Ticket Type:</strong> ${ticket.ticketType}</p>
          <p style="margin:0 0 16px"><strong>Price:</strong> ${formatCurrency(ticket.price)}</p>
          <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
            <div>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280">QR Code</p>
              <img src="cid:qr-${safeCode}" alt="QR ${ticket.ticketCode}" style="width:180px;height:180px;border:1px solid #e5e7eb;border-radius:12px;padding:8px;background:white" />
            </div>
            <div>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280">Barcode</p>
              <img src="cid:barcode-${safeCode}" alt="Barcode ${ticket.ticketCode}" style="width:320px;max-width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:8px;background:white" />
            </div>
          </div>
        </div>
      `;
    }).join("")}

    <p style="font-size:12px;color:#6b7280;margin-top:24px">Present the QR code at the entrance. Each ticket can be used only once.</p>
  </div>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: `Your DanceTime tickets for ${event.title}`,
    html,
    attachments,
  });
}
