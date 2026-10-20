"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/constants";
import { SkeletonStatGrid, SkeletonTable } from "@/components/ui/Skeleton";
import SearchableSelect from "@/components/ui/SearchableSelect";
import {
  getFinanceDashboard,
  getPaymentPlans,
  getPayments,
} from "@/lib/api/finance";
import { getPrograms } from "@/lib/api/academic";
import { exportToExcel } from "@/lib/utils/exportExcel";

type Tab = "ringkasan" | "transaksi" | "tunggakan";

const MONTHS = [
  { m: 1, name: "Januari" }, { m: 2, name: "Februari" }, { m: 3, name: "Maret" },
  { m: 4, name: "April" },  { m: 5, name: "Mei" },       { m: 6, name: "Juni" },
  { m: 7, name: "Juli" },   { m: 8, name: "Agustus" },   { m: 9, name: "September" },
  { m: 10, name: "Oktober" },{ m: 11, name: "November" },{ m: 12, name: "Desember" },
];

function extractList(resVal: any): any[] {
  if (!resVal) return [];
  if (Array.isArray(resVal)) return resVal;
  if (Array.isArray(resVal.data)) return resVal.data;
  if (Array.isArray(resVal.data?.data)) return resVal.data.data;
  return [];
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "–";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "–";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
}

const COLORS = ["var(--color-primary)", "#059669", "#7c3aed", "#d97706", "#0284c7"];

export default function OwnerPembayaranPage() {
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [loading, setLoading] = useState(true);

  // Period filter
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [programStats, setProgramStats] = useState<{ name: string; amount: number; pct: number }[]>([]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [dashRes, plansRes, paymentsRes] = await Promise.allSettled([
        getFinanceDashboard({ year: selectedYear, month: selectedMonth }),
        getPaymentPlans({ per_page: 500 }),
        getPayments({ per_page: 500 }),
      ]);

      const dash = dashRes.status === "fulfilled" ? dashRes.value : null;
      const planList = plansRes.status === "fulfilled" ? extractList(plansRes.value) : [];
      const payList = paymentsRes.status === "fulfilled" ? extractList(paymentsRes.value) : [];

      setDashboardData(dash);
      setPlans(planList);
      setPayments(payList);

      // Program breakdown dari payment plans
      const totalPaid = planList
        .filter((p: any) => p.is_paid || (p.status || "").toLowerCase() === "paid")
        .reduce((a: number, p: any) => a + Number(p.amount || 0), 0);

      const pMap: Record<string, number> = {};
      planList.forEach((p: any) => {
        const progName =
          p.enrollment?.classroom?.program_level?.program?.name ||
          p.enrollment?.program?.name ||
          p.enrollment?.programLevel?.program?.name ||
          "Program Reguler";
        const amt = Number(p.amount || 0);
        pMap[progName] = (pMap[progName] || 0) + amt;
      });

      setProgramStats(
        Object.entries(pMap).map(([name, amount]) => ({
          name,
          amount,
          pct: totalPaid > 0 ? Math.round((amount / totalPaid) * 100) : 0,
        }))
      );
    } catch (err) {
      console.warn("Gagal memuat data pembayaran:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived KPIs
  const summary = dashboardData?.summary || dashboardData?.data?.summary || {};
  const totalIncome = Number(summary.total_monthly_income || summary.total_income || 0);
  const digitalIncome = Number(summary.digital_income || 0);
  const cashIncome = Number(summary.cash_income || 0);
  const totalPayroll = Number(summary.total_payroll_expense || summary.total_payroll || 0);
  const netIncome = Number(summary.net_operating_income || totalIncome - totalPayroll);
  const overdueAmount = Number(summary.total_overdue_amount || 0);

  let paidCount = 0, unpaidCount = 0, pendingCount = 0;
  let totalPaid = 0, totalUnpaid = 0, totalPending = 0;
  plans.forEach((p: any) => {
    const amt = Number(p.amount || 0);
    const st = (p.status || "").toLowerCase();
    const hasPending = Array.isArray(p.cash_transactions)
      ? p.cash_transactions.some((c: any) => (c.status || "").toLowerCase() === "menunggu_konfirmasi_admin")
      : false;
    if (p.is_paid || st === "paid") { paidCount++; totalPaid += amt; }
    else if (st === "menunggu_konfirmasi_admin" || hasPending) { pendingCount++; totalPending += amt; }
    else { unpaidCount++; totalUnpaid += amt; }
  });

  // Overdue / tunggakan
  const overduePlans = plans.filter((p: any) => {
    const st = (p.status || "").toLowerCase();
    if (p.is_paid || st === "paid") return false;
    if (!p.due_date) return false;
    return new Date(p.due_date) < new Date();
  });

  // Helper: get student name from payment
  const getStudentName = (t: any) =>
    t.payment_plan?.enrollment?.student?.full_name ||
    t.payment_plan?.enrollment?.student?.name ||
    t.enrollment?.student?.full_name ||
    t.student?.full_name ||
    "Siswa Bimbel";

  // ─── EXPORT HANDLERS ─────────────────────────────────────────
  const monthLabel = MONTHS.find(m => m.m === selectedMonth)?.name || String(selectedMonth);

  const handleExportRingkasan = () => {
    const data = [
      { "Indikator": "Total Pendapatan", "Nilai (Rp)": Math.round(totalIncome) },
      { "Indikator": "Pendapatan Digital (QRIS/VA)", "Nilai (Rp)": Math.round(digitalIncome) },
      { "Indikator": "Pendapatan Tunai (Cash)", "Nilai (Rp)": Math.round(cashIncome) },
      { "Indikator": "Total Payroll / Honor Guru", "Nilai (Rp)": Math.round(totalPayroll) },
      { "Indikator": "Laba Bersih Operasional", "Nilai (Rp)": Math.round(netIncome) },
      { "Indikator": "Tunggakan Overdue", "Nilai (Rp)": Math.round(overdueAmount) },
      {},
      { "Indikator": "Tagihan Lunas (count)", "Nilai (Rp)": paidCount },
      { "Indikator": "Tagihan Belum Bayar (count)", "Nilai (Rp)": unpaidCount },
      { "Indikator": "Menunggu Verifikasi (count)", "Nilai (Rp)": pendingCount },
      { "Indikator": "Total Nominal Lunas", "Nilai (Rp)": Math.round(totalPaid) },
      { "Indikator": "Total Nominal Belum Bayar", "Nilai (Rp)": Math.round(totalUnpaid) },
      { "Indikator": "Total Nominal Menunggu", "Nilai (Rp)": Math.round(totalPending) },
    ];
    exportToExcel(data, `Ringkasan_Keuangan_${monthLabel}_${selectedYear}.xlsx`, `Ringkasan ${monthLabel} ${selectedYear}`);
  };

  const handleExportTransaksi = () => {
    if (payments.length === 0) { alert("Tidak ada data transaksi untuk diekspor."); return; }
    const data = payments.map((t, idx) => ({
      "No": idx + 1,
      "ID Transaksi": t.payment_code || t.id?.substring(0, 8).toUpperCase() || "-",
      "Nama Siswa": getStudentName(t),
      "Metode Pembayaran": (t.payment_method || "Digital").toUpperCase(),
      "Nominal (Rp)": Math.round(Number(t.total_amount || t.amount || 0)),
      "Status": t.payment_status === "paid" ? "Lunas" : (t.payment_status || "-"),
      "Waktu Bayar": formatDateTime(t.paid_at || t.created_at),
    }));
    exportToExcel(data, `Transaksi_Pembayaran_${monthLabel}_${selectedYear}.xlsx`, `Transaksi ${monthLabel} ${selectedYear}`);
  };

  const handleExportTunggakan = () => {
    if (overduePlans.length === 0) { alert("Tidak ada data tunggakan untuk diekspor."); return; }
    const data = overduePlans.map((p, idx) => ({
      "No": idx + 1,
      "Kode Siswa": p.enrollment?.student?.student_code || p.enrollment?.student?.full_name?.substring(0,4).toUpperCase() || "-",
      "Nama Siswa": p.enrollment?.student?.full_name || p.enrollment?.student?.name || "Siswa",
      "Program": p.enrollment?.classroom?.program_level?.program?.name || p.enrollment?.program?.name || "-",
      "Sesi": p.session_number ? `Sesi #${p.session_number}` : "-",
      "Nominal Tagihan (Rp)": Math.round(Number(p.amount || 0)),
      "Jatuh Tempo": formatDate(p.due_date),
      "Status": "Overdue / Belum Lunas",
    }));
    exportToExcel(data, `Tunggakan_Overdue_${monthLabel}_${selectedYear}.xlsx`, `Tunggakan ${monthLabel} ${selectedYear}`);
  };

  if (loading) return <SkeletonStatGrid />;

  // ─── TABS CONFIG ──────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: "ringkasan",  label: "Ringkasan Keuangan" },
    { key: "transaksi",  label: "Riwayat Transaksi" },
    { key: "tunggakan",  label: "Tunggakan & Overdue" },
  ];

  const exportHandlers: Record<Tab, () => void> = {
    ringkasan: handleExportRingkasan,
    transaksi: handleExportTransaksi,
    tunggakan: handleExportTunggakan,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pembayaran &amp; Laporan Keuangan</h1>
          <p className="page-subtitle">
            Ringkasan keuangan, riwayat transaksi, dan tunggakan siswa BSD After School Club.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Ekspor Excel */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={exportHandlers[tab]}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, borderColor: "#059669", color: "#059669" }}
            title="Download Excel .xlsx"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="16" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Ekspor Excel
          </button>
          {/* Cetak */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => window.print()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Cetak
          </button>
          {/* Refresh */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fetchData(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Period Filter ── */}
      <div className="card">
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>Periode Laporan:</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SearchableSelect
              className="select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ padding: "6px 12px", fontSize: 13, minWidth: 140 }}
            >
              {MONTHS.map(m => <option key={m.m} value={m.m}>{m.name}</option>)}
            </SearchableSelect>
            <SearchableSelect
              className="select-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: "6px 12px", fontSize: 13, minWidth: 90 }}
            >
              {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
            </SearchableSelect>
          </div>
        </div>
      </div>

      {/* ── KPI Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a5c8a 0%, #0f3c5d 100%)",
        borderRadius: "var(--radius-lg)", padding: "24px 28px", color: "white",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Pendapatan · {monthLabel} {selectedYear}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>{formatRupiah(totalIncome)}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Digital: {formatRupiah(digitalIncome)} &nbsp;·&nbsp; Tunai: {formatRupiah(cashIncome)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Honor Guru</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fca5a5" }}>{formatRupiah(totalPayroll)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Laba Bersih</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#6ee7b7" }}>{formatRupiah(netIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Tunggakan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fcd34d" }}>{formatRupiah(overdueAmount)}</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--color-border-light)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px",
              background: tab === t.key ? "var(--color-primary-bg, #eff6ff)" : "transparent",
              color: tab === t.key ? "var(--color-primary, #1d4ed8)" : "var(--color-text-secondary)",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--color-primary, #1d4ed8)" : "2px solid transparent",
              marginBottom: -2,
              borderRadius: "6px 6px 0 0",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13.5,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
            {t.key === "tunggakan" && overduePlans.length > 0 && (
              <span style={{
                marginLeft: 7, background: "#dc2626", color: "white",
                fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 999
              }}>{overduePlans.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: RINGKASAN KEUANGAN
      ══════════════════════════════════════════════════════ */}
      {tab === "ringkasan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Breakdown Tagihan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div className="card" style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>Penerimaan Lunas</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#166534", marginTop: 6 }}>{formatRupiah(totalPaid)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{paidCount} tagihan lunas terbayar</div>
            </div>
            <div className="card" style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>Menunggu Verifikasi</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#92400e", marginTop: 6 }}>{formatRupiah(totalPending)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{pendingCount} tagihan dalam proses</div>
            </div>
            <div className="card" style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", textTransform: "uppercase" }}>Belum Dibayar</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#991b1b", marginTop: 6 }}>{formatRupiah(totalUnpaid)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{unpaidCount} tagihan belum dibayar</div>
            </div>
          </div>

          {/* Program Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 16px" }}>Distribusi Tagihan per Program</h3>
            {programStats.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Belum ada data distribusi program.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {programStats.map((p, i) => {
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={p.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                        <span style={{ color: "var(--color-text-primary)" }}>{p.name}</span>
                        <span style={{ color }}>{formatRupiah(p.amount)} <span style={{ opacity: 0.7, fontSize: 11 }}>({p.pct}%)</span></span>
                      </div>
                      <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: color, width: `${Math.min(100, p.pct)}%`, borderRadius: 999, transition: "width .6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: RIWAYAT TRANSAKSI
      ══════════════════════════════════════════════════════ */}
      {tab === "transaksi" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Riwayat Transaksi Pembayaran</h3>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{payments.length} transaksi</span>
          </div>
          {payments.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
              Belum ada data transaksi pembayaran.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                    {["No", "ID Transaksi", "Nama Siswa", "Metode", "Nominal", "Status", "Waktu Bayar"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((t, i) => {
                    const isPaid = t.payment_status === "paid" || t.payment_status === "settlement";
                    return (
                      <tr key={t.id} style={{ borderBottom: i < payments.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                        <td style={{ padding: "13px 14px", color: "var(--color-text-muted)", fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: "13px 14px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 12 }}>
                          {t.payment_code || t.id?.substring(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: "13px 14px", fontWeight: 700 }}>{getStudentName(t)}</td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{ textTransform: "uppercase", background: "var(--color-bg)", border: "1px solid var(--color-border)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {t.payment_method || "Digital"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 14px", fontWeight: 800, color: "#059669" }}>
                          {formatRupiah(Number(t.total_amount || t.amount || 0))}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{
                            background: isPaid ? "#d1fae5" : "#fef3c7",
                            color: isPaid ? "#059669" : "#b45309",
                            fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                          }}>
                            {isPaid ? "Lunas" : (t.payment_status || "Pending")}
                          </span>
                        </td>
                        <td style={{ padding: "13px 14px", color: "var(--color-text-secondary)", fontSize: 12 }}>
                          {formatDateTime(t.paid_at || t.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: TUNGGAKAN & OVERDUE
      ══════════════════════════════════════════════════════ */}
      {tab === "tunggakan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary overdue */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Total Tagihan Overdue</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#991b1b", marginTop: 6 }}>{formatRupiah(overdueAmount || totalUnpaid)}</div>
              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{overduePlans.length} tagihan melewati jatuh tempo</div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309" }}>Belum Jatuh Tempo</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#92400e", marginTop: 6 }}>{formatRupiah(totalPending)}</div>
              <div style={{ fontSize: 12, color: "#b45309", marginTop: 4 }}>{pendingCount} tagihan masih dalam proses</div>
            </div>
          </div>

          {/* Tabel tunggakan */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Daftar Tagihan Melewati Jatuh Tempo</h3>
              <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>{overduePlans.length} tagihan overdue</span>
            </div>
            {overduePlans.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                Tidak ada tagihan yang melewati jatuh tempo. Semua tagihan tertib dibayar.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#fff5f5", borderBottom: "1px solid #fecaca" }}>
                      {["No", "Nama Siswa", "Program & Sesi", "Nominal", "Jatuh Tempo", "Status"].map(h => (
                        <th key={h} style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overduePlans.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < overduePlans.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                        <td style={{ padding: "13px 14px", color: "var(--color-text-muted)", fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ fontWeight: 700 }}>{p.enrollment?.student?.full_name || "Siswa"}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{p.enrollment?.student?.student_code || ""}</div>
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <div style={{ fontWeight: 600 }}>
                            {p.enrollment?.classroom?.program_level?.program?.name || p.enrollment?.program?.name || "Program"}
                          </div>
                          {p.session_number && (
                            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Sesi #{p.session_number}</div>
                          )}
                        </td>
                        <td style={{ padding: "13px 14px", fontWeight: 800, color: "#dc2626" }}>
                          {formatRupiah(Number(p.amount || 0))}
                        </td>
                        <td style={{ padding: "13px 14px", color: "#b45309", fontWeight: 600 }}>
                          {formatDate(p.due_date)}
                        </td>
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                            Overdue
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
