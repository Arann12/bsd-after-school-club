"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import {
  getPayrolls,
  generatePayroll,
  updatePayrollStatus,
  updatePayroll,
  Payroll,
} from "@/lib/api/payrolls";
import { getTeachers, updateTeacher, Teacher } from "@/lib/api/teachers";
import { getClassSessions } from "@/lib/api/academic";
import { formatRupiah } from "@/lib/constants";
import SearchableSelect from "@/components/ui/SearchableSelect";

// ─── Constants ────────────────────────────────────────────────
// Tarif dihitung per SATUAN 30 MENIT mengajar.
// Contoh: 1 sesi 30 mnt = 1 unit × Rp 37.500; 1 sesi 60 mnt = 2 unit × Rp 37.500
const TARIF_PER_30_MENIT = 37_500;

// ─── Types ────────────────────────────────────────────────────
interface TeacherHonorRow {
  teacher: Teacher;
  jamMengajar: number;    // total jam (desimal, kelipatan 0.5)
  jumlahSesi: number;
  tarifPerGuru: number;   // tarif per 30 mnt KHUSUS guru ini
  honorDihitung: number;
  bonusAmount: number;
  totalHonor: number;
  payroll: Payroll | null;
  status: "Belum Dibayar" | "Sudah Dibayar" | "Sebagian";
}

// ─── Status helpers ───────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "Belum Dibayar": { bg: "#fef3c7", color: "#b45309" },
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Sebagian":      { bg: "#dbeafe", color: "#1d4ed8" },
  pending:         { bg: "#fef3c7", color: "#b45309" },
  paid:            { bg: "#d1fae5", color: "#059669" },
  partial:         { bg: "#dbeafe", color: "#1d4ed8" },
};

function normalizeStatus(s: string): "Belum Dibayar" | "Sudah Dibayar" | "Sebagian" {
  if (s === "paid" || s === "Sudah Dibayar") return "Sudah Dibayar";
  if (s === "partial" || s === "Sebagian") return "Sebagian";
  return "Belum Dibayar";
}

function statusBadgeStyle(s: string) {
  return STATUS_STYLE[s] ?? STATUS_STYLE["Belum Dibayar"];
}

// ─── Helper: hitung durasi dalam satuan 30 menit ─────────────
// Mengembalikan angka JAM (desimal, kelipatan 0.5)
// 30 mnt → 0.5 jam | 60 mnt → 1.0 jam | 90 mnt → 1.5 jam
function durasiJam(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0.5; // default: 1 sesi = 30 menit
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const diffMin = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMin <= 0) return 0.5;
  // Bulatkan ke kelipatan 30 menit terdekat, minimum 1 unit (0.5 jam)
  const units = Math.max(1, Math.round(diffMin / 30));
  return units * 0.5;
}

// ─── Period helper ────────────────────────────────────────────
function currentPeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    start: `${y}-${m}-01`,
    end:   `${y}-${m}-${lastDay}`,
    label: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
}

// ─── Main Component ───────────────────────────────────────────
export default function OwnerHonorPage() {
  const [rows, setRows]       = useState<TeacherHonorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [detailRow, setDetailRow]           = useState<TeacherHonorRow | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusTarget, setBonusTarget]       = useState<TeacherHonorRow | null>(null);
  const [bonusNominal, setBonusNominal]     = useState(50_000);
  const [bonusCatatan, setBonusCatatan]     = useState("");
  const [generating, setGenerating]         = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [cari, setCari]                 = useState("");
  // Tarif default global (dipakai jika guru belum punya tarif sendiri)
  const [tarifDefault, setTarifDefault] = useState(TARIF_PER_30_MENIT);

  // State untuk modal atur tarif per guru
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [tarifTarget, setTarifTarget]       = useState<TeacherHonorRow | null>(null);
  const [tarifInput, setTarifInput]         = useState(TARIF_PER_30_MENIT);
  const [savingTarif, setSavingTarif]       = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const period = currentPeriod();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const teachersRes = await getTeachers({ per_page: 200 });
      const teachers = teachersRes.data;

      const payrolls = await getPayrolls();
      const sessions = await getClassSessions({ per_page: 500 });

      const mapped: TeacherHonorRow[] = teachers.map((teacher) => {
        const guruSessions = sessions.filter(
          (s) =>
            s.teacherId === teacher.id &&
            !s.isHoliday &&
            (s.status === "completed" || s.teacherLogbook != null)
        );

        const jamMengajar = guruSessions.reduce((acc, s) => acc + durasiJam(s.startTime, s.endTime), 0);
        const jumlahSesi  = guruSessions.length;

        // ── Tarif per guru ──────────────────────────────────────
        // Gunakan hourlyRate guru jika ada (dari backend hourly_rates),
        // jika tidak ada gunakan tarif default global.
        // hourlyRate dari backend adalah per JAM → konversi ke per 30 mnt (÷2)
        const tarifPerGuru = teacher.hourlyRate > 0
          ? teacher.hourlyRate / 2   // per jam → per 30 mnt
          : tarifDefault;

        // unit = jamMengajar × 2 (karena jamMengajar sudah dalam kelipatan 0.5 jam)
        const totalUnit     = jamMengajar * 2;
        const honorDihitung = totalUnit * tarifPerGuru;

        const guruPayrolls  = payrolls.filter((p) => p.teacherId === teacher.id);
        const latestPayroll = guruPayrolls.length > 0
          ? guruPayrolls.sort((a, b) => b.periodStart.localeCompare(a.periodStart))[0]
          : null;

        const bonusAmount = latestPayroll?.bonusAmount ?? 0;
        const totalHonor  = honorDihitung + bonusAmount;
        const status      = normalizeStatus(latestPayroll?.status ?? "pending");

        return { teacher, jamMengajar, jumlahSesi, tarifPerGuru, honorDihitung, bonusAmount, totalHonor, payroll: latestPayroll, status };
      });

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data honor. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, [tarifDefault]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredRows = rows.filter((r) => {
    const q = cari.toLowerCase();
    const matchSearch =
      r.teacher.name.toLowerCase().includes(q) ||
      r.teacher.teacherCode.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalHonorAll      = rows.reduce((a, r) => a + r.totalHonor, 0);
  const totalSudahCair     = rows.filter((r) => r.status === "Sudah Dibayar").reduce((a, r) => a + r.totalHonor, 0);
  const totalBelumCair     = totalHonorAll - totalSudahCair;
  const totalJam           = rows.reduce((a, r) => a + r.jamMengajar, 0);
  const totalSesi          = rows.reduce((a, r) => a + r.jumlahSesi, 0);

  const filteredTotalHonor = filteredRows.reduce((a, r) => a + r.totalHonor, 0);
  const filteredHonorDasar = filteredRows.reduce((a, r) => a + r.honorDihitung, 0);
  const filteredBonus      = filteredRows.reduce((a, r) => a + r.bonusAmount, 0);
  const filteredJam        = filteredRows.reduce((a, r) => a + r.jamMengajar, 0);
  const filteredSesi       = filteredRows.reduce((a, r) => a + r.jumlahSesi, 0);

  const handleGeneratePayroll = async (row: TeacherHonorRow) => {
    setGenerating(row.teacher.id);
    try {
      await generatePayroll({ teacher_id: row.teacher.id, period_start: period.start, period_end: period.end });
      showToast(`Payroll berhasil dibuat untuk ${row.teacher.name}.`);
      fetchAll();
    } catch {
      showToast("Gagal membuat payroll. Silakan coba kembali.");
    } finally {
      setGenerating(null);
    }
  };

  const handleMarkPaid = async (row: TeacherHonorRow) => {
    if (!row.payroll) return;
    try {
      await updatePayrollStatus(row.payroll.id, "paid");
      showToast(`Honor ${row.teacher.name} berhasil ditandai Sudah Dibayar.`);
      fetchAll();
    } catch {
      showToast("Gagal memperbarui status pembayaran.");
    }
  };

  const handleSaveBonus = async () => {
    if (!bonusTarget) return;
    if (bonusTarget.payroll) {
      try {
        const newBonus = (bonusTarget.payroll.bonusAmount ?? 0) + bonusNominal;
        await updatePayroll(bonusTarget.payroll.id, { bonus_amount: newBonus });
        showToast(`Bonus ${formatRupiah(bonusNominal)} berhasil dicatat untuk ${bonusTarget.teacher.name}.`);
        fetchAll();
      } catch {
        showToast("Gagal menyimpan bonus.");
      }
    } else {
      showToast(`Bonus dicatat. Silakan buat payroll terlebih dahulu untuk ${bonusTarget.teacher.name}.`);
    }
    setShowBonusModal(false);
    setBonusCatatan("");
  };

  // Simpan tarif per guru ke backend (PUT /teachers/{id})
  const handleSaveTarif = async () => {
    if (!tarifTarget) return;
    setSavingTarif(true);
    try {
      // Backend menyimpan hourly_rate dalam PER JAM → konversi dari per 30 mnt × 2
      const hourlyRatePerJam = tarifInput * 2;
      await updateTeacher(tarifTarget.teacher.id, {
        hourly_rate: hourlyRatePerJam,
      });
      showToast(`Tarif ${tarifTarget.teacher.name} berhasil disimpan: ${formatRupiah(tarifInput)} / 30 mnt.`);
      setShowTarifModal(false);
      fetchAll(); // reload agar kalkulasi honor ikut update
    } catch {
      showToast("Gagal menyimpan tarif. Coba lagi.");
    } finally {
      setSavingTarif(false);
    }
  };

  if (loading) return <SkeletonTable rows={6} cols={8} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .honor-table-row:hover { background: #f8fafc; }
        .honor-desktop-table { display: block; width: 100%; }
        .honor-mobile-cards { display: none; }

        @media (max-width: 860px) {
          .honor-desktop-table { display: none !important; }
          .honor-mobile-cards { display: flex !important; flex-direction: column; gap: 12px; }
        }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 300,
          background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13,
          padding: "12px 20px", borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 10,
          maxWidth: "calc(100vw - 40px)",
          animation: "fadeSlide 0.25s ease-out",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ wordBreak: "break-word" }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honor Guru dan Staff</h1>
          <p className="page-subtitle">
            Kalkulasi otomatis berdasarkan sesi selesai — Periode {period.label}.
            Tarif dihitung per 30 menit mengajar (bisa diatur per guru).
          </p>
        </div>
        <div className="page-header-actions" style={{ flexWrap: "wrap", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => showToast("Ekspor rekap honor berhasil diproses.")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Ekspor Rekap
          </button>
          <button className="btn btn-accent btn-sm" onClick={fetchAll}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: "var(--color-danger-bg)", border: "1px solid #fecaca", borderRadius: "var(--radius-lg)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{error}</div>
            <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={fetchAll}>Coba Lagi</button>
          </div>
        </div>
      )}

      {/* Tarif Adjuster — Default Global + Keterangan Per Guru */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>
              Tarif Default (jika guru belum diatur):
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)" }}>Rp</span>
              <input
                type="number"
                className="form-input"
                style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
                value={tarifDefault}
                step={5_000}
                min={5_000}
                onChange={(e) => setTarifDefault(Number(e.target.value))}
              />
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>/ 30 mnt</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 600, background: "#f0fdf4", color: "#15803d", padding: "4px 12px", borderRadius: 999, border: "1px solid #bbf7d0", whiteSpace: "nowrap" }}>
              Tarif per guru diatur via tombol Tarif di tabel
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, background: "#eff6ff", color: "#1d4ed8", padding: "4px 12px", borderRadius: 999, border: "1px solid #bfdbfe", whiteSpace: "nowrap" }}>
              Honor = (Durasi ÷ 30 mnt) × Tarif per Guru
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[
          { label: "Total Honor Bulan Ini",  value: formatRupiah(totalHonorAll),  warna: "#1d4ed8" },
          { label: "Sudah Dicairkan",         value: formatRupiah(totalSudahCair), warna: "#059669" },
          { label: "Belum Dicairkan",         value: formatRupiah(totalBelumCair), warna: "#b45309" },
          { label: "Total Jam Mengajar",      value: `${totalJam} Jam`,             warna: "#7c3aed" },
          { label: "Jumlah Guru Terdaftar",   value: `${rows.length} Guru`,        warna: "#0369a1" },
        ].map((k) => (
          <div key={k.label} className="stat-card" style={{ gap: 6, padding: "14px 16px" }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: 17, fontWeight: 800, color: k.warna, lineHeight: 1.2, wordBreak: "break-word" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter & Pencarian */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180, maxWidth: "100%" }}>
            <input
              className="form-input"
              placeholder="Cari nama atau kode guru..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              style={{ fontSize: 13, paddingLeft: 34 }}
            />
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <SearchableSelect className="select-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ fontSize: 13, padding: "7px 12px", minWidth: 140 }}>
            <option value="Semua">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Sudah Dibayar">Sudah Dibayar</option>
            <option value="Sebagian">Sebagian</option>
          </SearchableSelect>
          <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto", whiteSpace: "nowrap" }}>
            Menampilkan {filteredRows.length} dari {rows.length} guru
          </span>
        </div>
      </div>

      {/* 1. TAMPILAN DESKTOP & TABLET: Tabel Presisi Berkolom Sejajar */}
      <div className="card honor-desktop-table" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                <th style={{ width: 48, padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>No</th>
                <th style={{ minWidth: 200, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "left", whiteSpace: "nowrap" }}>Guru</th>
                <th style={{ width: 85, padding: "12px 12px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>Sesi</th>
                <th style={{ width: 85, padding: "12px 12px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>Jam</th>
                <th style={{ width: 110, padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Tarif/30mnt</th>
                <th style={{ width: 135, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Honor Dasar</th>
                <th style={{ width: 110, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Bonus</th>
                <th style={{ width: 140, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Total Honor</th>
                <th style={{ width: 120, padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ width: 195, padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px 16px", color: "var(--color-text-muted)", fontSize: 13 }}>
                    Tidak ada data guru yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => {
                  const badge = statusBadgeStyle(row.status);
                  const isGenerating = generating === row.teacher.id;
                  return (
                    <tr key={row.teacher.id} className="honor-table-row" style={{ borderBottom: i < filteredRows.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}>
                      <td style={{ padding: "14px 14px", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600, textAlign: "center" }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: row.jamMengajar > 0 ? "linear-gradient(135deg, #1a5c8a, #2a7ab8)" : "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {row.teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{row.teacher.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              <span style={{ fontFamily: "monospace", fontSize: 11, background: "#f1f5f9", padding: "1px 6px", borderRadius: 4, color: "var(--color-text-muted)", fontWeight: 700 }}>{row.teacher.teacherCode}</span>
                              {row.teacher.email && row.teacher.email !== "-" && (
                                <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{row.teacher.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", textAlign: "center" }}>
                        <span style={{ background: row.jumlahSesi > 0 ? "#dbeafe" : "#f1f5f9", color: row.jumlahSesi > 0 ? "#1d4ed8" : "#94a3b8", fontSize: 12, fontWeight: 800, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
                          {row.jumlahSesi} sesi
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px", fontSize: 13.5, fontWeight: 800, color: "var(--color-text-primary)", textAlign: "center", whiteSpace: "nowrap" }}>
                        {row.jamMengajar} jam
                      </td>
                      <td style={{ padding: "14px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: row.teacher.hourlyRate > 0 ? "#15803d" : "#94a3b8" }}>
                          {formatRupiah(row.tarifPerGuru)}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                          {row.teacher.hourlyRate > 0 ? "Tarif khusus" : "Default"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a202c", whiteSpace: "nowrap" }}>{formatRupiah(row.honorDihitung)}</div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap" }}>{row.jamMengajar * 2} unit × {formatRupiah(row.tarifPerGuru)}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: row.bonusAmount > 0 ? 800 : 400, color: row.bonusAmount > 0 ? "#059669" : "var(--color-text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {row.bonusAmount > 0 ? `+${formatRupiah(row.bonusAmount)}` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14.5, fontWeight: 900, color: "var(--color-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {formatRupiah(row.totalHonor)}
                      </td>
                      <td style={{ padding: "14px 14px", textAlign: "center" }}>
                        <span style={{ ...badge, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-sm)", whiteSpace: "nowrap" }}>{row.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: "4px 8px", whiteSpace: "nowrap" }} onClick={() => setDetailRow(row)}>
                            Rincian
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: 11.5, padding: "4px 8px", whiteSpace: "nowrap", borderColor: "#15803d", color: "#15803d" }}
                            onClick={() => { setTarifTarget(row); setTarifInput(row.tarifPerGuru); setShowTarifModal(true); }}
                          >
                            Tarif
                          </button>
                          {!row.payroll && row.jamMengajar > 0 && (
                            <button className="btn btn-primary btn-sm" disabled={isGenerating} onClick={() => handleGeneratePayroll(row)} style={{ fontSize: 11.5, padding: "4px 8px", opacity: isGenerating ? 0.6 : 1, whiteSpace: "nowrap" }}>
                              {isGenerating ? "..." : "Buat"}
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm" style={{ fontSize: 11.5, padding: "4px 8px", whiteSpace: "nowrap" }} onClick={() => { setBonusTarget(row); setShowBonusModal(true); }}>
                            + Bonus
                          </button>
                          {row.payroll && row.status === "Belum Dibayar" && (
                            <button className="btn btn-accent btn-sm" style={{ fontSize: 11.5, padding: "4px 8px", whiteSpace: "nowrap" }} onClick={() => setDetailRow(row)}>
                              Cairkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--color-border)", background: "#f8fafc" }}>
                  <td colSpan={2} style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Total ({filteredRows.length} Guru)
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 800, color: "#1a202c", textAlign: "center", whiteSpace: "nowrap" }}>
                    {filteredSesi} sesi
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 13.5, fontWeight: 800, color: "#1a202c", textAlign: "center", whiteSpace: "nowrap" }}>
                    {filteredJam} jam
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 800, color: "#1a202c", textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatRupiah(filteredHonorDasar)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#059669", textAlign: "right", whiteSpace: "nowrap" }}>
                    {filteredBonus > 0 ? `+${formatRupiah(filteredBonus)}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 15, fontWeight: 900, color: "var(--color-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatRupiah(filteredTotalHonor)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 2. TAMPILAN MOBILE: Kartu Rincian Guru Responsif (Tanpa Scroll Horizontal) */}
      <div className="honor-mobile-cards">
        {filteredRows.length === 0 ? (
          <div className="card" style={{ padding: "36px 16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
            Tidak ada data guru yang sesuai filter.
          </div>
        ) : (
          filteredRows.map((row) => {
            const badge = statusBadgeStyle(row.status);
            const isGenerating = generating === row.teacher.id;
            return (
              <div key={row.teacher.id} className="card" style={{ padding: "16px 18px", borderLeft: `4px solid ${row.status === "Sudah Dibayar" ? "#059669" : "var(--color-primary)"}` }}>
                {/* Header Guru & Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: row.jamMengajar > 0 ? "linear-gradient(135deg, #1a5c8a, #2a7ab8)" : "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {row.teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{row.teacher.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, background: "#f1f5f9", padding: "1px 6px", borderRadius: 4, color: "var(--color-text-muted)", fontWeight: 700 }}>{row.teacher.teacherCode}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ ...badge, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>{row.status}</span>
                </div>

                {/* Grid Rincian Jam & Honor */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 12px", background: "var(--color-bg)", borderRadius: 10, marginBottom: 12, border: "1px solid var(--color-border-light)" }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Sesi / Jam</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>
                      {row.jamMengajar} jam <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>({row.jumlahSesi} sesi)</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Honor Dasar</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a202c", marginTop: 2 }}>{formatRupiah(row.honorDihitung)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Bonus</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: row.bonusAmount > 0 ? "#059669" : "var(--color-text-muted)", marginTop: 2 }}>
                      {row.bonusAmount > 0 ? `+${formatRupiah(row.bonusAmount)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Total Honor</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "var(--color-primary)", marginTop: 2 }}>{formatRupiah(row.totalHonor)}</div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: "5px 12px" }} onClick={() => setDetailRow(row)}>
                    Rincian
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ fontSize: 11.5, padding: "5px 12px" }} onClick={() => { setBonusTarget(row); setShowBonusModal(true); }}>
                    + Bonus
                  </button>
                  {!row.payroll && row.jamMengajar > 0 && (
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11.5, padding: "5px 12px" }} disabled={isGenerating} onClick={() => handleGeneratePayroll(row)}>
                      {isGenerating ? "Membuat..." : "Buat Payroll"}
                    </button>
                  )}
                  {row.payroll && row.status === "Belum Dibayar" && (
                    <button className="btn btn-accent btn-sm" style={{ fontSize: 11.5, padding: "5px 12px" }} onClick={() => setDetailRow(row)}>
                      Cairkan
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Ringkasan Footer Mobile */}
        {filteredRows.length > 0 && (
          <div className="card" style={{ padding: "14px 18px", background: "#f8fafc", border: "1px dashed var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total ({filteredRows.length} Guru)</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: "var(--color-primary)" }}>{formatRupiah(filteredTotalHonor)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--color-text-muted)" }}>
              <span>{filteredJam} jam · {filteredSesi} sesi</span>
              {filteredBonus > 0 && <span style={{ color: "#059669", fontWeight: 700 }}>Bonus: +{formatRupiah(filteredBonus)}</span>}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Rincian Honor Detail */}
      {detailRow && (
        <Modal open onClose={() => setDetailRow(null)} title={`Rincian Honor — ${detailRow.teacher.name}`} maxWidth={520}>
          <div style={{ background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", borderRadius: 14, padding: "18px 20px", color: "#fff", marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, opacity: 0.8, marginBottom: 4 }}>{detailRow.teacher.teacherCode} · Periode {period.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", wordBreak: "break-word" }}>{formatRupiah(detailRow.totalHonor)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ ...statusBadgeStyle(detailRow.status), fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 999 }}>{detailRow.status}</span>
              {detailRow.payroll && <span style={{ fontSize: 11, opacity: 0.8 }}>Payroll: {detailRow.payroll.payrollCode}</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Sesi Mengajar Selesai",    value: `${detailRow.jumlahSesi} sesi`,               bold: false, highlight: false },
              { label: "Total Waktu Mengajar",      value: `${detailRow.jamMengajar} jam (${detailRow.jamMengajar * 2} unit × 30 mnt)`, bold: false, highlight: false },
              { label: "Tarif per 30 Menit",        value: formatRupiah(detailRow.tarifPerGuru),         bold: false, highlight: false },
              { label: "Honor Dasar (otomatis)",    value: formatRupiah(detailRow.honorDihitung),         bold: false, highlight: true },
              { label: "Bonus Tambahan",            value: detailRow.bonusAmount > 0 ? `+${formatRupiah(detailRow.bonusAmount)}` : "Tidak ada", bold: false, highlight: false },
              { label: "Total Honor",               value: formatRupiah(detailRow.totalHonor),            bold: true,  highlight: false },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: item.bold ? "var(--color-primary-bg)" : "var(--color-bg)", borderRadius: 10, border: `1px solid ${item.bold ? "var(--color-primary)" : "var(--color-border)"}`, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span style={{ fontSize: item.bold ? 15 : 13, fontWeight: item.bold ? 900 : item.highlight ? 800 : 600, color: item.bold ? "var(--color-primary)" : "var(--color-text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {detailRow.teacher.bankName && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Info Transfer Bank</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{detailRow.teacher.bankName}</div>
              <div style={{ fontSize: 13 }}>{detailRow.teacher.bankAccountName}</div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 800, wordBreak: "break-all" }}>{detailRow.teacher.bankAccountNumber}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setDetailRow(null)} style={{ flex: "1 1 100px", justifyContent: "center" }}>Tutup</button>
            {!detailRow.payroll && detailRow.jamMengajar > 0 && (
              <button className="btn btn-primary" style={{ flex: "1 1 140px", justifyContent: "center" }} disabled={generating === detailRow.teacher.id} onClick={() => { handleGeneratePayroll(detailRow); setDetailRow(null); }}>
                {generating === detailRow.teacher.id ? "Membuat..." : "Buat Payroll"}
              </button>
            )}
            {detailRow.payroll && detailRow.status !== "Sudah Dibayar" && (
              <button className="btn btn-accent" style={{ flex: "1 1 140px", justifyContent: "center" }} onClick={() => { handleMarkPaid(detailRow); setDetailRow(null); }}>
                Cairkan Honor
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: Tambah Bonus */}
      <Modal open={showBonusModal && !!bonusTarget} onClose={() => setShowBonusModal(false)} title={bonusTarget ? `Tambah Bonus — ${bonusTarget.teacher.name}` : "Tambah Bonus"} maxWidth={460}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nominal Bonus (Rp)</label>
            <input className="form-input" type="number" value={bonusNominal} step={10000} min={0} onChange={(e) => setBonusNominal(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Alasan Bonus</label>
            <input className="form-input" value={bonusCatatan} onChange={(e) => setBonusCatatan(e.target.value)} placeholder="Contoh: Bonus lembur / Presensi mengajar penuh" />
          </div>
          {bonusTarget && !bonusTarget.payroll && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "#92400e" }}>
              Guru ini belum memiliki payroll. Bonus akan disimpan setelah payroll dibuat.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setShowBonusModal(false)}>Batal</button>
            <button className="btn btn-accent" onClick={handleSaveBonus}>Simpan Bonus</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Atur Tarif per Guru */}
      <Modal
        open={showTarifModal && !!tarifTarget}
        onClose={() => setShowTarifModal(false)}
        title={tarifTarget ? `Atur Tarif — ${tarifTarget.teacher.name}` : "Atur Tarif"}
        maxWidth={460}
      >
        {tarifTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Info guru */}
            <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "#fff", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {tarifTarget.teacher.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>{tarifTarget.teacher.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Kode: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{tarifTarget.teacher.teacherCode}</span>
                  {tarifTarget.teacher.hourlyRate > 0
                    ? <span style={{ marginLeft: 8, color: "#15803d", fontWeight: 600 }}>Tarif khusus aktif</span>
                    : <span style={{ marginLeft: 8, color: "#94a3b8" }}>Menggunakan tarif default</span>
                  }
                </div>
              </div>
            </div>

            {/* Input tarif baru */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>
                Tarif Baru per 30 Menit Mengajar (Rp)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)" }}>Rp</span>
                <input
                  className="form-input"
                  type="number"
                  value={tarifInput}
                  step={5_000}
                  min={5_000}
                  onChange={(e) => setTarifInput(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>/ 30 mnt</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6 }}>
                Setara {formatRupiah(tarifInput * 2)} / jam
              </div>
            </div>

            {/* Preview perubahan honor */}
            {tarifTarget.jamMengajar > 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase", marginBottom: 8 }}>Preview Honor dengan Tarif Baru</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{tarifTarget.jamMengajar * 2} unit × {formatRupiah(tarifInput)}</span>
                  <span style={{ fontWeight: 800, color: "#15803d" }}>{formatRupiah(tarifTarget.jamMengajar * 2 * tarifInput)}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  Sebelumnya: {formatRupiah(tarifTarget.honorDihitung)} (tarif {formatRupiah(tarifTarget.tarifPerGuru)})
                </div>
              </div>
            )}

            {/* Tombol aksi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost" onClick={() => setShowTarifModal(false)} disabled={savingTarif}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleSaveTarif} disabled={savingTarif}>
                {savingTarif ? "Menyimpan..." : "Simpan Tarif"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
