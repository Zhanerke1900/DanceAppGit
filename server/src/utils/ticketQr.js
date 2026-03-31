import QRCode from "qrcode";

export async function generateTicketQrDataUrl(qrToken) {
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
