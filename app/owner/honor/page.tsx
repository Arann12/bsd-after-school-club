"use client";
import { useState } from "react";
import Link from "next/link";

const periodePilihan = ["Agustus 2026", "Juli 2026", "Juni 2026"];

const dataGuru = [
  { id: "GUR-2026-001", nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", sesiSelesai: 18, totalJam: 18, tarifPerJam: 75000, bonus: 100000, status: "Belum Dibayar" },
  { id: "GUR-2026-002", nama: "Mr. Andi", spesialisasi: "English", sesiSelesai: 14, totalJam: 14, tarifPerJam: 80000, bonus: 0, status: "Sudah Dibayar" },
  { id: "GUR-2026-003", nama: "Ms. Nina", spesialisasi: "Matematika", sesiSelesai: 10, totalJam: 10, tarifPerJam: 80000, bonus: 50000, status: "Belum Dibayar" },
  { id: "GUR-2026-004", nama: "Mr. Budi", spesialisasi: "Calistung Lanjut", sesiSelesai: 12, totalJam: 12, tarifPerJam: 75000, bonus: 0, status: "Sudah Dibayar" },
];

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Belum Dibayar": { bg: "#fef3c7", color: "#b45309" },
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Sebagian":      { bg: "#dbeafe", color: "#1d4ed8" },
};

export default function OwnerHonorPage() {
  const [periode, setPeriode] = useState(periodePilihan[0]);
  const [dipilih, setDipilih] = useState<typeof dataGuru[0] | null>(null);
  const [sudahBayar, setSudahBayar] = useState<string[]>(["GUR-2026-002", "GUR-2026-004"]);

  const getStatus = (g: typeof dataGuru[0]) =>
    sudahBayar.includes(g.id) ? "Sudah Dibayar" : g.status;

  const hitungHonor = (g: typeof dataGuru[0]) => g.sesiSelesai * g.tarifPerJam + g.bonus;

  const totalHonor = dataGuru.reduce((a, g) => a + hitungHonor(g), 0);
  const sudahCair  = dataGuru.filter(g => sudahBayar.includes(g.id)).reduce((a, g) => a + hitungHonor(g), 0);
  const belumCair  = totalHonor - sudahCair;

  const bayarHonor = (id: string) => {
    setSudahBayar(prev => [...prev, id]);
    setDipilih(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .baris-honor:hover{background:#f8fafc!important;cursor:pointer}
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Honor Guru</h1>
          <p className="page-subtitle">Kalkulasi dan pencairan honor mengajar per periode.</p>
        </div>
        <div className="page-header-actions">
          <select style={{ padding: "9px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "white", color: "var(--color-text-primary)" }}
            value={periode} onChange={e => setPeriode(e.target.value)}>
            {periodePilihan.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => alert("Ekspor rekap honor...")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ekspor Rekap
          </button>
        </div>
      </div>

      {/* Peringatan Khusus Owner */}
      <div style={{ background: "linear-gradient(135deg, #1a5c8a 0%, #134570 100%)", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Data Konfidensial — Hanya Terlihat oleh Owner</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Informasi honor guru tidak pernah ditampilkan ke Admin, Guru, atau Orang Tua.</div>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Honor Bulan Ini", value: `Rp ${totalHonor.toLocaleString("id")}`, warna: "#1d4ed8", bg: "#dbeafe", besar: true },
          { label: "Sudah Dicairkan", value: `Rp ${sudahCair.toLocaleString("id")}`, warna: "#059669", bg: "#d1fae5", besar: true },
          { label: "Belum Dicairkan", value: `Rp ${belumCair.toLocaleString("id")}`, warna: "#b45309", bg: "#fef3c7", besar: true },
          { label: "Jumlah Guru", value: dataGuru.length, warna: "#7c3aed", bg: "#ede9fe", besar: false },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label" style={{ fontSize: 11.5 }}>{k.label}</span>
            <div style={{ fontSize: k.besar ? 18 : 28, fontWeight: 800, color: k.warna, lineHeight: 1.2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Periode Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: "var(--color-border)" }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-muted)", padding: "0 12px", background: "white", border: "1px solid var(--color-border)", borderRadius: 999 }}>
          Periode: {periode}
        </span>
        <div style={{ height: 1, flex: 1, background: "var(--color-border)" }} />
      </div>

      {/* Tabel Honor */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Guru", "Nama Guru", "Spesialisasi", "Sesi Selesai", "Total Jam", "Tarif/Jam", "Bonus", "Total Honor", "Status", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataGuru.map((g, i) => {
                const statusAktif = getStatus(g);
                const totalHonorGuru = hitungHonor(g);
                return (
                  <tr key={g.id} className="baris-honor"
                    style={{ borderBottom: i < dataGuru.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                    onClick={() => setDipilih(g)}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{g.id}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{g.nama[3]}</div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{g.nama}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{g.spesialisasi}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center" }}>{g.sesiSelesai}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center" }}>{g.totalJam} jam</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>Rp {g.tarifPerJam.toLocaleString("id")}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: g.bonus > 0 ? "#059669" : "var(--color-text-muted)", fontWeight: g.bonus > 0 ? 700 : 400 }}>
                      {g.bonus > 0 ? `+Rp ${g.bonus.toLocaleString("id")}` : "–"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 800, color: "var(--color-primary)" }}>Rp {totalHonorGuru.toLocaleString("id")}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ ...warnaStatus[statusAktif], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{statusAktif}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                      {statusAktif === "Belum Dibayar" ? (
                        <button className="btn btn-accent btn-sm" onClick={() => { setDipilih(g); }}>Cairkan</button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => setDipilih(g)}>Riwayat</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer Total */}
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-border)", background: "var(--color-bg)" }}>
                <td colSpan={7} style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>Total Honor {periode}</td>
                <td style={{ padding: "14px 16px", fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>Rp {totalHonor.toLocaleString("id")}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Detail & Cairkan Honor */}
      {dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Rincian Honor — {dipilih.nama}</h2>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Rincian Kalkulasi */}
            <div style={{ background: "linear-gradient(135deg, #1a5c8a, #2a7ab8)", borderRadius: 12, padding: "20px", color: "white", marginBottom: 18 }}>
              <div style={{ fontSize: 12, opacity: .8, marginBottom: 4 }}>{dipilih.id} · Periode {periode}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Rp {hitungHonor(dipilih).toLocaleString("id")}</div>
              <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>{dipilih.spesialisasi}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {[
                { label: "Sesi Selesai", value: `${dipilih.sesiSelesai} sesi` },
                { label: "Total Jam Mengajar", value: `${dipilih.totalJam} jam` },
                { label: "Tarif per Jam", value: `Rp ${dipilih.tarifPerJam.toLocaleString("id")}` },
                { label: "Honor Pokok", value: `Rp ${(dipilih.sesiSelesai * dipilih.tarifPerJam).toLocaleString("id")}` },
                { label: "Bonus", value: dipilih.bonus > 0 ? `Rp ${dipilih.bonus.toLocaleString("id")}` : "–" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{f.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--color-primary-bg)", borderRadius: 10, border: "1.5px solid var(--color-primary)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)" }}>Total Honor</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>Rp {hitungHonor(dipilih).toLocaleString("id")}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: getStatus(dipilih) === "Belum Dibayar" ? "1fr 1fr" : "1fr", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              {getStatus(dipilih) === "Belum Dibayar" && (
                <button className="btn btn-accent" onClick={() => bayarHonor(dipilih.id)}>
                  💸 Cairkan Honor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
