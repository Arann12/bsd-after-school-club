"use client";

import { useState, useCallback, useEffect } from "react";

interface ToastState {
  message: string;
  type?: "success" | "info" | "warning" | "danger";
}

const typeStyles: Record<string, { bg: string; border: string; color: string }> = {
  success: { bg: "var(--color-success-bg)", border: "#6ee7b7", color: "#047857" },
  info:    { bg: "var(--color-info-bg)",    border: "#93c5fd", color: "#1e40af" },
  warning: { bg: "var(--color-warning-bg)", border: "#fde68a", color: "#92400e" },
  danger:  { bg: "var(--color-danger-bg)",  border: "#fca5a5", color: "#b91c1c" },
};

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type?: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(t);
  }, [toast, duration]);

  return { toast, showToast };
}

export default function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const s = typeStyles[toast.type || "success"];

  return (
    <div style={{
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      borderRadius: 12,
      padding: "12px 18px",
      color: s.color,
      fontSize: 13,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 10,
      animation: "fadeIn 0.2s ease-out",
    }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {toast.message}
    </div>
  );
}
