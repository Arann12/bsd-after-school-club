"use client";
import { useState } from "react";

const bulanOpsi = ["September 2026", "Agustus 2026", "Juli 2026"];

const dataBulanan: Record<string, {
  pendapatan: number; target: number; cash: number; digital: number;
  pengeluaran: number; siswaAktif: number; siswaBaru: number; graduasi: number;
  honorTotal: number; honorGuru: { nama: string; jam: number; tarif: number; total: number }[];
  rincianPendapatan: { program: string; siswa: number; nominal: number }[];
}> = {
  "September 2026": {
    pendapatan: 21500000, target: 22000000, cash: 6800000, digital: 14700000,
    pengeluaran: 9200000, siswaAktif: 84, siswaBaru: 5, graduasi: 3,
    honorTotal: 7400000,
    honorGuru: [
      { nama: "Ms. Sarah",  jam: 32, tarif: 100000, total: 3200000 },
      { nama: "Mr. Andi",   jam: 24, tarif: 90000,  total: 2160000 },
      { nama: "Ms. Nina",   jam: 22, tarif: 90000,  total: 1980000 },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1", siswa: 34, nominal: 7200000 },
      { program: "English B1",         siswa: 28, nominal: 6300000 },
      { program: "Math Advance",        siswa: 22, nominal: 5500000 },
      { program: "Phonics Starter",     siswa: 18, nominal: 2500000 },
    ],
  },
  "Agustus 2026": {
    pendapatan: 18450000, target: 20000000, cash: 6250000, digital: 12200000,
    pengeluaran: 8600000, siswaAktif: 79, siswaBaru: 3, graduasi: 1,
    honorTotal: 6800000,
    honorGuru: [
      { nama: "Ms. Sarah",  jam: 28, tarif: 100000, total: 2800000 },
      { nama: "Mr. Andi",   jam: 22, tarif: 90000,  total: 1980000 },
      { nama: "Ms. Nina",   jam: 22, tarif: 90000,  total: 1980000 },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1", siswa: 31, nominal: 6700000 },
      { program: "English B1",         siswa: 25, nominal: 5700000 },
      { program: "Math Advance",        siswa: 23, nominal: 3650000 },
      { program: "Phonics Starter",     siswa: 12, nominal: 2400000 },
    ],
  },
  "Juli 2026": {
    pendapatan: 15800000, target: 18000000, cash: 5100000, digital: 10700000,
    pengeluaran: 7900000, siswaAktif: 72, siswaBaru: 8, graduasi: 0,
    honorTotal: 5900000,
    honorGuru: [
      { nama: "Ms. Sarah",  jam: 24, tarif: 100000, total: 2400000 },
      { nama: "Mr. Andi",   jam: 20, tarif: 90000,  total: 1800000 },
      { nama: "Ms. Nina",   jam: 19, tarif: 90000,  total: 1700000 },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1", siswa: 28, nominal: 5800000 },
      { program: "English B1",         siswa: 22, nominal: 4800000 },
      { program: "Math Advance",        siswa: 22, nominal: 3800000 },
      { program: "Phonics Starter",     siswa: 14, nominal: 1400000 },
    ],
  },
};

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const pct = (n: number, total: number) => Math.round((n / total) * 100);

export default function OwnerLaporanPage() {
  const [bulan, setBulan] = useState("September 2026");
  const [tab, setTab] = useState<"keuangan" | "honor" | "operasional">("keuangan");
  const d = dataBulanan[bulan];
  const labaBersih = d.pendapatan - d.pengeluaran;
  const persenTarget = pct(d.pendapatan, d.target);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Eksekutif</h1>
          <p className="page-subtitle">Ringkasan keuangan, honor guru, dan kinerja operasional bisnis BSD After School Club.</p>
        </div>
        <select value={bulan} onChange={e => setBulan(e.target.value)}
          style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "9px 14px", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)", background: "white", cursor: "pointer" }}>
          {bulanOpsi.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* KPI Utama */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "Total Pendapatan",  val: fmt(d.pendapatan), warna: "#059669", sub: `${persenTarget}% dari target`, progress: persenTarget },
          { label: "Laba Bersih",       val: fmt(labaBersih),   warna: labaBersih > 0 ? "#1d4ed8" : "#dc2626", sub: `Setelah honor & operasional` },
          { label: "Siswa Aktif",       val: `${d.siswaAktif} Siswa`, warna: "#7c3aed", sub: `+${d.siswaBaru} siswa baru bulan ini` },
          { label: "Siswa Graduated",   val: `${d.graduasi} Siswa`,   warna: "#d97706", sub: "Sertifikat terbit bulan ini" },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 20, color: k.warna, wordBreak: "break-word" }}>{k.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{k.sub}</div>
            {k.progress !== undefined && (
              <div style={{ marginTop: 8, height: 5, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#059669", width: `${Math.min(k.progress, 100)}%`, borderRadius: 999 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab Navigasi */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
        {[
          { id: "keuangan",    label: "Laporan Keuangan" },
          { id: "honor",       label: "Honor Guru" },
          { id: "operasional", label: "Kinerja Operasional" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all .15s",
              background: tab === t.id ? "var(--color-primary)" : "var(--color-bg)",
              color: tab === t.id ? "white" : "var(--color-text-secondary)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB KEUANGAN */}
      {tab === "keuangan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ringkasan P&L */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 18px" }}>
              Ringkasan Keuangan — {bulan}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Pendapatan Bruto",  val: fmt(d.pendapatan),  warna: "#059669", prefix: "+" },
                { label: "Total Pengeluaran", val: fmt(d.pengeluaran), warna: "#dc2626", prefix: "−" },
                { label: "Honor Guru",        val: fmt(d.honorTotal),  warna: "#dc2626", prefix: "−", sub: "Termasuk dalam pengeluaran" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--color-bg)", borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{row.label}</div>
                    {row.sub && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{row.sub}</div>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: row.warna }}>{row.prefix} {row.val}</div>
                </div>
              ))}
              {/* Total Laba */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: labaBersih > 0 ? "#d1fae5" : "#fee2e2", borderRadius: 12, border: `2px solid ${labaBersih > 0 ? "#86efac" : "#fca5a5"}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: labaBersih > 0 ? "#15803d" : "#991b1b" }}>Laba Bersih</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: labaBersih > 0 ? "#15803d" : "#991b1b" }}>{fmt(labaBersih)}</div>
              </div>
            </div>
          </div>

          {/* Rincian Pendapatan per Program */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <h2 className="card-title">Rincian Pendapatan per Program</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["Program", "Siswa", "Nominal", "% Total"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.rincianPendapatan.map((p, i) => (
                  <tr key={i} style={{ borderBottom: i < d.rincianPendapatan.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>{p.program}</td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{p.siswa} siswa</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "#059669" }}>{fmt(p.nominal)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--color-primary)", width: `${pct(p.nominal, d.pendapatan)}%`, borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>{pct(p.nominal, d.pendapatan)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Metode Pembayaran */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Digital (VA / QRIS / E-Wallet)", val: fmt(d.digital), pct: pct(d.digital, d.pendapatan), warna: "#1d4ed8" },
              { label: "Cash (Tunai)",                   val: fmt(d.cash),    pct: pct(d.cash, d.pendapatan),    warna: "#7c3aed" },
            ].map(m => (
              <div key={m.label} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: m.warna, marginBottom: 8 }}>{m.val}</div>
                <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: m.warna, width: `${m.pct}%`, borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>{m.pct}% dari total pendapatan</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB HONOR GURU */}
      {tab === "honor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "14px 20px", display: "flex", gap: 12, alignItems: "center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div style={{ fontSize: 13, color: "#92400e" }}>
              <strong>Informasi Eksklusif Owner:</strong> Data honor guru bersifat rahasia dan hanya dapat dilihat oleh Owner / Super Admin. Guru dan Admin tidak dapat mengakses halaman ini.
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Honorarium Guru — {bulan}</h2>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>Berdasarkan jam mengajar × tarif per jam</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700 }}>Total Honor Dibayarkan</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>{fmt(d.honorTotal)}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {d.honorGuru.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border-light)" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {g.nama[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.nama}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                      {g.jam} jam mengajar × {fmt(g.tarif)}/jam
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--color-primary)" }}>{fmt(g.total)}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{g.jam} jam</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: "14px 20px", background: "#fee2e2", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#991b1b" }}>Total Pengeluaran Honor</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#dc2626" }}>{fmt(d.honorTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB OPERASIONAL */}
      {tab === "operasional" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Rekap Siswa */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>Rekap Siswa</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Siswa Aktif",    val: d.siswaAktif, warna: "#059669" },
                  { label: "Siswa Baru",     val: d.siswaBaru,  warna: "#1d4ed8" },
                  { label: "Siswa Graduated",val: d.graduasi,   warna: "#7c3aed" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--color-bg)", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.warna, flexShrink: 0 }} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{r.label}</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: r.warna }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pendapatan per Program Bar */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>Kontribusi per Program</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {d.rincianPendapatan.map(p => (
                  <div key={p.program}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>{p.program}</span>
                      <span style={{ color: "var(--color-primary)" }}>{pct(p.nominal, d.pendapatan)}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--color-primary)", width: `${pct(p.nominal, d.pendapatan)}%`, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catatan Owner */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", gap: 12 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.7 }}>
              <strong>Rekomendasi:</strong> Target bulan {bulan} sebesar {fmt(d.target)}. 
              Pendapatan saat ini {persenTarget >= 100 ? "telah melewati target." : `masih kurang ${fmt(d.target - d.pendapatan)} dari target.`} 
              Pertimbangkan program promosi untuk meningkatkan pendaftaran siswa baru.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
