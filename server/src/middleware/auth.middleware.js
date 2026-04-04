import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
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
    if (user.accountStatus === "blocked") {
      res.clearCookie("token");
      res.clearCookie("access_token");
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        code: "ACCOUNT_BLOCKED",
        reason: user.blockedReason || "",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authenticated" });
  }
}
