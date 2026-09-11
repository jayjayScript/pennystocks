const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    // Admin users use adminAccessToken for ALL routes (backend validates the same JWT for both user and admin endpoints).
    // Regular users use accessToken for all routes.
    token = isAdmin
      ? localStorage.getItem("adminAccessToken")
      : localStorage.getItem("accessToken");
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Request failed", response.status);
  }
  return response.json() as Promise<T>;
}
