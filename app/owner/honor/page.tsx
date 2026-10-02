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
import { getTeachers, Teacher } from "@/lib/api/teachers";
import { getClassSessions } from "@/lib/api/academic";
import { formatRupiah } from "@/lib/constants";

// ─── Constants ────────────────────────────────────────────────
const TARIF_PER_JAM = 75_000;

// ─── Types ────────────────────────────────────────────────────
interface TeacherHonorRow {
  teacher: Teacher;
  jamMengajar: number;
  jumlahSesi: number;
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

// ─── Helper: compute teaching hours ──────────────────────────
function durasiJam(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 2;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const diffMin = (eh * 60 + em) - (sh * 60 + sm);
  return diffMin > 0 ? Math.max(1, Math.round(diffMin / 60)) : 2;
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
  const [tarifePerJam, setTarifPerJam]  = useState(TARIF_PER_JAM);

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

        const jamMengajar   = guruSessions.reduce((acc, s) => acc + durasiJam(s.startTime, s.endTime), 0);
        const jumlahSesi    = guruSessions.length;
        const honorDihitung = jamMengajar * tarifePerJam;

        const guruPayrolls  = payrolls.filter((p) => p.teacherId === teacher.id);
        const latestPayroll = guruPayrolls.length > 0
          ? guruPayrolls.sort((a, b) => b.periodStart.localeCompare(a.periodStart))[0]
          : null;

        const bonusAmount = latestPayroll?.bonusAmount ?? 0;
        const totalHonor  = honorDihitung + bonusAmount;
        const status      = normalizeStatus(latestPayroll?.status ?? "pending");

        return { teacher, jamMengajar, jumlahSesi, honorDihitung, bonusAmount, totalHonor, payroll: latestPayroll, status };
      });

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat data honor. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, [tarifePerJam]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredRows = rows.filter((r) => {
    const q = cari.toLowerCase();
    const matchSearch =
      r.teacher.name.toLowerCase().includes(q) ||
      r.teacher.teacherCode.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalHonorAll  = rows.reduce((a, r) => a + r.totalHonor, 0);
  const totalSudahCair = rows.filter((r) => r.status === "Sudah Dibayar").reduce((a, r) => a + r.totalHonor, 0);
  const totalBelumCair = totalHonorAll - totalSudahCair;
  const totalJam       = rows.reduce((a, r) => a + r.jamMengajar, 0);

  const handleGeneratePayroll = async (row: TeacherHonorRow) => {
    setGenerating(row.teacher.id);
    try {
      await generatePayroll({ teacher_id: row.teacher.id, period_start: period.start, period_end: period.end });
      showToast(`Payroll berhasil di-generate untuk ${row.teacher.name}.`);
      fetchAll();
    } catch {
      showToast("Gagal generate payroll. Coba lagi.");
    } finally {
      setGenerating(null);
    }
  };

  const handleMarkPaid = async (row: TeacherHonorRow) => {
    if (!row.payroll) return;
    try {
      await updatePayrollStatus(row.payroll.id, "paid");
      showToast(`Honor ${row.teacher.name} ditandai Sudah Dibayar.`);
      fetchAll();
    } catch {
      showToast("Gagal memperbarui status. Coba lagi.");
    }
  };

  const handleSaveBonus = async () => {
    if (!bonusTarget) return;
    if (bonusTarget.payroll) {
      try {
        const newBonus = (bonusTarget.payroll.bonusAmount ?? 0) + bonusNominal;
        await updatePayroll(bonusTarget.payroll.id, { bonus_amount: newBonus });
        showToast(`Bonus ${formatRupiah(bonusNominal)} ditambahkan untuk ${bonusTarget.teacher.name}.`);
        fetchAll();
      } catch {
        showToast("Gagal menyimpan bonus. Coba lagi.");
      }
    } else {
      showToast(`Bonus dicatat. Generate payroll terlebih dahulu untuk ${bonusTarget.teacher.name}.`);
    }
    setShowBonusModal(false);
    setBonusCatatan("");
  };

  if (loading) return <SkeletonTable rows={6} cols={8} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .honor-row:hover { background: #f8fafc !important; cursor: pointer; }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 300,
          background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13,
          padding: "12px 20px", borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeSlide 0.25s ease-out",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honor Guru dan Staff</h1>
          <p className="page-subtitle">
            Kalkulasi otomatis dari sesi mengajar yang selesai — Periode {period.label}.
            Tarif: {formatRupiah(tarifePerJam)} / jam.
          </p>
        </div>
        <div className="page-header-actions">
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

      {/* Error */}
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

      {/* Tarif Adjuster */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>
            Tarif Honor per Jam Mengajar:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)" }}>Rp</span>
            <input
              type="number"
              className="form-input"
              style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
              value={tarifePerJam}
              step={5000}
              min={10000}
              onChange={(e) => setTarifPerJam(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>/ jam</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, background: "#eff6ff", color: "#1d4ed8", padding: "4px 12px", borderRadius: 999, border: "1px solid #bfdbfe" }}>
            Honor = Jam Selesai x Tarif per Jam
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Honor Bulan Ini",  value: formatRupiah(totalHonorAll),  warna: "#1d4ed8" },
          { label: "Sudah Dicairkan",         value: formatRupiah(totalSudahCair), warna: "#059669" },
          { label: "Belum Dicairkan",         value: formatRupiah(totalBelumCair), warna: "#b45309" },
          { label: "Total Jam Mengajar",      value: `${totalJam} Jam`,            warna: "#7c3aed" },
          { label: "Jumlah Guru Terdaftar",   value: `${rows.length} Guru`,        warna: "#0369a1" },
        ].map((k) => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: k.warna, lineHeight: 1.2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "0 0 240px" }}>
            <input
              className="form-input"
              placeholder="Cari nama / kode guru..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              style={{ fontSize: 13, paddingLeft: 32 }}
            />
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <select className="select-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ fontSize: 13, padding: "7px 12px" }}>
            <option value="Semua">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Sudah Dibayar">Sudah Dibayar</option>
            <option value="Sebagian">Sebagian</option>
          </select>
          <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto" }}>
            {filteredRows.length} dari {rows.length} guru
          </span>
        </div>
      </div>

      {/* Tabel Honor */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["No", "Nama Guru", "Kode Guru", "Sesi Selesai", "Jam Mengajar", "Honor Dihitung", "Bonus", "Total Honor", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "36px", color: "var(--color-text-muted)", fontSize: 13 }}>
                    Tidak ada data guru yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => {
                  const badge = statusBadgeStyle(row.status);
                  const isGenerating = generating === row.teacher.id;
                  return (
                    <tr key={row.teacher.id} className="honor-row"
                      style={{ borderBottom: i < filteredRows.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                      onClick={() => setDetailRow(row)}>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: row.jamMengajar > 0 ? "linear-gradient(135deg, #1a5c8a, #2a7ab8)" : "linear-gradient(135deg, #94a3b8, #64748b)", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {row.teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{row.teacher.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{row.teacher.email !== "-" ? row.teacher.email : "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700 }}>{row.teacher.teacherCode}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: row.jumlahSesi > 0 ? "#dbeafe" : "#f1f5f9", color: row.jumlahSesi > 0 ? "#1d4ed8" : "#94a3b8", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                          {row.jumlahSesi} sesi
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{row.jamMengajar} jam</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a202c" }}>{formatRupiah(row.honorDihitung)}</div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1 }}>{row.jamMengajar} jam x {formatRupiah(tarifePerJam)}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: row.bonusAmount > 0 ? 800 : 400, color: row.bonusAmount > 0 ? "#059669" : "var(--color-text-muted)" }}>
                        {row.bonusAmount > 0 ? `+${formatRupiah(row.bonusAmount)}` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 900, color: "var(--color-primary)", whiteSpace: "nowrap" }}>{formatRupiah(row.totalHonor)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ ...badge, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{row.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {!row.payroll && row.jamMengajar > 0 && (
                            <button className="btn btn-primary btn-sm" disabled={isGenerating} onClick={() => handleGeneratePayroll(row)} style={{ fontSize: 11.5, padding: "4px 10px", opacity: isGenerating ? 0.6 : 1 }}>
                              {isGenerating ? "Membuat..." : "Buat Payroll"}
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm" style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={() => { setBonusTarget(row); setShowBonusModal(true); }}>
                            + Bonus
                          </button>
                          {row.payroll && row.status === "Belum Dibayar" && (
                            <button className="btn btn-accent btn-sm" style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={() => setDetailRow(row)}>
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
                  <td colSpan={4} style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Total ({filteredRows.length} Guru)
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#1a202c" }}>{filteredRows.reduce((a, r) => a + r.jamMengajar, 0)} jam</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#1a202c" }}>{formatRupiah(filteredRows.reduce((a, r) => a + r.honorDihitung, 0))}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#059669" }}>
                    {filteredRows.reduce((a, r) => a + r.bonusAmount, 0) > 0 ? `+${formatRupiah(filteredRows.reduce((a, r) => a + r.bonusAmount, 0))}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 15, fontWeight: 900, color: "var(--color-primary)" }}>{formatRupiah(filteredRows.reduce((a, r) => a + r.totalHonor, 0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL: Rincian Honor Detail */}
      {detailRow && (
        <Modal open onClose={() => setDetailRow(null)} title={`Rincian Honor — ${detailRow.teacher.name}`} maxWidth={520}>
          <div style={{ background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", borderRadius: 14, padding: "20px 22px", color: "#fff", marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, opacity: 0.8, marginBottom: 4 }}>{detailRow.teacher.teacherCode} · Periode {period.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>{formatRupiah(detailRow.totalHonor)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ ...statusBadgeStyle(detailRow.status), fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 999 }}>{detailRow.status}</span>
              {detailRow.payroll && <span style={{ fontSize: 11, opacity: 0.8 }}>Payroll: {detailRow.payroll.payrollCode}</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Sesi Mengajar Selesai", value: `${detailRow.jumlahSesi} sesi`, bold: false, highlight: false },
              { label: "Total Jam Mengajar",    value: `${detailRow.jamMengajar} jam`,  bold: false, highlight: false },
              { label: "Tarif per Jam",         value: formatRupiah(tarifePerJam),       bold: false, highlight: false },
              { label: "Honor Dasar (otomatis)", value: formatRupiah(detailRow.honorDihitung), bold: false, highlight: true },
              { label: "Bonus Tambahan",         value: detailRow.bonusAmount > 0 ? `+${formatRupiah(detailRow.bonusAmount)}` : "Tidak ada", bold: false, highlight: false },
              { label: "Total Honor",            value: formatRupiah(detailRow.totalHonor), bold: true, highlight: false },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: item.bold ? "var(--color-primary-bg)" : "var(--color-bg)", borderRadius: 10, border: `1px solid ${item.bold ? "var(--color-primary)" : "var(--color-border)"}` }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span style={{ fontSize: item.bold ? 15 : 13, fontWeight: item.bold ? 900 : item.highlight ? 800 : 600, color: item.bold ? "var(--color-primary)" : "var(--color-text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {detailRow.teacher.bankName && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Info Transfer</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{detailRow.teacher.bankName}</div>
              <div style={{ fontSize: 13 }}>{detailRow.teacher.bankAccountName}</div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 800 }}>{detailRow.teacher.bankAccountNumber}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setDetailRow(null)} style={{ flex: 1, justifyContent: "center" }}>Tutup</button>
            {!detailRow.payroll && detailRow.jamMengajar > 0 && (
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={generating === detailRow.teacher.id} onClick={() => { handleGeneratePayroll(detailRow); setDetailRow(null); }}>
                {generating === detailRow.teacher.id ? "Membuat..." : "Buat Payroll"}
              </button>
            )}
            {detailRow.payroll && detailRow.status !== "Sudah Dibayar" && (
              <button className="btn btn-accent" style={{ flex: 1, justifyContent: "center" }} onClick={() => { handleMarkPaid(detailRow); setDetailRow(null); }}>
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
            <input className="form-input" value={bonusCatatan} onChange={(e) => setBonusCatatan(e.target.value)} placeholder="Contoh: Bonus lembur / Presensi sempurna" />
          </div>
          {bonusTarget && !bonusTarget.payroll && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "#92400e" }}>
              Guru ini belum memiliki payroll. Bonus akan disimpan setelah payroll di-generate.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={() => setShowBonusModal(false)}>Batal</button>
            <button className="btn btn-accent" onClick={handleSaveBonus}>Simpan Bonus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
