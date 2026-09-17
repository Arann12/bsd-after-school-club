/* ============================================================
   BSD After School Club — Auth API
   Disesuaikan dengan response struktur backend:
   { success, message, data: { token, token_type, user } }
   ============================================================ */

import axiosInstance from "./axiosInstance";
import {
  setAuthCookies,
  clearAllAuth,
  getLocalUser,
  getLocalToken,
  isAuthenticated,
  getLoginRoute,
  clearAuthCookies,
} from "./authHelpers";

// Re-export untuk backward compatibility
export { getLocalUser, getLocalToken, isAuthenticated, getLoginRoute, clearAuthCookies, setAuthCookies };
export type { AuthUser } from "./authHelpers";

export interface LoginCredentials {
  email: string;
  password: string;
}

// ── Response shapes dari backend ────────────────────────────

interface BackendLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: "Bearer";
    user: import("./authHelpers").AuthUser;
  };
}

interface BackendMeResponse {
  success: boolean;
  data: import("./authHelpers").AuthUser;
}

// ── Public export ────────────────────────────────────────────

export interface LoginResult {
  token: string;
  user: import("./authHelpers").AuthUser;
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
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
    setAuthCookies(result.token, result.user);
  }

  return result;
}

/**
 * POST /auth/logout
 * Butuh token — hapus dari localStorage dan cookie setelah berhasil
 */
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post("/auth/logout");
  } finally {
    // Hapus localStorage & cookie meskipun request gagal
    if (typeof window !== "undefined") {
      clearAllAuth();
    }
  }
}

/**
 * GET /auth/me
 * Ambil profil user yang sedang login (requires token)
 * Response: { success, data: User }
 */
export async function getMe(): Promise<import("./authHelpers").AuthUser> {
  const { data } = await axiosInstance.get<BackendMeResponse>("/auth/me");
  return data.data;
}
