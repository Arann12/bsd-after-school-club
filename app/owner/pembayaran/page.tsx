// @ts-nocheck
"use client";
import { invoices, revenueSummary } from "@/lib/data";
import { formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonStatGrid } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function OwnerPembayaranPage() {
  const loading = useLoadingState(400);

  const paidInvoices = invoices.filter(i => i.status === "Lunas");
  const unpaidInvoices = invoices.filter(i => i.status === "Belum Bayar" || i.status === "Overdue");
  const partialInvoices = invoices.filter(i => i.status === "Partially Paid");
  const pendingInvoices = invoices.filter(i => i.status === "Menunggu Konfirmasi");

  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.jumlah, 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.jumlah, 0);
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.jumlah, 0);

  const countPaid = useCountUp(paidInvoices.length);
  const countUnpaid = useCountUp(unpaidInvoices.length);
  const countPartial = useCountUp(partialInvoices.length);
  const countPendingInv = useCountUp(pendingInvoices.length);

  if (loading) return <SkeletonStatGrid />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Pembayaran"
        subtitle="Ringkasan pemasukan dan status pembayaran bulan ini."
        actions={<Link href="/owner/tagihan" className="btn btn-outline">Lihat Tagihan →</Link>}
      />

      {/* Revenue Summary Banner */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pemasukan Bulan Ini</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>{formatRupiah(revenueSummary.totalIncome)}</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Honor Terbayar</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{formatRupiah(revenueSummary.honorPaid)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7" }}>{formatRupiah(revenueSummary.netProfit)}</div>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Sudah Lunas" value={countPaid} detail={formatRupiah(totalPaid)} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Belum Bayar" value={countUnpaid} detail={formatRupiah(totalUnpaid)} color="var(--color-danger)" bg="var(--color-danger-bg)" />
        <StatCard label="Bayar Sebagian" value={countPartial} color="#0369a1" bg="var(--color-info-bg)" />
        <StatCard label="Menunggu Konfirmasi" value={countPendingInv} detail={formatRupiah(totalPending)} color="#b45309" bg="var(--color-warning-bg)" />
      </div>

      {/* Revenue by Program */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Pemasukan per Program</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {revenueSummary.byProgram.map((p, i) => {
            const colors = ["var(--color-primary)", "#059669", "#7c3aed", "#d97706"];
            const pct = Math.round((p.amount / revenueSummary.totalIncome) * 100);
            return (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-primary)" }}>{p.name}</span>
                  <span style={{ color: colors[i] }}>{formatRupiah(p.amount)} ({pct}%)</span>
                </div>
                <div style={{ height: 10, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: colors[i], width: `${pct}%`, borderRadius: 999, transition: "width .6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Pembayaran Terakhir</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {invoices.filter(i => i.status === "Lunas" || i.status === "Menunggu Konfirmasi").map((inv, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{inv.siswa}</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{inv.program} · {inv.metode} · {inv.tanggal}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: inv.status === "Lunas" ? "var(--color-success)" : "var(--color-warning)" }}>{formatRupiah(inv.jumlah)}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{inv.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
