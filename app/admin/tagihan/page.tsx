"use client";
import { useState } from "react";
import Link from "next/link";

const daftarTagihan = [
  { id: "INV-2026-000001", siswa: "Andi Setiawan", idSiswa: "STD-2026-0001", program: "Calistung Level 1", pertemuan: "Pertemuan 7 & 8", jumlah: 100000, metode: "Cash", tanggal: "2 Sept 2026", status: "Menunggu Konfirmasi", jalur: "via Orang Tua" },
  { id: "INV-2026-000002", siswa: "Budi Santoso", idSiswa: "STD-2026-0002", program: "English B1", pertemuan: "Pertemuan 4", jumlah: 75000, metode: "QRIS", tanggal: "1 Sept 2026", status: "Lunas", jalur: "via Orang Tua" },
  { id: "INV-2026-000003", siswa: "Citra Kirana", idSiswa: "STD-2026-0003", program: "Math Advance", pertemuan: "Pertemuan 9 & 10", jumlah: 120000, metode: "Cash", tanggal: "31 Agt 2026", status: "Menunggu Konfirmasi", jalur: "via Orang Tua" },
  { id: "INV-2026-000004", siswa: "Dian Pratama", idSiswa: "STD-2026-0004", program: "Phonics Starter", pertemuan: "Pertemuan 3", jumlah: 50000, metode: "–", tanggal: "–", status: "Overdue", jalur: "–" },
  { id: "INV-2026-000005", siswa: "Eko Wijaya", idSiswa: "STD-2026-0005", program: "Calistung Level 2", pertemuan: "Pertemuan 11 & 12", jumlah: 100000, metode: "Cash", tanggal: "28 Agt 2026", status: "Lunas", jalur: "via Admin" },
  { id: "INV-2026-000006", siswa: "Fitri Handayani", idSiswa: "STD-2026-0006", program: "English B1", pertemuan: "Pertemuan 8", jumlah: 75000, metode: "Transfer Mandiri", tanggal: "29 Agt 2026", status: "Lunas", jalur: "via Orang Tua" },
  { id: "INV-2026-000007", siswa: "Gilang Ramadan", idSiswa: "STD-2026-0007", program: "Math Advance", pertemuan: "Pertemuan 5", jumlah: 60000, metode: "VA BCA", tanggal: "28 Agt 2026", status: "Partially Paid", jalur: "via Orang Tua" },
  { id: "INV-2026-000008", siswa: "Hana Pertiwi", idSiswa: "STD-2026-0008", program: "Phonics Starter", pertemuan: "Pertemuan 1 & 2", jumlah: 100000, metode: "–", tanggal: "–", status: "Overdue", jalur: "–" },
];

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Lunas":                { bg: "#d1fae5", color: "#059669" },
  "Menunggu Konfirmasi":  { bg: "#fef3c7", color: "#b45309" },
  "Belum Bayar":          { bg: "#fee2e2", color: "#dc2626" },
  "Overdue":              { bg: "#fce7f3", color: "#be185d" },
  "Partially Paid":       { bg: "#e0f2fe", color: "#0369a1" },
};

export default function AdminTagihanPage() {
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [dipilih, setDipilih] = useState<typeof daftarTagihan[0] | null>(null);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [sudahKonfirmasi, setSudahKonfirmasi] = useState<string[]>([]);
  const [showInputCashModal, setShowInputCashModal] = useState(false);
  const [selectedParentChild, setSelectedParentChild] = useState("Budi Setiawan — Andi Setiawan (Calistung Level 1)");
  const [cashAmount, setCashAmount] = useState(100000);
  const [cashNote, setCashNote] = useState("");

  const daftarStatus = ["Semua", "Lunas", "Menunggu Konfirmasi", "Partially Paid", "Belum Bayar", "Overdue"];

  const terfilter = daftarTagihan.filter(t => {
    const q = cari.toLowerCase();
    return (t.siswa.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.program.toLowerCase().includes(q))
      && (filterStatus === "Semua" || t.status === filterStatus);
  });

  const konfirmasi = (id: string) => {
    setSudahKonfirmasi(prev => [...prev, id]);
    setShowKonfirmasi(false);
    setDipilih(null);
  };

  const getStatus = (t: typeof daftarTagihan[0]) =>
    sudahKonfirmasi.includes(t.id) ? "Lunas" : t.status;

  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  const triggerNotif = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => setNotifMessage(null), 3000);
  };

  const handleSaveCashManual = () => {
    triggerNotif(`Pembayaran Cash Manual Rp ${cashAmount.toLocaleString("id-ID")} berhasil diinput!`);
    setShowInputCashModal(false);
    setCashNote("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .baris-tagihan:hover{background:#f8fafc!important;cursor:pointer}
      `}</style>

      {/* Toast Notification Inline */}
      {notifMessage && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifMessage}
        </div>
      )}

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tagihan & Pembayaran</h1>
          <p className="page-subtitle">Kelola tagihan seluruh siswa dan konfirmasi pembayaran cash.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => triggerNotif("Ekspor data tagihan berhasil diproses.")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ekspor
          </button>
          <button className="btn btn-accent" onClick={() => setShowInputCashModal(true)}>+ Input Cash Manual</button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
        {[
          { label: "Total Tagihan",          value: daftarTagihan.length, warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Lunas",                  value: daftarTagihan.filter(t=>t.status==="Lunas").length + sudahKonfirmasi.length, warna: "#059669", bg: "#d1fae5" },
          { label: "Menunggu Konfirmasi",    value: Math.max(0, daftarTagihan.filter(t=>t.status==="Menunggu Konfirmasi").length - sudahKonfirmasi.length), warna: "#b45309", bg: "#fef3c7" },
          { label: "Belum Bayar",            value: daftarTagihan.filter(t=>t.status==="Belum Bayar").length, warna: "#dc2626", bg: "#fee2e2" },
          { label: "Overdue",                value: daftarTagihan.filter(t=>t.status==="Overdue").length, warna: "#be185d", bg: "#fce7f3" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: k.warna }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Peringatan Antrian Cash */}
      {daftarTagihan.filter(t=>t.status==="Menunggu Konfirmasi" && t.metode==="Cash" && !sudahKonfirmasi.includes(t.id)).length > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>
              {daftarTagihan.filter(t=>t.status==="Menunggu Konfirmasi" && t.metode==="Cash" && !sudahKonfirmasi.includes(t.id)).length} pembayaran cash menunggu konfirmasi Anda
            </div>
            <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 2 }}>Klik baris tagihan untuk melihat detail dan konfirmasi.</div>
          </div>
        </div>
      )}

      {/* Bar Filter */}
      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" style={{ paddingLeft: 38, width: "100%" }} placeholder="Cari nama siswa, ID, atau program..." value={cari} onChange={e => setCari(e.target.value)} />
          </div>
          <select className="select-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", fontSize: 13.5 }}>
            {daftarStatus.map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto" }}>{terfilter.length} tagihan</span>
        </div>
      </div></div>

      {/* Tabel Tagihan */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["No. Invoice", "Siswa", "Program", "Tagihan", "Jumlah", "Metode", "Jalur", "Tanggal", "Status", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terfilter.map((t, i) => {
                const statusAktif = getStatus(t);
                return (
                  <tr key={t.id} className="baris-tagihan"
                    style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                    onClick={() => setDipilih(t)}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{t.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.siswa[0]}</div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{t.siswa}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{t.program}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{t.pertemuan}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>Rp {t.jumlah.toLocaleString("id")}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{t.metode}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.jalur !== "–" && (
                        <span style={{ background: t.jalur==="via Admin"?"#ede9fe":"#e0f2fe", color: t.jalur==="via Admin"?"#6d28d9":"#0369a1", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{t.jalur}</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-muted)" }}>{t.tanggal}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ ...warnaStatus[statusAktif], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{statusAktif}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                      {statusAktif === "Menunggu Konfirmasi" ? (
                        <button className="btn btn-accent btn-sm" onClick={() => { setDipilih(t); setShowKonfirmasi(true); }}>Konfirmasi</button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(t)}>Detail</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Tagihan */}
      {dipilih && !showKonfirmasi && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Tagihan</h2>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Nomor Invoice */}
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontFamily: "monospace", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>{dipilih.id}</div>

            {/* Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Nama Siswa", value: dipilih.siswa },
                { label: "Program", value: dipilih.program },
                { label: "Tagihan Pertemuan", value: dipilih.pertemuan },
                { label: "Jumlah", value: `Rp ${dipilih.jumlah.toLocaleString("id")}` },
                { label: "Metode Bayar", value: dipilih.metode },
                { label: "Jalur Pembayaran", value: dipilih.jalur },
                { label: "Tanggal Bayar", value: dipilih.tanggal },
              ].map(f => (
                <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>Status Tagihan</span>
              <span style={{ ...warnaStatus[getStatus(dipilih)], fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 999 }}>{getStatus(dipilih)}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: getStatus(dipilih) === "Menunggu Konfirmasi" ? "1fr 1fr" : "1fr", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              {getStatus(dipilih) === "Menunggu Konfirmasi" && (
                <button className="btn btn-accent" onClick={() => setShowKonfirmasi(true)}>Konfirmasi Pembayaran</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Cash */}
      {showKonfirmasi && dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 440, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Konfirmasi Pembayaran</h2>
              <button onClick={() => { setShowKonfirmasi(false); setDipilih(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Info Ringkas */}
            <div style={{ background: "#fef3c7", borderRadius: 12, padding: "16px 18px", marginBottom: 20, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 13, color: "#92400e", marginBottom: 4 }}>{dipilih.id}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#78350f" }}>{dipilih.siswa}</div>
              <div style={{ fontSize: 13, color: "#b45309", marginTop: 2 }}>{dipilih.pertemuan} · {dipilih.metode}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#d97706", marginTop: 8 }}>Rp {dipilih.jumlah.toLocaleString("id")}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nominal Diterima (Rp)</label>
                <input className="form-input" type="number" defaultValue={dipilih.jumlah} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Catatan Admin (opsional)</label>
                <input className="form-input" placeholder="Contoh: Diterima tunai di kantor" />
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#166534" }}>
                Setelah dikonfirmasi, status tagihan berubah menjadi <strong>Lunas</strong> dan nomor transaksi akan digenerate otomatis.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setShowKonfirmasi(false); setDipilih(null); }}>Batal</button>
                <button className="btn btn-accent" onClick={() => konfirmasi(dipilih.id)}>Konfirmasi Lunas</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Input Cash Manual (Requirement #3) */}
      {showInputCashModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Input Pembayaran Cash Manual</h2>
              <button onClick={() => setShowInputCashModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Pilih Orang Tua / Anak</label>
                <select className="select-control" style={{ width: "100%" }} value={selectedParentChild} onChange={e => setSelectedParentChild(e.target.value)}>
                  <option value="Budi Setiawan — Andi Setiawan (Calistung Level 1)">Budi Setiawan — Parent of Andi Setiawan (Calistung Level 1)</option>
                  <option value="Joko Santoso — Budi Santoso (English B1)">Joko Santoso — Parent of Budi Santoso (English B1)</option>
                  <option value="Dewi Kirana — Citra Kirana (Math Advance)">Dewi Kirana — Parent of Citra Kirana (Math Advance)</option>
                  <option value="Sari Pratama — Dian Pratama (Phonics Starter)">Sari Pratama — Parent of Dian Pratama (Phonics Starter)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Jumlah Uang Yang Dibayar (Rp)</label>
                <input className="form-input" type="number" value={cashAmount} onChange={e => setCashAmount(Number(e.target.value))} placeholder="100000" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Pembayaran (Opsional)</label>
                <input className="form-input" value={cashNote} onChange={e => setCashNote(e.target.value)} placeholder="Contoh: Diterima tunai oleh Kasir Admin" />
              </div>

              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#0369a1" }}>
                Pembayaran tunai ini akan dicatat langsung sebagai transaksi <strong>Lunas (via Admin)</strong> dan masuk ke laporan keuangan.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setShowInputCashModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={handleSaveCashManual}>Simpan Cash Manual</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
