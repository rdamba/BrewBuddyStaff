import { ApiError } from "./apiError";
import { mockRequest } from "./mockServer";

// Flip to false once a real backend exists. Nothing else changes.
export const USE_MOCK = true;

const BASE_URL = "https://api.brewbuddy.example/v1";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  token?: string | null;
}

export async function request<T>(
  method: HttpMethod,
  path: string,
  { body, token }: RequestOptions = {},
): Promise<T> {
  if (USE_MOCK) {
    return mockRequest<T>(method, path, body, token);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // The body was not JSON. Keep the default message.
    }

    throw new ApiError(response.status, message);
  }

  // 204 No Content has no body to parse, e.g. after a DELETE.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
