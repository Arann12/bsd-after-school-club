/* ============================================================
   BSD After School Club — Auth API
   ============================================================ */

import axiosInstance from "./axiosInstance";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "guru" | "orang_tua";
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

/** POST /auth/login */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
  // Simpan token & user ke localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  }
  return data;
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout");
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

/** GET /auth/me — ambil profil user yang sedang login */
export async function getMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<{ user: AuthUser }>("/auth/me");
  return data.user;
}

/** Helper: ambil user dari localStorage (tanpa network request) */
export function getLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

/** Helper: cek apakah user sudah login */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}
