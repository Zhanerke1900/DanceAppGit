import QRCode from "qrcode";

export async function generateTicketQrDataUrl(qrToken) {
  // DataURL сохраняется в Ticket и может сразу отображаться на frontend.
  return QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
}

export async function generateTicketQrBuffer(qrToken) {
  // Buffer нужен для attachment в email.
  return QRCode.toBuffer(qrToken, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
}
