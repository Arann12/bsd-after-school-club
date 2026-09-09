"use client";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, icon, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const defaultIcon = (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ marginBottom: 16 }}>{icon || defaultIcon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: "0 0 20px", maxWidth: 380, lineHeight: 1.5 }}>{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary" style={{ textDecoration: "none" }}>{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
