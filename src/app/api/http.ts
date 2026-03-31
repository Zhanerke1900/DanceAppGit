const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const headers: Record<string, string> = {
    ...(options.headers as any),
  };

  if (options.json !== undefined) headers["Content-Type"] = "application/json";

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
    window.dispatchEvent(new CustomEvent("auth:blocked", { detail: data }));
  }
  return { res, data };
}
