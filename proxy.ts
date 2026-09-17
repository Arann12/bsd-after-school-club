/* ============================================================
   BSD After School Club — Proxy (Auth Guard)
   Next.js 16: middleware.ts → proxy.ts, export function proxy()
   ============================================================ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route → role yang diizinkan ──────────────────────────────
// Backend mengembalikan role: "owner" | "admin" | "teacher" | "parent"
const PROTECTED_ROUTES: { prefix: string; allowedRoles: string[]; loginPath: string }[] = [
  { prefix: "/owner",     allowedRoles: ["owner"],            loginPath: "/" },
  { prefix: "/admin",     allowedRoles: ["admin"],            loginPath: "/admin/login" },
  { prefix: "/guru",      allowedRoles: ["teacher"],          loginPath: "/guru/login" },
  { prefix: "/orang-tua", allowedRoles: ["parent"],           loginPath: "/orang-tua/login" },
];

// Halaman login & path publik — tidak perlu diproteksi (harus explicit agar tidak loop)
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/guru/login",
  "/admin/login",
  "/orang-tua/login",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Halaman publik (login pages) → selalu lanjut tanpa cek ──
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // ── Cari apakah pathname termasuk route yang diproteksi ──
  const matched = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));

  // Bukan route protected → lanjut
  if (!matched) return NextResponse.next();

  // ── Baca cookie auth ─────────────────────────────────────
  const token = request.cookies.get("auth_token")?.value;
  const userRaw = request.cookies.get("auth_user")?.value;

  // Belum login → redirect ke halaman login yang sesuai
  if (!token) {
    const loginUrl = new URL(matched.loginPath, request.url);
    // Simpan URL asal agar bisa redirect balik setelah login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Cek role ─────────────────────────────────────────────
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw) as { role: string };
      if (!matched.allowedRoles.includes(user.role)) {
        // Token ada tapi role salah → redirect ke login yang sesuai
        const loginUrl = new URL(matched.loginPath, request.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Cookie auth_user rusak → redirect ke login
      const loginUrl = new URL(matched.loginPath, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua path KECUALI:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, logo.png, dll. (public assets)
     * - api routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
