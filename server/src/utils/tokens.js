import crypto from "crypto";

export function makeToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashToken(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}
