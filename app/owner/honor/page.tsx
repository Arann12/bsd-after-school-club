"use client";
import { useState } from "react";

const periodePilihan = ["September 2026", "Agustus 2026", "Juli 2026"];

interface BonusRecord {
  jumlah: number;
  catatan: string;
  tanggal: string;
}

interface GuruHonorData {
  id: string;
  nama: string;
  spesialisasi: string;
  sesiSelesai: number;
  totalJam: number;
  tarifPerJam: number;
  bonusList: BonusRecord[];
  status: "Belum Dibayar" | "Sudah Dibayar" | "Sebagian";
}

const initialDataGuru: GuruHonorData[] = [
  { id: "GUR-2026-0001", nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", sesiSelesai: 18, totalJam: 18.0, tarifPerJam: 75000, bonusList: [{ jumlah: 100000, catatan: "Bonus Kerajinan & Presensi Sempurna", tanggal: "01 Sep 2026" }], status: "Belum Dibayar" },
  { id: "GUR-2026-0002", nama: "Mr. Andi",  spesialisasi: "English & Coding",  sesiSelesai: 14, totalJam: 14.0, tarifPerJam: 80000, bonusList: [], status: "Sudah Dibayar" },
  { id: "GUR-2026-0003", nama: "Ms. Nina",  spesialisasi: "Matematika",          sesiSelesai: 10, totalJam: 10.5, tarifPerJam: 80000, bonusList: [{ jumlah: 50000, catatan: "Bonus Pengisian Logbook Cepat", tanggal: "28 Agt 2026" }], status: "Belum Dibayar" },
  { id: "GUR-2026-0004", nama: "Mr. Budi",  spesialisasi: "Calistung Lanjut",   sesiSelesai: 12, totalJam: 12.0, tarifPerJam: 75000, bonusList: [], status: "Sudah Dibayar" },
];

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Belum Dibayar": { bg: "#fef3c7", color: "#b45309" },
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Sebagian":      { bg: "#dbeafe", color: "#1d4ed8" },
};

export default function OwnerHonorPage() {
  const [periode, setPeriode] = useState(periodePilihan[0]);
  const [listGuru, setListGuru] = useState<GuruHonorData[]>(initialDataGuru);
  const [dipilih, setDipilih] = useState<GuruHonorData | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [guruTargetBonus, setGuruTargetBonus] = useState<GuruHonorData | null>(null);
  const [inputBonusNominal, setInputBonusNominal] = useState(50000);
  const [inputBonusCatatan, setInputBonusCatatan] = useState("");
  const [inputBonusTanggal, setInputBonusTanggal] = useState("2026-09-01");

  const totalBonusGuru = (g: GuruHonorData) => g.bonusList.reduce((acc, b) => acc + b.jumlah, 0);
  const hitungHonor = (g: GuruHonorData) => Math.round(g.totalJam * g.tarifPerJam) + totalBonusGuru(g);

  const totalHonor = listGuru.reduce((a, g) => a + hitungHonor(g), 0);
  const sudahCair  = listGuru.filter(g => g.status === "Sudah Dibayar").reduce((a, g) => a + hitungHonor(g), 0);
  const belumCair  = totalHonor - sudahCair;

  const bayarHonor = (id: string) => {
    setListGuru(prev => prev.map(g => g.id === id ? { ...g, status: "Sudah Dibayar" } : g));
    setDipilih(null);
  };

  const handleTambahBonusSubmit = () => {
    if (!guruTargetBonus) return;
    const newBonusRecord: BonusRecord = {
      jumlah: Number(inputBonusNominal),
      catatan: inputBonusCatatan || "Bonus Tambahan Owner",
      tanggal: inputBonusTanggal,
    };

    setListGuru(prev =>
      prev.map(g => (g.id === guruTargetBonus.id ? { ...g, bonusList: [...g.bonusList, newBonusRecord] } : g))
    );

    setShowBonusModal(false);
    setInputBonusCatatan("");
    setNotifToast(`Bonus Rp ${Number(inputBonusNominal).toLocaleString("id")} berhasil ditambahkan untuk ${guruTargetBonus.nama}!`);
    setTimeout(() => setNotifToast(null), 3000);
  };

  const [notifToast, setNotifToast] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .baris-honor:hover{background:#f8fafc!important;cursor:pointer}
      `}</style>

      {/* Notification Toast Inline */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifToast}
        </div>
      )}

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honor Guru & Staff</h1>
          <p className="page-subtitle">Kalkulasi, rincian bonus, dan pencairan honor mengajar per periode.</p>
        </div>
        <div className="page-header-actions">
          <select style={{ padding: "9px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "white", color: "var(--color-text-primary)" }}
            value={periode} onChange={e => setPeriode(e.target.value)}>
            {periodePilihan.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => { setNotifToast("Ekspor rekap honor berhasil diproses."); setTimeout(() => setNotifToast(null), 3000); }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ekspor Rekap
          </button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Honor Bulan Ini", value: `Rp ${totalHonor.toLocaleString("id")}`, warna: "#1d4ed8", bg: "#dbeafe", besar: true },
          { label: "Sudah Dicairkan", value: `Rp ${sudahCair.toLocaleString("id")}`, warna: "#059669", bg: "#d1fae5", besar: true },
          { label: "Belum Dicairkan", value: `Rp ${belumCair.toLocaleString("id")}`, warna: "#b45309", bg: "#fef3c7", besar: true },
          { label: "Jumlah Guru", value: listGuru.length, warna: "#7c3aed", bg: "#ede9fe", besar: false },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: k.besar ? 18 : 28, fontWeight: 800, color: k.warna, lineHeight: 1.2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabel Honor */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Guru", "Nama Guru", "Spesialisasi", "Total Jam", "Tarif/Jam", "Total Bonus", "Total Honor", "Status", "Aksi Bonus", "Pencairan"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listGuru.map((g, i) => {
                const totBonus = totalBonusGuru(g);
                const totalHonorGuru = hitungHonor(g);
                return (
                  <tr key={g.id} className="baris-honor"
                    style={{ borderBottom: i < listGuru.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                    onClick={() => setDipilih(g)}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{g.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{g.nama[3]}</div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{g.nama}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{g.spesialisasi}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{g.totalJam} jam</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>Rp {g.tarifPerJam.toLocaleString("id")}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: totBonus > 0 ? "#059669" : "var(--color-text-muted)", fontWeight: totBonus > 0 ? 800 : 400 }}>
                      {totBonus > 0 ? `+Rp ${totBonus.toLocaleString("id")}` : "0"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 800, color: "var(--color-primary)" }}>Rp {totalHonorGuru.toLocaleString("id")}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ ...warnaStatus[g.status], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{g.status}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setGuruTargetBonus(g); setShowBonusModal(true); }}>
                        + Tambah Bonus
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                      {g.status === "Belum Dibayar" ? (
                        <button className="btn btn-accent btn-sm" onClick={() => { setDipilih(g); }}>Cairkan</button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(g)}>Rincian</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH BONUS (Requirement #9) */}
      {showBonusModal && guruTargetBonus && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 460, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Tambah Bonus — {guruTargetBonus.nama}</h2>
              <button onClick={() => setShowBonusModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Nominal Bonus (Rp)</label>
                <input className="form-input" type="number" value={inputBonusNominal} onChange={e => setInputBonusNominal(Number(e.target.value))} placeholder="50000" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Catatan Alasan Bonus</label>
                <input className="form-input" value={inputBonusCatatan} onChange={e => setInputBonusCatatan(e.target.value)} placeholder="Contoh: Performa mengajar luar biasa / Bonus lembur event" />
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
          </div>
        </div>
      )}

      {/* Modal Detail & Rincian Honor Guru */}
      {dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Rincian Honor — {dipilih.nama}</h2>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
            </div>

            <div style={{ background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", borderRadius: 12, padding: "20px", color: "white", marginBottom: 18 }}>
              <div style={{ fontSize: 12, opacity: .8, marginBottom: 4 }}>{dipilih.id} · Periode {periode}</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>Rp {hitungHonor(dipilih).toLocaleString("id")}</div>
              <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>{dipilih.spesialisasi}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Total Jam Mengajar</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{dipilih.totalJam} jam</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Tarif per Jam</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Rp {dipilih.tarifPerJam.toLocaleString("id")}</span>
              </div>

              {/* Daftar Riwayat Bonus */}
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Riwayat Bonus Diberikan</div>
                {dipilih.bonusList.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Belum ada bonus tambahan periode ini.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dipilih.bonusList.map((b, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{b.catatan}</div>
                          <div style={{ fontSize: 10, color: "#64748b" }}>{b.tanggal}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>+Rp {b.jumlah.toLocaleString("id")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: dipilih.status === "Belum Dibayar" ? "1fr 1fr" : "1fr", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              {dipilih.status === "Belum Dibayar" && (
                <button className="btn btn-accent" onClick={() => bayarHonor(dipilih.id)}>Cairkan Honor</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
