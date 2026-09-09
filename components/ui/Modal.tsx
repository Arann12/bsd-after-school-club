"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, maxWidth = 520, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        style={{
          background: "#fff", borderRadius: "var(--radius-xl)",
          maxWidth, width: "100%", padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---- Confirm Dialog ---- */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Konfirmasi", cancelLabel = "Batal", variant = "default",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={440}>
      <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose}>{cancelLabel}</button>
        <button
          className={`btn ${variant === "danger" ? "btn-danger" : "btn-accent"}`}
          style={variant === "danger" ? { background: "var(--color-danger)", color: "#fff" } : undefined}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
