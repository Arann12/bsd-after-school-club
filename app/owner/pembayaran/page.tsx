"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/constants";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonStatGrid } from "@/components/ui/Skeleton";
import Link from "next/link";
import { getFinanceDashboard, getPaymentPlans, getPayments } from "@/lib/api/finance";
import { getPrograms } from "@/lib/api/academic";

function extractList(resVal: any): any[] {
  if (!resVal) return [];
  if (Array.isArray(resVal)) return resVal;
  if (Array.isArray(resVal.data)) return resVal.data;
  if (Array.isArray(resVal.data?.data)) return resVal.data.data;
  return [];
}

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

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [dashRes, plansRes, paymentsRes, programsRes] = await Promise.allSettled([
        getFinanceDashboard(),
        getPaymentPlans({ per_page: 200 }),
        getPayments({ per_page: 200 }),
        getPrograms({ per_page: 100 }),
      ]);

      const dashData = dashRes.status === "fulfilled" ? dashRes.value : {};
      const plans = plansRes.status === "fulfilled" ? extractList(plansRes.value) : [];
      const payments = paymentsRes.status === "fulfilled" ? extractList(paymentsRes.value) : [];

      let paidCount = 0;
      let unpaidCount = 0;
      let pendingCount = 0;
      let totalPaid = 0;
      let totalUnpaid = 0;
      let totalPending = 0;

      plans.forEach((p: any) => {
        const amt = Number(p.amount || 0);
        const st = (p.status || "").toLowerCase();
        const hasPendingCash = Array.isArray(p.cash_transactions || p.cashTransactions)
          ? (p.cash_transactions || p.cashTransactions).some(
              (c: any) => (c.status || "").toLowerCase() === "menunggu_konfirmasi_admin"
            )
          : false;

        if (p.is_paid || st === "paid") {
          paidCount++;
          totalPaid += amt;
        } else if (st === "menunggu_konfirmasi_admin" || hasPendingCash) {
          pendingCount++;
          totalPending += amt;
        } else {
          unpaidCount++;
          totalUnpaid += amt;
        }
      });

      const summaryObj = dashData?.summary || dashData?.data?.summary || dashData?.data || dashData || {};
      let totalIncome = Number(summaryObj.total_income || summaryObj.total_monthly_income || 0);

      if (totalIncome === 0 && totalPaid > 0) {
        totalIncome = totalPaid;
      }
      if (totalIncome === 0 && payments.length > 0) {
        totalIncome = payments
          .filter((pay: any) => {
            const st = (pay.payment_status || pay.status || "").toLowerCase();
            return st === "paid" || st === "settlement" || st === "success" || st === "berhasil";
          })
          .reduce((acc: number, cur: any) => acc + Number(cur.total_amount || cur.amount || 0), 0);
      }

      const honorPaid = Number(summaryObj.total_payroll || summaryObj.total_payroll_expense || 0);
      const netProfit = totalIncome - honorPaid;

      // Program Breakdown
      const pMap: Record<string, number> = {};

      plans.forEach((p: any) => {
        const progName =
          p.enrollment?.classroom?.program_level?.program?.name ||
          p.enrollment?.program?.name ||
          p.enrollment?.programLevel?.program?.name ||
          "Program Reguler";
        const amt = Number(p.amount || 0);
        pMap[progName] = (pMap[progName] || 0) + amt;
      });

      const progList = Object.entries(pMap).map(([name, amount]) => {
        const pct = totalPaid > 0 ? Math.round((amount / totalPaid) * 100) : 0;
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
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto sync tiap 6 detik jika tab aktif
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData(true);
      }
    }, 6000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData]);

  if (loading) return <SkeletonStatGrid />;

  const colors = ["var(--color-primary)", "#059669", "#7c3aed", "#d97706", "#0284c7"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Ringkasan Pembayaran & Keuangan"
        subtitle="Ringkasan pemasukan, laba bersih, dan status pembayaran tagihan siswa secara realtime."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: 999 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Live Sync Realtime
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => fetchData(false)}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Segarkan
            </button>
            <Link href="/owner/tagihan" className="btn btn-primary btn-sm">Lihat Daftar Tagihan →</Link>
          </div>
        }
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
