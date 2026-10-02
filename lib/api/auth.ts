/* ============================================================
   BSD After School Club — Auth API
   Disesuaikan dengan response struktur backend:
   { success, message, data: { token, token_type, user } }
   ============================================================ */

import axiosInstance from "./axiosInstance";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  user_code: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "teacher" | "parent";
  phone?: string;
  is_active?: boolean;
}

// ── Response shapes dari backend ────────────────────────────

interface BackendLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: "Bearer";
    user: AuthUser;
  };
}

interface BackendMeResponse {
  success: boolean;
  data: AuthUser;
}

// ── Public export ────────────────────────────────────────────

export interface LoginResult {
  token: string;
  user: AuthUser;
  message: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AUTH FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /auth/login
 * Credentials test dari seeder:
 *   owner@bsd.test   / password
 *   admin@bsd.test   / password
 *   guru@bsd.test    / password
 *   ortu@bsd.test    / password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { data } = await axiosInstance.post<BackendLoginResponse>("/auth/login", credentials);

  if (!data.success) {
    throw new Error(data.message);
  }

  const result: LoginResult = {
    token: data.data.token,
    user: data.data.user,
    message: data.message,
  };

  // Simpan token & user ke localStorage DAN cookie
  // (Cookie dibutuhkan oleh middleware.ts untuk route protection)
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
    setAuthCookies(result.token, result.user);
  }

  return result;
}

/**
 * POST /auth/logout
 * Butuh token — hapus dari localStorage setelah berhasil
 */
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post("/auth/logout");
  } finally {
    // Hapus localStorage DAN cookie meskipun request gagal
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      clearAuthCookies();
    }
  }
}

/**
 * GET /auth/me
 * Ambil profil user yang sedang login (requires token)
 * Response: { success, data: User }
 */
export async function getMe(): Promise<any> {
  const { data } = await axiosInstance.get<any>("/auth/me");
  return data.data;
}

/**
 * PUT /auth/profile
 * Update nama, email, no hp user yang login
 */
export async function updateProfile(payload: { name: string; email: string; phone?: string }): Promise<AuthUser> {
  const { data } = await axiosInstance.put<any>("/auth/profile", payload);
  if (data.success && data.data && typeof window !== "undefined") {
    const existing = getLocalUser();
    const updated = { ...existing, ...data.data };
    localStorage.setItem("auth_user", JSON.stringify(updated));
    window.dispatchEvent(new Event("user_profile_updated"));
  }
  return data.data;
}

/**
 * PUT /auth/password
 * Ubah password akun
 */
export async function updatePassword(payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<void> {
  const { data } = await axiosInstance.put<any>("/auth/password", payload);
  if (!data.success) {
    throw new Error(data.message || "Gagal mengubah password.");
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LOCAL STORAGE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Ambil user dari localStorage (tanpa network request) */
export function getLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** Ambil token dari localStorage */
export function getLocalToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/** Cek apakah user sudah login */
export function isAuthenticated(): boolean {
  return !!getLocalToken();
}

/**
 * Helper: redirect ke halaman login sesuai role
 */
export function getLoginRoute(role?: AuthUser["role"]): string {
  return "/";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COOKIE HELPERS — dibutuhkan oleh middleware.ts
//  Middleware Next.js berjalan di Edge dan hanya bisa baca Cookie,
//  bukan localStorage. Fungsi di bawah menyinkronkan keduanya.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Tulis auth_token dan auth_user ke cookie browser.
 * Cookie ini TIDAK httpOnly (masih JS-accessible) agar bisa
 * dibersihkan dari client. Upgrade ke httpOnly dilakukan di sisi
 * backend setelah backend siap set-cookie.
 */
export function setAuthCookies(token: string, user: AuthUser): void {
  if (typeof document === "undefined") return;
  // Session cookie (hilang saat browser ditutup), SameSite=Strict
  const base = "; path=/; SameSite=Strict";
  document.cookie = `auth_token=${encodeURIComponent(token)}${base}`;
  document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}${base}`;
}

/** Hapus cookie auth_token dan auth_user */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  const expired = "; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `auth_token=${expired}`;
  document.cookie = `auth_user=${expired}`;
}
