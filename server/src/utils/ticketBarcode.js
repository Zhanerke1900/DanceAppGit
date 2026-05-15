import bwipjs from "bwip-js";

function bufferToDataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function generateTicketBarcodeBuffer(ticketCode) {
  // Barcode содержит видимый ticketCode, его можно сканировать как запасной вариант вместо QR.
  return bwipjs.toBuffer({
    bcid: "code128",
    text: ticketCode,
    scale: 3,
    height: 14,
    includetext: true,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });
}

export async function generateTicketBarcodeDataUrl(ticketCode) {
  const buffer = await generateTicketBarcodeBuffer(ticketCode);
  return bufferToDataUrl(buffer);
}
