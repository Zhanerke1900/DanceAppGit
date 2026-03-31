import { request } from "./http";

export async function validatorEvents() {
  const { res, data } = await request<any>("/api/validator/events", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load validator events");
  return data;
}

export async function validatorRecentScans() {
  const { res, data } = await request<any>("/api/validator/recent-scans", { method: "GET" });
  if (!res.ok) throw new Error((data as any)?.message || "Failed to load recent scans");
  return data;
}

export async function validatorScan(payload: { qrToken: string; eventId: string }) {
  const { res, data } = await request<any>("/api/validator/scan", {
    method: "POST",
    json: payload,
  });
  if (!res.ok) {
    const error: any = new Error((data as any)?.message || "Failed to validate ticket");
    error.data = data;
    throw error;
  }
  return data;
}
