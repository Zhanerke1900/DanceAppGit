export function parsePriceValue(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  const digits = String(value || "").replace(/\D/g, "");
  return Number(digits || 0);
}

export function formatKztPrice(value) {
  const numeric = Number(value || 0);
  return numeric > 0 ? `${numeric.toLocaleString("en-US")} KZT` : "";
}

export function getLowestTicketPrice(event = {}) {
  // Для карточки события показываем минимальную доступную цену.
  const candidates =
    event.eventType === "special-program"
      ? [
          event.fullPassPrice,
          event.ticketPricing?.fullEventPass,
          ...(event.activities || []).map((activity) => activity.price),
        ]
      : [event.ticketPricing?.generalAdmission, event.price];

  const prices = candidates.map(parsePriceValue).filter((value) => value > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function getLowestDisplayPrice(event = {}) {
  const lowestPrice = getLowestTicketPrice(event);
  return lowestPrice > 0 ? formatKztPrice(lowestPrice) : String(event.price || "");
}
