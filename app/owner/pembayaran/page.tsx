"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonStatGrid } from "@/components/ui/Skeleton";
import Link from "next/link";
import { getFinanceSummary, getPaymentPlans, getPayments } from "@/lib/api/finance";
import { getPrograms } from "@/lib/api/academic";

export default function OwnerPembayaranPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    honorPaid: 0,
    netProfit: 0,
    paidCount: 0,
    unpaidCount: 0,
    pendingCount: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalPending: 0,
  });
  const [programStats, setProgramStats] = useState<{ name: string; amount: number; pct: number }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, plansRes, paymentsRes, programsRes] = await Promise.allSettled([
        getFinanceSummary(),
        getPaymentPlans({ per_page: 100 }),
        getPayments({ per_page: 100 }),
        getPrograms({ per_page: 100 }),
      ]);

      let totalIncome = 0;
      let honorPaid = 0;

      if (sumRes.status === "fulfilled" && sumRes.value) {
        totalIncome = Number(sumRes.value.total_income || sumRes.value.income || 0);
        honorPaid = Number(sumRes.value.total_honor || sumRes.value.honor_paid || 0);
      }

      const plans = plansRes.status === "fulfilled" && Array.isArray(plansRes.value?.data) ? plansRes.value.data : [];
      const payments = paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value?.data) ? paymentsRes.value.data : [];

      let paidCount = 0;
      let unpaidCount = 0;
      let pendingCount = 0;
      let totalPaid = 0;
      let totalUnpaid = 0;
      let totalPending = 0;

      plans.forEach((p: any) => {
        const amt = Number(p.amount || 0);
        if (p.is_paid || (p.status || "").toLowerCase() === "paid") {
          paidCount++;
          totalPaid += amt;
        } else if ((p.status || "").toLowerCase().includes("pending")) {
          pendingCount++;
          totalPending += amt;
        } else {
          unpaidCount++;
          totalUnpaid += amt;
        }
      });

      if (totalIncome === 0 && totalPaid > 0) {
        totalIncome = totalPaid;
      }

      const netProfit = totalIncome - honorPaid;

      // Program Breakdown
      const programs = programsRes.status === "fulfilled" && Array.isArray(programsRes.value?.data) ? programsRes.value.data : [];
      const pMap: Record<string, number> = {};

      plans.forEach((p: any) => {
        const progName = p.enrollment?.classroom?.program_level?.program?.name || p.enrollment?.program?.name || "Program Reguler";
        const amt = Number(p.amount || 0);
        pMap[progName] = (pMap[progName] || 0) + amt;
      });

      const progList = Object.entries(pMap).map(([name, amount]) => {
        const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
        return { name, amount, pct };
      });

      setSummary({
        totalIncome,
        honorPaid,
        netProfit,
        paidCount,
        unpaidCount,
        pendingCount,
        totalPaid,
        totalUnpaid,
        totalPending,
      });

      setProgramStats(progList);
    } catch (err) {
      console.warn("Gagal memuat ringkasan pembayaran owner:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <SkeletonStatGrid />;

  const colors = ["var(--color-primary)", "#059669", "#7c3aed", "#d97706", "#0284c7"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Ringkasan Pembayaran & Keuangan"
        subtitle="Ringkasan pemasukan, laba bersih, dan status pembayaran tagihan siswa secara realtime."
        actions={<Link href="/owner/tagihan" className="btn btn-outline">Lihat Daftar Tagihan →</Link>}
      />

      {/* Revenue Summary Banner */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #0f3c5d 100%)", borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pemasukan Sistem</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>{formatRupiah(summary.totalIncome)}</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Total Honor Guru</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{formatRupiah(summary.honorPaid)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7" }}>{formatRupiah(summary.netProfit)}</div>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Tagihan Lunas" value={summary.paidCount} detail={formatRupiah(summary.totalPaid)} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Belum Dibayar" value={summary.unpaidCount} detail={formatRupiah(summary.totalUnpaid)} color="var(--color-danger)" bg="var(--color-danger-bg)" />
        <StatCard label="Menunggu Verifikasi" value={summary.pendingCount} detail={formatRupiah(summary.totalPending)} color="#b45309" bg="var(--color-warning-bg)" />
      </div>

      {/* Revenue by Program */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Pemasukan per Program</h3>
        {programStats.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Belum ada data distribusi program.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {programStats.map((p, i) => {
              const color = colors[i % colors.length];
              return (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: "var(--color-text-primary)" }}>{p.name}</span>
                    <span style={{ color }}>{formatRupiah(p.amount)} ({p.pct}%)</span>
                  </div>
                  <div style={{ height: 10, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: color, width: `${Math.min(100, p.pct)}%`, borderRadius: 999, transition: "width .6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
