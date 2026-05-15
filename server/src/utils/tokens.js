import crypto from "crypto";

export function makeToken(bytes = 32) {
  // Длинный random token для ссылок verification/reset.
  return crypto.randomBytes(bytes).toString("hex");
}

export function makeCode() {
  // Короткий код для письма, если пользователь вводит код вручную.
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashToken(value) {
  // В MongoDB храним hash, а не raw token из письма.
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}
