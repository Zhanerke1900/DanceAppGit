const browserHost =
  typeof window !== "undefined" ? window.location.hostname : "";
const isLocalDevHost =
  browserHost === "localhost" || browserHost === "127.0.0.1";

export const API_URL =
  import.meta.env.VITE_API_URL || (isLocalDevHost ? "http://localhost:4000" : "");

const AUTH_TOKEN_KEY = "danceapp:auth-token";

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token?: string) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function clearAuthToken() {
  setAuthToken("");
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

export type ApiError = { message?: string; code?: string };

export async function request<T>(
  path: string,
  options: RequestInit & { json?: any } = {}
): Promise<{ res: Response; data: T & ApiError }> {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured for this deployment");
  }

  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  if (options.json !== undefined) headers["Content-Type"] = "application/json";
  const authToken = getAuthToken();
  if (authToken && !headers.Authorization) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    credentials: "include",
  });

  const data = (await parseJson(res)) as T & ApiError;
  if (
    res.status === 403 &&
    (data as any)?.code === "ACCOUNT_BLOCKED" &&
    !path.startsWith("/api/auth/login") &&
    typeof window !== "undefined"
  ) {
    clearAuthToken();
    window.dispatchEvent(new CustomEvent("auth:blocked", { detail: data }));
  }
  return { res, data };
}
