"use client";
import { useState } from "react";

const dataAbsensi = [
  { bulan: "Agustus 2026", sesi: [
    { tgl: "4 Agt 2026",  jam: "14:00–15:00", status: "Hadir", materi: "Mengenal Abjad A–G",         pertemuan: 1 },
    { tgl: "6 Agt 2026",  jam: "14:00–15:00", status: "Hadir", materi: "Mengenal Abjad H–N",         pertemuan: 2 },
    { tgl: "11 Agt 2026", jam: "14:00–15:00", status: "Hadir", materi: "Mengenal Abjad O–Z",         pertemuan: 3 },
    { tgl: "13 Agt 2026", jam: "14:00–15:00", status: "Hadir", materi: "Menulis Angka 1–10",        pertemuan: 4 },
    { tgl: "18 Agt 2026", jam: "14:00–15:00", status: "Izin",  materi: "Membaca Kalimat Sederhana", pertemuan: 5 },
    { tgl: "20 Agt 2026", jam: "14:00–15:00", status: "Hadir", materi: "Menulis Angka 11–20",       pertemuan: 6 },
    { tgl: "25 Agt 2026", jam: "14:00–15:00", status: "Hadir", materi: "Membaca Suku Kata",         pertemuan: 7 },
  ]},
];

const warna: Record<string, { bg: string; color: string }> = {
  Hadir: { bg: "#d1fae5", color: "#059669" },
  Izin:  { bg: "#fef3c7", color: "#b45309" },
  Alpha: { bg: "#fee2e2", color: "#dc2626" },
};

export default function OrangTuaAbsensiPage() {
  const [bulanAktif, setBulanAktif] = useState(dataAbsensi[0].bulan);
  const bln = dataAbsensi.find(b => b.bulan === bulanAktif)!;
  const total   = bln.sesi.length;
  const hadir   = bln.sesi.filter(s => s.status === "Hadir").length;
  const tidakHadir = total - hadir;
  const persen  = Math.round((hadir / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rekap Absensi Anak</h1>
          <p className="page-subtitle">Riwayat kehadiran anak Anda di setiap sesi kelas.</p>
        </div>
        <select value={bulanAktif} onChange={e => setBulanAktif(e.target.value)}
          style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)", background: "white", cursor: "pointer" }}>
          {dataAbsensi.map(b => <option key={b.bulan}>{b.bulan}</option>)}
        </select>
      </div>

      {/* Profil Anak */}
      <div className="card" style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 900, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>Andi Setiawan</div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>KLS-A · Calistung Level 1 · Guru: Ms. Sarah</div>
        </div>
      </div>

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Tingkat Kehadiran", val: `${persen}%`, warna: "#059669", sub: "Bulan ini" },
          { label: "Total Sesi",        val: `${total}`,   warna: "#1d4ed8", sub: "Sesi terjadwal" },
          { label: "Hadir",             val: `${hadir}`,   warna: "#059669", sub: "Sesi hadir" },
          { label: "Tidak Hadir",       val: `${tidakHadir}`, warna: tidakHadir > 0 ? "#dc2626" : "#059669", sub: "Izin / Alpha" },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: k.warna }}>{k.val}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabel Absensi */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Detail Kehadiran — {bulanAktif}</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Ptm.", "Tanggal", "Jam", "Status", "Materi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bln.sesi.map((s, i) => (
              <tr key={i} style={{ borderBottom: i < bln.sesi.length - 1 ? "1px solid var(--color-border-light)" : "none", background: s.status !== "Hadir" ? "rgba(254,243,199,0.3)" : "transparent" }}>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontSize: 11, fontWeight: 800 }}>{s.pertemuan}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{s.tgl}</td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{s.jam}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ ...warna[s.status], fontSize: 11.5, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>{s.status}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.materi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Catatan Kebijakan */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-lg)", padding: "14px 20px", display: "flex", gap: 12 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
          <strong>Catatan:</strong> Hari libur nasional tidak dihitung sebagai pertemuan. Reschedule sesi tidak mengubah nomor urut pertemuan.
        </div>
      </div>
    </div>
  );
}
