import { clearAuthToken, request, setAuthToken } from "./http";

export type User = {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  emailVerified?: boolean;
  role?: "user" | "organizer" | "admin" | "validator";
  isOrganizer?: boolean;
  isAdmin?: boolean;
  isValidator?: boolean;
  organizerStatus?: "none" | "pending" | "approved" | "rejected";
  organizerApprovalNoticePending?: boolean;
  language?: "en" | "ru" | "kk";
  emailNotifications?: boolean;
  eventReminders?: boolean;
  accountStatus?: "active" | "blocked";
  blockedReason?: string;
};

export async function adminOverview() {
  const { res, data } = await request<any>("/api/admin/overview", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load admin overview");
  return data;
}

export async function adminRequests(status: "pending" | "rejected" = "pending") {
  const { res, data } = await request<any>(`/api/admin/requests?status=${encodeURIComponent(status)}`, { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load organizer requests");
  return data;
}

export async function approveOrganizerRequest(id: string) {
  const { res, data } = await request<any>(`/api/admin/requests/${id}/approve`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to approve organizer request");
  return data;
}

export async function rejectOrganizerRequest(id: string) {
  const { res, data } = await request<any>(`/api/admin/requests/${id}/reject`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to reject organizer request");
  return data;
}

export async function adminUsers(search = "") {
  const { res, data } = await request<any>(`/api/admin/users?search=${encodeURIComponent(search)}`, { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load users");
  return data;
}

export async function adminDeactivateOrganizer(id: string) {
  const { res, data } = await request<any>(`/api/admin/users/${id}/deactivate-organizer`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to deactivate organizer");
  return data;
}

export async function adminActivateOrganizer(id: string) {
  const { res, data } = await request<any>(`/api/admin/users/${id}/activate-organizer`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to activate organizer");
  return data;
}

export async function blockUser(id: string, reason: "Fraud" | "Spam" | "Fake event" | "Abuse") {
  const { res, data } = await request<any>(`/api/admin/users/${id}/block`, {
    method: "POST",
    json: { reason },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to block user");
  return data;
}

export async function unblockUser(id: string) {
  const { res, data } = await request<any>(`/api/admin/users/${id}/unblock`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to unblock user");
  return data;
}

export async function adminEvents(status = "") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { res, data } = await request<any>(`/api/admin/events${query}`, { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load events");
  return data;
}

export async function publishedEvents() {
  const { res, data } = await request<any>("/api/events/published", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load published events");
  return data;
}

export async function organizerEvents() {
  const { res, data } = await request<any>("/api/organizer/events", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load organizer events");
  return data;
}

export async function organizerOrders() {
  const { res, data } = await request<any>("/api/organizer/orders", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load organizer orders");
  return data;
}

export async function organizerAnalytics() {
  const { res, data } = await request<any>("/api/organizer/analytics", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load organizer analytics");
  return data;
}

export async function organizerValidators() {
  const { res, data } = await request<any>("/api/organizer/validators", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load organizer validators");
  return data;
}

export async function createOrganizerValidator(payload: { fullName: string; email: string; password: string }) {
  const { res, data } = await request<any>("/api/organizer/validators", {
    method: "POST",
    json: payload,
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to create validator");
  return data;
}

export async function assignOrganizerValidatorToEvent(eventId: string, validatorId: string) {
  const { res, data } = await request<any>(`/api/organizer/events/${eventId}/assign-validator`, {
    method: "POST",
    json: { validatorId },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to assign validator");
  return data;
}

export async function unassignOrganizerValidatorFromEvent(eventId: string, validatorId: string) {
  const { res, data } = await request<any>(`/api/organizer/events/${eventId}/unassign-validator`, {
    method: "POST",
    json: { validatorId },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to unassign validator");
  return data;
}

export async function createOrganizerEvent(payload: any) {
  const { res, data } = await request<any>("/api/organizer/events", {
    method: "POST",
    json: payload,
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to create event");
  return data;
}

export async function updateOrganizerEvent(eventId: string, payload: any) {
  const { res, data } = await request<any>(`/api/organizer/events/${eventId}`, {
    method: "PUT",
    json: payload,
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to update event");
  return data;
}

export async function moveOrganizerEventToDraft(eventId: string) {
  const { res, data } = await request<any>(`/api/organizer/events/${eventId}/change-to-draft`, {
    method: "POST",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to move event to draft");
  return data;
}

export async function deleteOrganizerEvent(eventId: string) {
  const { res, data } = await request<any>(`/api/organizer/events/${eventId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to delete event");
  return data;
}

export async function createOrder(payload: { eventId: string; ticketDetails: any }) {
  const { res, data } = await request<any>("/api/orders", {
    method: "POST",
    json: payload,
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to create order");
  return data;
}

export async function approveAdminEvent(id: string) {
  const { res, data } = await request<any>(`/api/admin/events/${id}/approve`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to approve event");
  return data;
}

export async function rejectAdminEvent(id: string) {
  const { res, data } = await request<any>(`/api/admin/events/${id}/reject`, { method: "POST" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to reject event");
  return data;
}

export async function register(payload: { fullName: string; email: string; password: string }) {
  const { res, data } = await request<{ message?: string }>("/api/auth/register", {
    method: "POST",
    json: payload,
  });

  if (!res.ok) throw new Error(data?.message || "Registration failed");
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { res, data } = await request<{ user?: User; token?: string; message?: string; code?: string }>("/api/auth/login", {
    method: "POST",
    json: payload,
  });

  if (!res.ok) {
    const err: any = new Error(data?.message || "Login failed");
    err.code = data?.code;
    throw err;
  }

  setAuthToken(data.token);
  return data;
}

export async function me() {
  const { res, data } = await request<{ user?: User }>("/api/auth/me", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Not authenticated");
  return data;
}

export async function updateMe(payload: {
  fullName: string;
  language: "en" | "ru" | "kk";
  emailNotifications: boolean;
  eventReminders: boolean;
}) {
  const { res, data } = await request<{ user?: User; message?: string }>("/api/auth/me", {
    method: "PUT",
    json: payload,
  });

  if (!res.ok) throw new Error((data as any)?.message || "Failed to save settings");
  return data;
}

export async function submitOrganizerRequest(payload: {
  organizationName: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}) {
  const { res, data } = await request<{ message?: string; applicationId?: string; user?: User }>(
    "/api/auth/organizer-request",
    {
      method: "POST",
      json: payload,
    }
  );

  if (!res.ok) throw new Error((data as any)?.message || "Failed to submit organizer request");
  return data;
}

export async function logout() {
  try {
    const { res, data } = await request<{ message?: string }>("/api/auth/logout", { method: "POST" });
    if (!res.ok) throw new Error((data as any)?.message || "Logout failed");
    return data;
  } finally {
    clearAuthToken();
  }
}

export async function acknowledgeOrganizerApproval() {
  const { res, data } = await request<{ user?: User; message?: string }>("/api/auth/ack-organizer-approval", {
    method: "POST",
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to clear organizer notice");
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { res, data } = await request<{ message?: string; code?: string }>("/api/auth/change-password", {
    method: "POST",
    json: payload,
  });

  if (!res.ok) {
    const err: any = new Error((data as any)?.message || "Failed to change password");
    err.code = (data as any)?.code;
    throw err;
  }

  return data;
}

export async function resendVerification(email: string) {
  const { res, data } = await request<{ message?: string }>("/api/auth/resend-verification", {
    method: "POST",
    json: { email },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to resend verification");
  return data;
}
export async function forgotPassword(email: string) {
  const { res, data } = await request<{ message?: string }>("/api/auth/forgot-password", {
    method: "POST",
    json: { email },
  });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to send reset email");
  return data;
}
