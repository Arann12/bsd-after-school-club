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

  // Simpan token & user ke localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
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
    // Hapus localStorage meskipun request gagal
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }
}

/**
 * GET /auth/me
 * Ambil profil user yang sedang login (requires token)
 * Response: { success, data: User }
 */
export async function getMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<BackendMeResponse>("/auth/me");
  return data.data;
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
 * Gunakan setelah logout atau ketika token expired
 */
export function getLoginRoute(role?: AuthUser["role"]): string {
  switch (role) {
    case "admin":   return "/admin/login";
    case "teacher": return "/guru/login";
    case "parent":  return "/orang-tua/login";
    default:        return "/";  // owner & fallback → root
  }
}
