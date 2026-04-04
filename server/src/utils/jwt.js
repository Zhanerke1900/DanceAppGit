import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function signAccessToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export function setAuthCookie(res, token) {
  res.cookie("access_token", token, authCookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie("access_token", authCookieOptions());
}
