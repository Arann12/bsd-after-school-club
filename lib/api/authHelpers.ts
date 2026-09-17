/* ============================================================
   BSD After School Club — Auth Cookie & LocalStorage Helpers
   File ini TIDAK boleh import dari axiosInstance untuk
   menghindari circular dependency.
   ============================================================ */

export interface AuthUser {
  id: string;
  user_code: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "teacher" | "parent";
  phone?: string;
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COOKIE HELPERS
//  proxy.ts (server-side) hanya bisa baca cookie.
//  Kita simpan token & user di cookie agar proxy bisa verifikasi.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Cookie max-age: 7 hari */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Simpan auth token & user ke cookie (client-side document.cookie) */
export function setAuthCookies(token: string, user: AuthUser): void {
  if (typeof document === "undefined") return;
  const opts = `path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `auth_token=${encodeURIComponent(token)}; ${opts}`;
  document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; ${opts}`;
}

/** Hapus cookie auth (set max-age=0) */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "auth_user=; path=/; max-age=0";
}

/** Hapus semua data auth (localStorage + cookie) */
export function clearAllAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  clearAuthCookies();
}
