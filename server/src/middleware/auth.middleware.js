import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    // Ищем токен там, откуда его может отправить frontend: cookie или Authorization header.
    const token =
      req.cookies?.token ||
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    // Заблокированный пользователь может иметь старый валидный токен, но доступ все равно запрещаем.
    if (user.accountStatus === "blocked") {
      res.clearCookie("token");
      res.clearCookie("access_token");
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        code: "ACCOUNT_BLOCKED",
        reason: user.blockedReason || "",
      });
    }

    // Дальше все защищенные routes берут текущего пользователя из req.user.
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authenticated" });
  }
}
