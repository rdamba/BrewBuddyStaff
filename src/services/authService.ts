import type { AuthResponse, LoginCredentials, User } from "../types/auth";
import { request } from "./apiClient";
import { clearToken, getToken, saveToken } from "./tokenStorage";

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const session = await request<AuthResponse>("POST", "/auth/login", {
    body: credentials,
  });

  await saveToken(session.token);
  return session;
}

// Called once on launch: is there a saved token, and is it still valid?
export async function restoreSession(): Promise<AuthResponse | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const user = await request<User>("GET", "/auth/me", { token });
    return { token, user };
  } catch {
    await clearToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  await clearToken();
}
