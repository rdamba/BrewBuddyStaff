export type Role = "staff" | "manager";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AuthStatus = "checking" | "signedOut" | "signedIn";
