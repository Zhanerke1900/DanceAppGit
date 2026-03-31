const ADMIN_EMAILS = new Set(["1zhanerke1900@gmail.com"]);

export function isAdminEmail(email) {
  return ADMIN_EMAILS.has(String(email || "").trim().toLowerCase());
}
