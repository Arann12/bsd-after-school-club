"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalToken, getLocalUser, getLoginRoute } from "@/lib/api/authHelpers";
import type { AuthUser } from "@/lib/api/authHelpers";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Role yang boleh mengakses — harus cocok dengan AuthUser.role dari backend */
  requiredRole: AuthUser["role"];
}

/**
 * Client-side guard: cek token & role dari localStorage.
 * Mencegah "flash" konten protected sebelum proxy sempat redirect.
 * Selalu dipakai bersama proxy.ts (dua lapis proteksi).
 */
export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  useEffect(() => {
    const token = getLocalToken();
    const user = getLocalUser();

    if (!token || !user) {
      // Belum login → redirect ke halaman login sesuai role yang dibutuhkan
      router.replace(getLoginRoute(requiredRole));
      setStatus("unauthorized");
      return;
    }

    if (user.role !== requiredRole) {
      // Login tapi role salah → redirect ke login halaman sendiri
      router.replace(getLoginRoute(user.role));
      setStatus("unauthorized");
      return;
    }

    setStatus("authorized");
  }, [router, requiredRole]);

  if (status === "checking") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary, #0f172a)",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid #3AABE3",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            Memverifikasi akses…
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") return null;

  return <>{children}</>;
}
