const ADMIN_EMAILS = new Set(["1zhanerke1900@gmail.com"]);

export function isAdminEmail(email) {
  // Главный admin может определяться по email даже без ручной смены role в базе.
  return ADMIN_EMAILS.has(String(email || "").trim().toLowerCase());
}
