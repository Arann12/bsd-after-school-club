"use client";

import { useState } from "react";
import Link from "next/link";
import { notifications } from "@/lib/data";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button className="header-icon-btn" aria-label="Notifications" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="badge-dot" />}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "100%", right: 0, marginTop: 8,
            background: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)", zIndex: 60, width: 340, overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Notifikasi</span>
              {unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "var(--color-danger)", borderRadius: 999, padding: "1px 8px" }}>{unread} Baru</span>}
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {notifications.map(n => (
                <Link key={n.id} href={n.href || "#"} onClick={() => setOpen(false)} style={{
                  display: "block", padding: "10px 16px", textDecoration: "none",
                  borderBottom: "1px solid var(--color-border-light)",
                  background: n.read ? "#fff" : "var(--color-primary-bg)",
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{n.message}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
