import { isAdminEmail } from "../utils/admin.js";

export function getUserRole(user) {
  if (!user) return "user";
  if (isAdminEmail(user.email) || user.role === "admin") return "admin";
  if (user.role === "validator") return "validator";
  if (user.isOrganizer || user.organizerStatus === "approved" || user.role === "organizer") return "organizer";
  return "user";
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = getUserRole(req.user);
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.userRole = role;
    next();
  };
}
