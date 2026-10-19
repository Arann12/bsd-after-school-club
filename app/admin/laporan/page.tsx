"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getAcademicDashboard, type AcademicDashboardData } from "@/lib/api/academic";
import { getFinanceDashboard, getIncomeReport, getOutstandingReport } from "@/lib/api/finance";
import { exportToExcel } from "@/lib/utils/exportExcel";

interface IncomeItem {
  id: string;
  payment_code: string;
  student?: { full_name: string };
  enrollment?: { program?: { name: string } };
  payment_method: string;
  total_amount: number;
  paid_at: string;
}

interface OutstandingItem {
  id: string;
  session_number: number;
  amount: number;
  due_date: string;
  status: string;
  enrollment?: {
    student?: { full_name: string; student_code: string };
    program?: { name: string };
  };
}

export default function AdminLaporanPage() {
  const [tab, setTab] = useState<"ringkasan" | "pendapatan" | "tunggakan">("ringkasan");
  const [loading, setLoading] = useState(true);
  const [academicData, setAcademicData] = useState<AcademicDashboardData | null>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  const [outstandingList, setOutstandingList] = useState<OutstandingItem[]>([]);

  const formatRupiah = (val?: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatTanggal = (dateStr?: string | null) => {
    if (!dateStr) return "–";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [acadRes, finRes, incRes, outRes] = await Promise.allSettled([
        getAcademicDashboard(),
        getFinanceDashboard(),
        getIncomeReport(),
        getOutstandingReport(),
      ]);

      if (acadRes.status === "fulfilled") {
        setAcademicData(acadRes.value);
      }
      if (finRes.status === "fulfilled") {
        setFinanceData(finRes.value?.data || finRes.value);
      }
      if (incRes.status === "fulfilled") {
        const incData = incRes.value?.data?.payments || incRes.value?.data || incRes.value || [];
        setIncomeList(Array.isArray(incData) ? incData : []);
      }
      if (outRes.status === "fulfilled") {
        const outData = outRes.value?.data?.overdue_plans || outRes.value?.data || outRes.value || [];
        setOutstandingList(Array.isArray(outData) ? outData : []);
      }
    } catch (err) {
      console.error("Gagal memuat laporan admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = academicData?.summary;
  const attendance = academicData?.attendance_today;

  const handleExportExcel = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    if (tab === "pendapatan") {
      if (incomeList.length === 0) {
        alert("Tidak ada data pendapatan untuk diekspor.");
        return;
      }
      const data = incomeList.map((row, idx) => ({
        "No": idx + 1,
        "Kode Transaksi": row.payment_code,
        "Nama Siswa": row.student?.full_name || "-",
        "Program": row.enrollment?.program?.name || "-",
        "Metode Pembayaran": (row.payment_method || "-").toUpperCase(),
        "Nominal (Rp)": row.total_amount || 0,
        "Tanggal Lunas": formatTanggal(row.paid_at),
      }));
      exportToExcel(data, `Laporan_Penerimaan_Kasir_${dateStr}.xlsx`, "Penerimaan Kasir");
    } else if (tab === "tunggakan") {
      if (outstandingList.length === 0) {
        alert("Tidak ada data tunggakan untuk diekspor.");
        return;
      }
      const data = outstandingList.map((row, idx) => ({
        "No": idx + 1,
        "Kode Siswa": row.enrollment?.student?.student_code || "-",
        "Nama Siswa": row.enrollment?.student?.full_name || "-",
        "Program": row.enrollment?.program?.name || "-",
        "Sesi": `Sesi #${row.session_number}`,
        "Nominal Tagihan (Rp)": row.amount || 0,
        "Jatuh Tempo": formatTanggal(row.due_date),
        "Status": "Belum Lunas",
      }));
      exportToExcel(data, `Laporan_Piutang_Tunggakan_${dateStr}.xlsx`, "Piutang & Tunggakan");
    } else {
      const data = [
        { "Indikator": "Siswa Aktif", "Nilai": summary?.active_students ?? 0 },
        { "Indikator": "Total Terdaftar", "Nilai": summary?.total_students ?? 0 },
        { "Indikator": "Guru & Pengajar", "Nilai": summary?.active_teachers ?? 0 },
        { "Indikator": "Kelas Berjalan", "Nilai": summary?.active_classrooms ?? 0 },
        { "Indikator": "Kehadiran Hadir", "Nilai": attendance?.present ?? 0 },
        { "Indikator": "Kehadiran Terlambat", "Nilai": attendance?.late ?? 0 },
        { "Indikator": "Kehadiran Izin/Sakit", "Nilai": attendance?.excused ?? 0 },
        { "Indikator": "Kehadiran Alpa", "Nilai": attendance?.absent ?? 0 },
      ];
      exportToExcel(data, `Ringkasan_Operasional_${dateStr}.xlsx`, "Ringkasan Operasional");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "var(--radius-lg, 14px)",
          padding: "28px 32px",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>
            Laporan Operasional &amp; Keuangan Admin
          </h1>
          <p style={{ fontSize: 13.5, opacity: 0.9, margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
            Rekapitulasi lengkap data operasional harian, absensi kehadiran siswa, dan mutasi penerimaan kasir BSD After School Club.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: "9px 16px",
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak / Ekspor PDF
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              padding: "9px 16px",
              background: "#ffffff",
              color: "#059669",
              border: "none",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
            }}
            title="Download file Excel (.xlsx)"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={loadData}
            style={{
              padding: "9px 16px",
              background: "#ffffff",
              color: "#059669",
              border: "none",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
            }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid var(--color-border-light, #e2e8f0)", paddingBottom: 2 }}>
        {[
          { key: "ringkasan", label: "Ringkasan Operasional" },
          { key: "pendapatan", label: "Penerimaan & Kasir" },
          { key: "tunggakan", label: "Piutang & Tunggakan" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "10px 18px",
              background: tab === t.key ? "var(--color-primary-bg, #ecfdf5)" : "transparent",
              color: tab === t.key ? "#059669" : "var(--color-text-secondary, #64748b)",
              border: "none",
              borderBottom: tab === t.key ? "2px solid #059669" : "2px solid transparent",
              marginBottom: -2,
              borderRadius: "6px 6px 0 0",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13.5,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RINGKASAN OPERASIONAL */}
      {tab === "ringkasan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 12, padding: "20px 22px", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-muted, #94a3b8)", textTransform: "uppercase" }}>Siswa Aktif</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-text-primary, #0f172a)", marginTop: 6 }}>
                {loading ? "..." : summary?.active_students ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary, #64748b)", marginTop: 4 }}>
                Total terdaftar: {summary?.total_students ?? 0} siswa
              </div>
            </div>

            <div style={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 12, padding: "20px 22px", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-muted, #94a3b8)", textTransform: "uppercase" }}>Guru &amp; Pengajar</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-text-primary, #0f172a)", marginTop: 6 }}>
                {loading ? "..." : summary?.active_teachers ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary, #64748b)", marginTop: 4 }}>
                Total guru: {summary?.total_teachers ?? 0} orang
              </div>
            </div>

            <div style={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 12, padding: "20px 22px", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-muted, #94a3b8)", textTransform: "uppercase" }}>Kelas Berjalan</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-text-primary, #0f172a)", marginTop: 6 }}>
                {loading ? "..." : summary?.active_classrooms ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary, #64748b)", marginTop: 4 }}>
                Dalam {summary?.total_programs ?? 0} program studi
              </div>
            </div>

            <div style={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 12, padding: "20px 22px", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-muted, #94a3b8)", textTransform: "uppercase" }}>Sesi Hari Ini</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#059669", marginTop: 6 }}>
                {loading ? "..." : academicData?.today_sessions?.length ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary, #64748b)", marginTop: 4 }}>
                {academicData?.attendance_today?.total_recorded ?? 0} siswa tercatat presensi
              </div>
            </div>
          </div>

          {/* Kehadiran Hari Ini Breakdown */}
          <div style={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary, #0f172a)", margin: "0 0 16px" }}>
              Rekapitulasi Kehadiran Hari Ini
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>Hadir (Present)</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#065f46", marginTop: 4 }}>{attendance?.present ?? 0}</div>
              </div>
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309" }}>Terlambat (Late)</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#92400e", marginTop: 4 }}>{attendance?.late ?? 0}</div>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Izin / Sakit (Excused)</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#1e40af", marginTop: 4 }}>{attendance?.excused ?? 0}</div>
              </div>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>Alpa (Absent)</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#b91c1c", marginTop: 4 }}>{attendance?.absent ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENERIMAAN & KASIR */}
      {tab === "pendapatan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Total Penerimaan Bulan Ini</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#166534", marginTop: 6 }}>
                {formatRupiah(financeData?.income?.total_monthly_income || 0)}
              </div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Penerimaan Tunai (Kasir)</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#1e293b", marginTop: 6 }}>
                {formatRupiah(financeData?.income?.cash_income || 0)}
              </div>
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>Penerimaan Digital (QRIS/VA)</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#1e3a8a", marginTop: 6 }}>
                {formatRupiah(financeData?.income?.digital_income || 0)}
              </div>
            </div>
          </div>

          {/* Table Transactions */}
          <div style={{ background: "#fff", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border-light, #f1f5f9)", fontWeight: 700, fontSize: 14 }}>
              Riwayat Pembayaran Lunas Terbaru
            </div>
            {incomeList.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted, #94a3b8)", fontSize: 13 }}>
                Belum ada transaksi pembayaran lunas pada periode ini.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "10px 16px" }}>Kode Transaksi</th>
                      <th style={{ padding: "10px 16px" }}>Siswa / Program</th>
                      <th style={{ padding: "10px 16px" }}>Metode</th>
                      <th style={{ padding: "10px 16px" }}>Nominal</th>
                      <th style={{ padding: "10px 16px" }}>Tanggal Lunas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList.slice(0, 20).map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{row.payment_code}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 600 }}>{row.student?.full_name || "–"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.enrollment?.program?.name || "Program"}</div>
                        </td>
                        <td style={{ padding: "12px 16px", textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>
                          <span style={{ padding: "3px 8px", borderRadius: 4, background: row.payment_method === "cash" ? "#fef3c7" : "#e0f2fe", color: row.payment_method === "cash" ? "#92400e" : "#0369a1" }}>
                            {row.payment_method}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#059669" }}>
                          {formatRupiah(row.total_amount)}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748b" }}>
                          {formatTanggal(row.paid_at)}
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

      {/* TAB 3: PIUTANG & TUNGGAKAN */}
      {tab === "tunggakan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Total Tagihan Melewati Jatuh Tempo (Overdue)</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#991b1b", marginTop: 6 }}>
                {formatRupiah(financeData?.outstanding?.total_overdue_amount || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                {financeData?.outstanding?.total_overdue_count || 0} tagihan belum dibayar
              </div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309" }}>Total Tagihan Belum Jatuh Tempo (Upcoming)</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#92400e", marginTop: 6 }}>
                {formatRupiah(financeData?.outstanding?.total_upcoming_amount || 0)}
              </div>
            </div>
          </div>

          {/* Table Overdue */}
          <div style={{ background: "#fff", border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border-light, #f1f5f9)", fontWeight: 700, fontSize: 14 }}>
              Daftar Rencana Tagihan Belum Lunas
            </div>
            {outstandingList.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted, #94a3b8)", fontSize: 13 }}>
                Tidak ada tagihan tertunggak saat ini. Semua tagihan tertib dibayar!
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "10px 16px" }}>Siswa</th>
                      <th style={{ padding: "10px 16px" }}>Program &amp; Sesi</th>
                      <th style={{ padding: "10px 16px" }}>Nominal Tagihan</th>
                      <th style={{ padding: "10px 16px" }}>Jatuh Tempo</th>
                      <th style={{ padding: "10px 16px" }}>Status</th>
                      <th style={{ padding: "10px 16px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingList.slice(0, 20).map((row) => (
                      <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 700 }}>{row.enrollment?.student?.full_name || "–"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.enrollment?.student?.student_code || "–"}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 600 }}>{row.enrollment?.program?.name || "Program"}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Sesi #{row.session_number}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#dc2626" }}>
                          {formatRupiah(row.amount)}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748b" }}>
                          {formatTanggal(row.due_date)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 4, background: "#fee2e2", color: "#b91c1c", fontSize: 11, fontWeight: 700 }}>
                            Belum Lunas
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Link
                            href="/admin/tagihan"
                            style={{
                              padding: "6px 12px",
                              background: "#f1f5f9",
                              color: "#334155",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Buka Tagihan
                          </Link>
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
