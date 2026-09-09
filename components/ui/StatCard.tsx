"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  color: string;
  bg?: string;
  icon?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" };
}

export default function StatCard({ label, value, detail, color, bg, icon, trend }: StatCardProps) {
  return (
    <div className="stat-card" style={{ gap: 8 }}>
      <div className="stat-card-header">
        <span className="stat-card-label" style={{ fontSize: 12.5, lineHeight: 1.3 }}>{label}</span>
        {icon ? (
          <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: bg || `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
        ) : bg ? (
          <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          </div>
        ) : null}
      </div>
      <div className="stat-card-value" style={{ fontSize: 26, color }}>{value}</div>
      {detail && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{detail}</div>}
      {trend && (
        <div className={`stat-card-trend ${trend.direction === "up" ? "trend-up" : "trend-down"}`} style={{ fontSize: 12 }}>
          {trend.direction === "up" ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </div>
  );
}
