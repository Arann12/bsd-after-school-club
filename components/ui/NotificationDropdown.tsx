"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCashTransactions, getPaymentPlans } from "@/lib/api/finance";
import { getClassSessions } from "@/lib/api/academic";
import { getAnnouncements } from "@/lib/api/operational";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "error" | "success";
  read: boolean;
  createdAt: string;
  href: string;
}

export type NotificationRole = "owner" | "admin" | "guru" | "orangTua";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function NotificationDropdown({ role }: { role?: NotificationRole }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  // Tentukan role aktif secara akurat dari prop maupun URL pathname
  const resolvedRole: NotificationRole =
    role ||
    (pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/guru")
      ? "guru"
      : pathname.startsWith("/orang-tua")
      ? "orangTua"
      : "owner");

  const rolePrefix =
    resolvedRole === "orangTua"
      ? "orang-tua"
      : resolvedRole === "guru"
      ? "guru"
      : resolvedRole === "admin"
      ? "admin"
      : "owner";

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    const storageKey = `bsd_read_notifications_${resolvedRole}`;
    let readSet = new Set<string>();
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        readSet = new Set(JSON.parse(stored));
      }
    } catch {
      // ignore storage error
    }

    const liveItems: NotificationItem[] = [];

    try {
      // 1. Verifikasi Cash Pending (Owner & Admin)
      if (resolvedRole === "owner" || resolvedRole === "admin") {
        try {
          const cashRes = await getCashTransactions({ status: "menunggu_konfirmasi_admin", per_page: 10 });
          const cashList = Array.isArray(cashRes?.data?.data)
            ? cashRes.data.data
            : Array.isArray(cashRes?.data)
            ? cashRes.data
            : [];
          if (cashList.length > 0) {
            const id = `live-cash-pending-${cashList.length}`;
            liveItems.push({
              id,
              title: "Verifikasi Pembayaran Tunai",
              message: `Terdapat ${cashList.length} pembayaran cash dari orang tua yang menunggu konfirmasi Anda`,
              type: "warning",
              read: readSet.has(id),
              createdAt: new Date().toISOString(),
              href: rolePrefix === "admin" ? "/admin/verifikasi-cash" : "/owner/verifikasi-cash",
            });
          }
        } catch {
          // ignore
        }
      }

      // 2. Jadwal Sesi Mengajar Hari Ini (Guru)
      if (resolvedRole === "guru") {
        try {
          const today = new Date().toISOString().split("T")[0];
          const sessionsRes = await getClassSessions({ date: today });
          if (Array.isArray(sessionsRes) && sessionsRes.length > 0) {
            const id = `live-guru-sessions-${today}-${sessionsRes.length}`;
            liveItems.push({
              id,
              title: "Jadwal Mengajar Hari Ini",
              message: `Anda memiliki ${sessionsRes.length} sesi belajar terjadwal hari ini`,
              type: "info",
              read: readSet.has(id),
              createdAt: new Date().toISOString(),
              href: "/guru/jadwal",
            });
          }
        } catch {
          // ignore
        }
      }

      // 3. Tagihan Belum Lunas (Orang Tua)
      if (resolvedRole === "orangTua") {
        try {
          const plansRes = await getPaymentPlans({ is_paid: false, per_page: 5 });
          const plansList = Array.isArray(plansRes?.data?.data)
            ? plansRes.data.data
            : Array.isArray(plansRes?.data)
            ? plansRes.data
            : [];
          if (plansList.length > 0) {
            const id = `live-unpaid-plan-${plansList.length}`;
            liveItems.push({
              id,
              title: "Tagihan Pembayaran",
              message: `Anda memiliki ${plansList.length} tagihan sesi belajar yang belum diselesaikan`,
              type: "warning",
              read: readSet.has(id),
              createdAt: new Date().toISOString(),
              href: "/orang-tua/pembayaran",
            });
          }
        } catch {
          // ignore
        }
      }

      // 4. Pengumuman Aktif Terbaru (Semua Role)
      try {
        const annRes = await getAnnouncements({ per_page: 5 });
        const annList = Array.isArray(annRes?.data?.data)
          ? annRes.data.data
          : Array.isArray(annRes?.data)
          ? annRes.data
          : Array.isArray(annRes)
          ? annRes
          : [];

        annList.forEach((a: any) => {
          if (a.title && (a.status === "published" || a.status === "Published" || !a.status)) {
            const id = `live-ann-${a.id}`;
            const targetHref = `/${rolePrefix}/pengumuman?id=${a.id}`;

            const snippet = a.description
              ? a.description.length > 70
                ? a.description.slice(0, 70) + "..."
                : a.description
              : "Pengumuman baru telah diterbitkan oleh pihak sekolah";

            liveItems.push({
              id,
              title: a.title,
              message: snippet,
              type: "info",
              read: readSet.has(id),
              createdAt: a.published_at || a.created_at || new Date().toISOString(),
              href: targetHref,
            });
          }
        });
      } catch {
        // ignore
      }
    } catch (e) {
      console.warn("Gagal memuat notifikasi langsung:", e);
    }

    const seen = new Set<string>();
    const deduplicated = liveItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    setNotifications(deduplicated);
    setLoading(false);
  }, [resolvedRole, rolePrefix]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (e: React.MouseEvent, item: NotificationItem) => {
    e.preventDefault();
    if (!item.read) {
      const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
      setNotifications(updated);
      try {
        const storageKey = `bsd_read_notifications_${resolvedRole}`;
        const readIds = updated.filter((n) => n.read).map((n) => n.id);
        localStorage.setItem(storageKey, JSON.stringify(readIds));
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (item.href && item.href !== "#") {
      router.push(item.href);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      const storageKey = `bsd_read_notifications_${resolvedRole}`;
      const readIds = updated.map((n) => n.id);
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    } catch {
      // ignore
    }
  };

  const getTypeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return { dot: "#f59e0b", bg: "#fffbeb", border: "#fef3c7" };
      case "error":
        return { dot: "#ef4444", bg: "#fef2f2", border: "#fee2e2" };
      case "success":
        return { dot: "#10b981", bg: "#f0fdf4", border: "#dcfce7" };
      case "info":
      default:
        return { dot: "#2563eb", bg: "#eff6ff", border: "#dbeafe" };
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="header-icon-btn"
        aria-label="Notifikasi"
        onClick={() => setOpen(!open)}
        style={{ position: "relative" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="badge-dot" />}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 60,
              width: 360,
              maxWidth: "calc(100vw - 24px)",
              overflow: "hidden",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  Notifikasi
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#ffffff",
                      background: "var(--color-primary, #1a5c8a)",
                      borderRadius: 999,
                      padding: "1px 7px",
                    }}
                  >
                    {unreadCount} Baru
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px 8px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--color-primary, #1a5c8a)",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 12.5 }}>
                  Memeriksa notifikasi...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 12.5 }}>
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.map((n) => {
                  const style = getTypeStyle(n.type);
                  const isUnread = !n.read;
                  return (
                    <a
                      key={n.id}
                      href={n.href || "#"}
                      onClick={(e) => handleItemClick(e, n)}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "12px 16px",
                        textDecoration: "none",
                        borderBottom: "1px solid var(--color-border-light)",
                        background: isUnread ? "rgba(26, 92, 138, 0.04)" : "#ffffff",
                        transition: "background 0.15s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isUnread ? "rgba(26, 92, 138, 0.08)" : "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isUnread ? "rgba(26, 92, 138, 0.04)" : "#ffffff";
                      }}
                    >
                      {/* Indicator Dot */}
                      <div style={{ marginTop: 4, flexShrink: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isUnread ? style.dot : "#cbd5e1",
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12.5,
                              fontWeight: isUnread ? 700 : 600,
                              color: "var(--color-text-primary)",
                              lineHeight: 1.3,
                            }}
                          >
                            {n.title}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              color: "var(--color-text-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: isUnread ? "var(--color-text-secondary, #475569)" : "var(--color-text-muted, #64748b)",
                            marginTop: 3,
                            lineHeight: 1.4,
                          }}
                        >
                          {n.message}
                        </div>
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
