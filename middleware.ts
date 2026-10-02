/**
 * ============================================================
 * BSD After School Club — Next.js Edge Middleware
 * ============================================================
 * Berjalan SEBELUM setiap request diproses.
 * Tidak bisa mengakses localStorage (server-side / Edge).
 * Token dibaca dari Cookie "auth_token" (diset saat login).
 *
 * Proteksi yang diterapkan:
 *   1. Redirect unauthenticated user ke /
 *   2. Cegah cross-role access (guru tidak bisa buka /owner)
 *   3. Blokir /test-api di production
 * ============================================================
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Konfigurasi Route ─────────────────────────────────────────
/** Semua prefix yang wajib login */
const PROTECTED_PREFIXES = ["/owner", "/admin", "/guru", "/orang-tua"];

/** Mapping: prefix route → role(s) yang diizinkan */
const ROLE_MAP: Record<string, string[]> = {
  "/owner":     ["owner"],
  "/admin":     ["admin", "owner"],
  "/guru":      ["teacher", "owner"],
  "/orang-tua": ["parent", "owner"],
};

// ─── Helper: baca role dari cookie auth_user ──────────────────
function getRoleFromCookie(request: NextRequest): string | null {
  try {
    const raw = request.cookies.get("auth_user")?.value;
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    const user = JSON.parse(decoded) as { role?: string };
    return user?.role ?? null;
  } catch {
    return null;
  }
}

// ─── Middleware ────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Blokir /test-api di production
  if (pathname.startsWith("/test-api") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Cek apakah route ini butuh proteksi
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  // 3. Cek token — redirect ke login jika tidak ada
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Cek role — cegah cross-role access
  const role = getRoleFromCookie(request);
  if (role) {
    for (const [prefix, allowedRoles] of Object.entries(ROLE_MAP)) {
      if (pathname.startsWith(prefix) && !allowedRoles.includes(role)) {
        const dashboardMap: Record<string, string> = {
          owner:   "/owner/dashboard",
          admin:   "/admin/dashboard",
          teacher: "/guru/dashboard",
          parent:  "/orang-tua/dashboard",
        };
        const correctDash = dashboardMap[role] ?? "/";
        return NextResponse.redirect(new URL(correctDash, request.url));
      }
    }
  }

  // 5. Semua cek lolos — lanjut ke halaman
  return NextResponse.next();
}

// ─── Matcher ───────────────────────────────────────────────────
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
