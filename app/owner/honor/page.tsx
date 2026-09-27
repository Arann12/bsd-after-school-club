"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getPayrolls, Payroll } from "@/lib/api/payrolls";
import { formatRupiah } from "@/lib/constants";

// ─── Status helpers ───────────────────────────────────────────
const warnaStatus: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#fef3c7", color: "#b45309" },
  paid:       { bg: "#d1fae5", color: "#059669" },
  partial:    { bg: "#dbeafe", color: "#1d4ed8" },
  // fallback untuk label lain dari backend
  "Belum Dibayar": { bg: "#fef3c7", color: "#b45309" },
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Sebagian":      { bg: "#dbeafe", color: "#1d4ed8" },
};

const labelStatus = (s: string) => {
  const map: Record<string, string> = {
    pending: "Belum Dibayar", paid: "Sudah Dibayar", partial: "Sebagian",
  };
  return map[s] ?? s;
};

export default function OwnerHonorPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dipilih, setDipilih] = useState<Payroll | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [guruTargetBonus, setGuruTargetBonus] = useState<Payroll | null>(null);
  const [inputBonusNominal, setInputBonusNominal] = useState(50000);
  const [inputBonusCatatan, setInputBonusCatatan] = useState("");
  const [inputBonusTanggal, setInputBonusTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const toast = (msg: string) => {
    setNotifToast(msg);
    setTimeout(() => setNotifToast(null), 3000);
  };

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayrolls();
      setPayrolls(data);
    } catch {
      setError("Gagal memuat data honor. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);

  // ─── Statistik ───────────────────────────────────────────────
  const totalHonor  = payrolls.reduce((a, p) => a + p.totalAmount, 0);
  const sudahCair   = payrolls.filter(p => p.status === "paid" || p.status === "Sudah Dibayar").reduce((a, p) => a + p.totalAmount, 0);
  const belumCair   = totalHonor - sudahCair;

  // ─── Handle tambah bonus (lokal, belum ada endpoint) ─────────
  const handleTambahBonusSubmit = () => {
    if (!guruTargetBonus) return;
    setShowBonusModal(false);
    setInputBonusCatatan("");
    toast(`Bonus Rp ${Number(inputBonusNominal).toLocaleString("id")} dicatat untuk ${guruTargetBonus.teacherName}. Hubungi admin untuk input ke sistem.`);
  };

  if (loading) return <SkeletonTable />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`.baris-honor:hover{background:#f8fafc!important;cursor:pointer}`}</style>

      {/* Toast */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {notifToast}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honor Guru & Staff</h1>
          <p className="page-subtitle">Kalkulasi, rincian bonus, dan pencairan honor mengajar per periode.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => toast("Ekspor rekap honor berhasil diproses.")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ekspor Rekap
          </button>
          <button className="btn btn-accent" onClick={fetchPayrolls}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--color-danger-bg)", border: "1px solid #fecaca", borderRadius: "var(--radius-lg)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{error}</div>
            <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={fetchPayrolls}>Coba Lagi</button>
          </div>
        </div>
      )}

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Honor",         value: formatRupiah(totalHonor), warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Sudah Dicairkan",     value: formatRupiah(sudahCair),  warna: "#059669", bg: "#d1fae5" },
          { label: "Belum Dicairkan",     value: formatRupiah(belumCair),  warna: "#b45309", bg: "#fef3c7" },
          { label: "Jumlah Payroll",      value: payrolls.length,          warna: "#7c3aed", bg: "#ede9fe" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: k.warna, lineHeight: 1.2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!error && payrolls.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>Belum ada data payroll</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Data honor akan muncul setelah payroll periode ini dibuat.</div>
        </div>
      )}

      {/* Tabel */}
      {payrolls.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Kode Payroll", "Nama Guru", "Jam Mengajar", "Honor Dasar", "Bonus", "Total Honor", "Periode", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p, i) => {
                  const warna = warnaStatus[p.status] ?? warnaStatus["Belum Dibayar"];
                  return (
                    <tr key={p.id} className="baris-honor"
                      style={{ borderBottom: i < payrolls.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                      onClick={() => setDipilih(p)}>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{p.payrollCode}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {p.teacherName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{p.teacherName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{p.teachingHours} jam</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{formatRupiah(p.baseAmount)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: p.bonusAmount > 0 ? "#059669" : "var(--color-text-muted)", fontWeight: p.bonusAmount > 0 ? 800 : 400 }}>
                        {p.bonusAmount > 0 ? `+${formatRupiah(p.bonusAmount)}` : "0"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 800, color: "var(--color-primary)" }}>{formatRupiah(p.totalAmount)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--color-text-muted)" }}>
                        <div>{p.periodStart}</div>
                        <div style={{ opacity: 0.7 }}>s/d {p.periodEnd}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ ...warna, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{labelStatus(p.status)}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setGuruTargetBonus(p); setShowBonusModal(true); }}>+ Bonus</button>
                          {(p.status === "pending" || p.status === "Belum Dibayar") && (
                            <button className="btn btn-accent btn-sm" onClick={() => setDipilih(p)}>Cairkan</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Bonus */}
      <Modal open={showBonusModal && !!guruTargetBonus} onClose={() => setShowBonusModal(false)} title={guruTargetBonus ? `Tambah Bonus — ${guruTargetBonus.teacherName}` : "Tambah Bonus"} maxWidth={460}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nominal Bonus (Rp)</label>
            <input className="form-input" type="number" value={inputBonusNominal} onChange={e => setInputBonusNominal(Number(e.target.value))} placeholder="50000" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Alasan Bonus</label>
            <input className="form-input" value={inputBonusCatatan} onChange={e => setInputBonusCatatan(e.target.value)} placeholder="Contoh: Bonus lembur / Presensi sempurna" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Tanggal Pemberian Bonus</label>
            <input className="form-input" type="date" value={inputBonusTanggal} onChange={e => setInputBonusTanggal(e.target.value)} />
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "#166534" }}>
            Bonus ini akan otomatis menambahkan total honor akumulasi untuk periode berjalan.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={() => setShowBonusModal(false)}>Batal</button>
            <button className="btn btn-accent" onClick={handleTambahBonusSubmit}>Simpan Bonus</button>
          </div>
        </div>
      </Modal>

      {/* Modal Rincian Honor */}
      {dipilih && (
        <Modal open onClose={() => setDipilih(null)} title={`Rincian Honor — ${dipilih.teacherName}`} maxWidth={500}>
          <div style={{ background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", borderRadius: 12, padding: "20px", color: "white", marginBottom: 18 }}>
            <div style={{ fontSize: 12, opacity: .8, marginBottom: 4 }}>{dipilih.payrollCode} · {dipilih.periodStart} s/d {dipilih.periodEnd}</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{formatRupiah(dipilih.totalAmount)}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>{labelStatus(dipilih.status)}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Total Jam Mengajar", value: `${dipilih.teachingHours} jam` },
              { label: "Honor Dasar",        value: formatRupiah(dipilih.baseAmount) },
              { label: "Bonus",              value: dipilih.bonusAmount > 0 ? `+${formatRupiah(dipilih.bonusAmount)}` : "Tidak ada" },
              { label: "Total Honor",        value: formatRupiah(dipilih.totalAmount) },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: (dipilih.status === "pending" || dipilih.status === "Belum Dibayar") ? "1fr 1fr" : "1fr", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
            {(dipilih.status === "pending" || dipilih.status === "Belum Dibayar") && (
              <button className="btn btn-accent" onClick={() => { toast(`Honor ${dipilih.teacherName} ditandai cair.`); setDipilih(null); }}>
                Cairkan Honor
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
