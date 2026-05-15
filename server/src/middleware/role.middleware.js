import { isAdminEmail } from "../utils/admin.js";

export function getUserRole(user) {
  if (!user) return "user";
  // Admin определяется либо по email из allow-list, либо по роли в базе.
  if (isAdminEmail(user.email) || user.role === "admin") return "admin";
  if (user.role === "validator") return "validator";
  // Organizer может быть отмечен разными полями, потому что статус меняется через заявку и админку.
  if (user.isOrganizer || user.organizerStatus === "approved" || user.role === "organizer") return "organizer";
  return "user";
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = getUserRole(req.user);
    // Если текущей роли нет в списке разрешенных, endpoint закрыт.
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.userRole = role;
    next();
  };
}
