"use client";

/* ---- Base shimmer animation (injected once) ---- */
const shimmerStyle = `
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: var(--radius-md); }
`;

/* ---- SkeletonCard ---- */
export function SkeletonCard() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: 20 }}>
        <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 28, width: "30%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "50%" }} />
      </div>
    </>
  );
}

/* ---- SkeletonCardGrid ---- */
export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="skeleton" style={{ height: 16, width: 80, borderRadius: 999 }} />
              <div className="skeleton" style={{ height: 14, width: 100 }} />
            </div>
            <div className="skeleton" style={{ height: 20, width: "70%" }} />
            <div className="skeleton" style={{ height: 14, width: "90%" }} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- SkeletonStatGrid ---- */
export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 14 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="skeleton" style={{ height: 12, width: "60%" }} />
            <div className="skeleton" style={{ height: 28, width: "40%" }} />
            <div className="skeleton" style={{ height: 11, width: "50%" }} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- SkeletonTable ---- */
export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", gap: 16, borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 10, flex: i === 1 ? 2 : 1 }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ padding: "14px 16px", display: "flex", gap: 16, borderBottom: r < rows - 1 ? "1px solid var(--color-border-light)" : "none" }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton" style={{ height: 14, flex: c === 1 ? 2 : 1 }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- SkeletonDashboard ---- */
export function SkeletonDashboard() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="skeleton" style={{ height: 24, width: 240, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: 360 }} />
          </div>
        </div>
        {/* Banner */}
        <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)" }} />
        {/* Stats */}
        <SkeletonStatGrid />
        {/* Content blocks */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-lg)" }} />
        </div>
      </div>
    </>
  );
}
