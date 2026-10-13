"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getFinanceDashboard, getPayments } from "@/lib/api/finance";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function OwnerLaporanKeuanganPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, payRes] = await Promise.allSettled([
        getFinanceDashboard({ year: selectedYear, month: selectedMonth }),
        getPayments({ per_page: 20 }),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value);
      }

      if (payRes.status === "fulfilled") {
        const raw = Array.isArray(payRes.value?.data?.data)
          ? payRes.value.data.data
          : Array.isArray(payRes.value?.data)
          ? payRes.value.data
          : [];
        setTransactions(raw);
      }
    } catch (err) {
      console.warn("Gagal memuat laporan keuangan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const summary = dashboardData?.summary || {};
  const totalIncome = Number(summary.total_monthly_income || 0);
  const digitalIncome = Number(summary.digital_income || 0);
  const cashIncome = Number(summary.cash_income || 0);
  const totalPayroll = Number(summary.total_payroll_expense || 0);
  const netIncome = Number(summary.net_operating_income || totalIncome - totalPayroll);
  const overdueAmount = Number(summary.total_overdue_amount || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Keuangan & Rekonsiliasi</h1>
          <p className="page-subtitle">
            Ringkasan pendapatan, transaksi pembayaran digital & tunai, serta evaluasi operasional bimbel.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>
            Periode Laporan:
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SearchableSelect
              className="select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ padding: "6px 12px", fontSize: 13, minWidth: 140 }}
            >
              {[
                { m: 1, name: "Januari" },
                { m: 2, name: "Februari" },
                { m: 3, name: "Maret" },
                { m: 4, name: "April" },
                { m: 5, name: "Mei" },
                { m: 6, name: "Juni" },
                { m: 7, name: "Juli" },
                { m: 8, name: "Agustus" },
                { m: 9, name: "September" },
                { m: 10, name: "Oktober" },
                { m: 11, name: "November" },
                { m: 12, name: "Desember" },
              ].map((item) => (
                <option key={item.m} value={item.m}>
                  {item.name}
                </option>
              ))}
            </SearchableSelect>

            <SearchableSelect
              className="select-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: "6px 12px", fontSize: 13, minWidth: 100 }}
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </SearchableSelect>
          </div>
        </div>
      </div>

      {/* Metrics Top */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label">Total Pendapatan Bersih</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1d4ed8" }}>
            {loading ? "..." : `Rp ${Math.round(totalIncome).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Digital: Rp {Math.round(digitalIncome).toLocaleString("id-ID", { maximumFractionDigits: 0 })} · Cash: Rp {Math.round(cashIncome).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label">Pengeluaran Payroll / Honor</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#dc2626" }}>
            {loading ? "..." : `Rp ${Math.round(totalPayroll).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Honor guru & pengajar</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label">Laba Bersih Operasional</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#059669" }}>
            {loading ? "..." : `Rp ${Math.round(netIncome).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Pendapatan - Beban Honor</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label">Tunggakan Belum Lunas</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#b45309" }}>
            {loading ? "..." : `Rp ${Math.round(overdueAmount).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Tagihan melewati jatuh tempo</div>
        </div>
      </div>

      {/* Tabel Transaksi Pembayaran Terakhir */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-border)", background: "#fafafa" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
            Riwayat Transaksi Pembayaran
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 24 }}>
              <SkeletonTable rows={4} />
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
              Belum ada transaksi pembayaran pada periode ini.
            </div>
          ) : (
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID Transaksi", "Waktu Pembayaran", "Nama Siswa", "Metode", "Nominal", "Status"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => {
                  const studentName = t.payment_plan?.enrollment?.student?.full_name || t.payment_plan?.enrollment?.student?.name || t.enrollment?.student?.full_name || "Siswa Bimbel";
                  const paidDate = t.paid_at || t.created_at;
                  const formattedDate = paidDate
                    ? new Date(paidDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "-";

                  return (
                    <tr key={t.id} style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-text-muted)" }}>
                        {t.payment_code || t.id?.substring(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{formattedDate}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{studentName}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ textTransform: "uppercase", background: "var(--color-bg)", border: "1px solid var(--color-border)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {t.payment_method || "Digital"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: "#059669" }}>
                        Rp {Math.round(Number(t.total_amount || t.amount || 0)).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: t.payment_status === "paid" ? "#d1fae5" : "#fef3c7",
                            color: t.payment_status === "paid" ? "#059669" : "#b45309",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 999,
                          }}
                        >
                          {t.payment_status === "paid" ? "Lunas" : t.payment_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
