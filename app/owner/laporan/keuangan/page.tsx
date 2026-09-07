"use client";
import { useState } from "react";
import Link from "next/link";

/* ============================================================
   DATA
   ============================================================ */
const bulanOpsi = ["September 2026", "Agustus 2026", "Juli 2026"];

interface BulanData {
  pendapatan: number;
  target: number;
  cash: number;
  digital: number;
  pengeluaran: number;
  honorTotal: number;
  honorGuru: { nama: string; spesialisasi: string; jam: number; tarif: number; bonus: number; status: "Sudah Dibayar" | "Belum Dibayar" | "Sebagian" }[];
  rincianPendapatan: { program: string; siswa: number; nominal: number }[];
  transaksi: { id: string; tanggal: string; siswa: string; program: string; metode: string; nominal: number; status: string }[];
}

const dataBulanan: Record<string, BulanData> = {
  "September 2026": {
    pendapatan: 21500000, target: 22000000, cash: 6800000, digital: 14700000,
    pengeluaran: 9200000, honorTotal: 7400000,
    honorGuru: [
      { nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", jam: 32, tarif: 100000, bonus: 150000, status: "Sudah Dibayar" },
      { nama: "Mr. Andi", spesialisasi: "English & Coding", jam: 24, tarif: 90000, bonus: 0, status: "Sudah Dibayar" },
      { nama: "Ms. Nina", spesialisasi: "Matematika", jam: 22, tarif: 90000, bonus: 50000, status: "Belum Dibayar" },
      { nama: "Mr. Budi", spesialisasi: "Calistung Lanjut", jam: 18, tarif: 85000, bonus: 0, status: "Sebagian" },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1 & 2", siswa: 34, nominal: 7200000 },
      { program: "English B1 & B2", siswa: 28, nominal: 6300000 },
      { program: "Math Advance", siswa: 22, nominal: 5500000 },
      { program: "Phonics Starter", siswa: 18, nominal: 2500000 },
    ],
    transaksi: [
      { id: "PAY-2026-00041", tanggal: "5 Sep 2026", siswa: "Andi Setiawan", program: "Calistung L1", metode: "VA BCA", nominal: 100000, status: "Lunas" },
      { id: "PAY-2026-00040", tanggal: "4 Sep 2026", siswa: "Budi Santoso", program: "English B1", metode: "QRIS", nominal: 75000, status: "Lunas" },
      { id: "CASH-2026-00012", tanggal: "4 Sep 2026", siswa: "Fitri Handayani", program: "English B1", metode: "Cash", nominal: 150000, status: "Menunggu Verifikasi" },
      { id: "PAY-2026-00039", tanggal: "3 Sep 2026", siswa: "Citra Kirana", program: "Math Advance", metode: "GoPay", nominal: 120000, status: "Lunas" },
      { id: "PAY-2026-00038", tanggal: "2 Sep 2026", siswa: "Dian Pratama", program: "Phonics Starter", metode: "ShopeePay", nominal: 50000, status: "Lunas" },
      { id: "CASH-2026-00011", tanggal: "1 Sep 2026", siswa: "Hana Pertiwi", program: "Phonics Starter", metode: "Cash", nominal: 100000, status: "Lunas" },
      { id: "PAY-2026-00037", tanggal: "1 Sep 2026", siswa: "Gilang Ramadan", program: "Math Advance", metode: "VA Mandiri", nominal: 60000, status: "Lunas" },
      { id: "INV-2026-000032", tanggal: "30 Agt 2026", siswa: "Eko Wijaya", program: "Calistung L2", metode: "–", nominal: 100000, status: "Belum Bayar" },
    ],
  },
  "Agustus 2026": {
    pendapatan: 18450000, target: 20000000, cash: 6250000, digital: 12200000,
    pengeluaran: 8600000, honorTotal: 6800000,
    honorGuru: [
      { nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", jam: 28, tarif: 100000, bonus: 100000, status: "Sudah Dibayar" },
      { nama: "Mr. Andi", spesialisasi: "English & Coding", jam: 22, tarif: 90000, bonus: 0, status: "Sudah Dibayar" },
      { nama: "Ms. Nina", spesialisasi: "Matematika", jam: 22, tarif: 90000, bonus: 50000, status: "Sudah Dibayar" },
      { nama: "Mr. Budi", spesialisasi: "Calistung Lanjut", jam: 16, tarif: 85000, bonus: 0, status: "Sudah Dibayar" },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1 & 2", siswa: 31, nominal: 6700000 },
      { program: "English B1 & B2", siswa: 25, nominal: 5700000 },
      { program: "Math Advance", siswa: 23, nominal: 3650000 },
      { program: "Phonics Starter", siswa: 12, nominal: 2400000 },
    ],
    transaksi: [
      { id: "PAY-2026-00030", tanggal: "30 Agt 2026", siswa: "Andi Setiawan", program: "Calistung L1", metode: "VA BCA", nominal: 100000, status: "Lunas" },
      { id: "PAY-2026-00029", tanggal: "28 Agt 2026", siswa: "Fitri Handayani", program: "English B1", metode: "QRIS", nominal: 75000, status: "Lunas" },
      { id: "CASH-2026-00008", tanggal: "27 Agt 2026", siswa: "Citra Kirana", program: "Math Advance", metode: "Cash", nominal: 120000, status: "Lunas" },
      { id: "PAY-2026-00028", tanggal: "25 Agt 2026", siswa: "Dian Pratama", program: "Phonics Starter", metode: "GoPay", nominal: 50000, status: "Lunas" },
      { id: "PAY-2026-00027", tanggal: "23 Agt 2026", siswa: "Gilang Ramadan", program: "Math Advance", metode: "VA BCA", nominal: 60000, status: "Lunas" },
      { id: "INV-2026-000022", tanggal: "22 Agt 2026", siswa: "Hana Pertiwi", program: "Phonics Starter", metode: "–", nominal: 100000, status: "Overdue" },
      { id: "PAY-2026-00026", tanggal: "20 Agt 2026", siswa: "Eko Wijaya", program: "Calistung L2", metode: "VA Mandiri", nominal: 100000, status: "Lunas" },
      { id: "CASH-2026-00007", tanggal: "18 Agt 2026", siswa: "Budi Santoso", program: "English B1", metode: "Cash", nominal: 75000, status: "Lunas" },
    ],
  },
  "Juli 2026": {
    pendapatan: 15800000, target: 18000000, cash: 5100000, digital: 10700000,
    pengeluaran: 7900000, honorTotal: 5900000,
    honorGuru: [
      { nama: "Ms. Sarah", spesialisasi: "Calistung & Phonics", jam: 24, tarif: 100000, bonus: 0, status: "Sudah Dibayar" },
      { nama: "Mr. Andi", spesialisasi: "English & Coding", jam: 20, tarif: 90000, bonus: 0, status: "Sudah Dibayar" },
      { nama: "Ms. Nina", spesialisasi: "Matematika", jam: 19, tarif: 90000, bonus: 0, status: "Sudah Dibayar" },
      { nama: "Mr. Budi", spesialisasi: "Calistung Lanjut", jam: 14, tarif: 85000, bonus: 0, status: "Sudah Dibayar" },
    ],
    rincianPendapatan: [
      { program: "Calistung Level 1 & 2", siswa: 28, nominal: 5800000 },
      { program: "English B1 & B2", siswa: 22, nominal: 4800000 },
      { program: "Math Advance", siswa: 22, nominal: 3800000 },
      { program: "Phonics Starter", siswa: 14, nominal: 1400000 },
    ],
    transaksi: [
      { id: "PAY-2026-00018", tanggal: "28 Jul 2026", siswa: "Andi Setiawan", program: "Calistung L1", metode: "VA BCA", nominal: 100000, status: "Lunas" },
      { id: "PAY-2026-00017", tanggal: "25 Jul 2026", siswa: "Budi Santoso", program: "English B1", metode: "QRIS", nominal: 75000, status: "Lunas" },
      { id: "CASH-2026-00005", tanggal: "23 Jul 2026", siswa: "Citra Kirana", program: "Math Advance", metode: "Cash", nominal: 120000, status: "Lunas" },
      { id: "PAY-2026-00016", tanggal: "20 Jul 2026", siswa: "Eko Wijaya", program: "Calistung L2", metode: "GoPay", nominal: 100000, status: "Lunas" },
      { id: "PAY-2026-00015", tanggal: "18 Jul 2026", siswa: "Fitri Handayani", program: "English B1", metode: "ShopeePay", nominal: 75000, status: "Lunas" },
      { id: "INV-2026-000012", tanggal: "15 Jul 2026", siswa: "Dian Pratama", program: "Phonics Starter", metode: "–", nominal: 50000, status: "Lunas" },
      { id: "PAY-2026-00014", tanggal: "12 Jul 2026", siswa: "Gilang Ramadan", program: "Math Advance", metode: "VA Mandiri", nominal: 60000, status: "Lunas" },
      { id: "CASH-2026-00004", tanggal: "10 Jul 2026", siswa: "Hana Pertiwi", program: "Phonics Starter", metode: "Cash", nominal: 100000, status: "Lunas" },
    ],
  },
};

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const pct = (n: number, total: number) => Math.round((n / total) * 100);

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Lunas": { bg: "#d1fae5", color: "#059669" },
  "Menunggu Verifikasi": { bg: "#fef3c7", color: "#b45309" },
  "Belum Bayar": { bg: "#fee2e2", color: "#dc2626" },
  "Overdue": { bg: "#fce7f3", color: "#be185d" },
};

const warnaHonor: Record<string, { bg: string; color: string }> = {
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Belum Dibayar": { bg: "#fef3c7", color: "#b45309" },
  "Sebagian": { bg: "#e0f2fe", color: "#0369a1" },
};

/* ============================================================
   COMPONENT
   ============================================================ */
export default function LaporanKeuanganPage() {
  const [bulan, setBulan] = useState("September 2026");
  const d = dataBulanan[bulan];
  const labaBersih = d.pendapatan - d.pengeluaran;
  const persenTarget = pct(d.pendapatan, d.target);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link href="/owner/laporan" style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Laporan</Link>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>/</span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>Keuangan</span>
          </div>
          <h1 className="page-title">Laporan Keuangan</h1>
          <p className="page-subtitle">Ringkasan pendapatan, pengeluaran, laba bersih, dan honor guru BSD After School Club.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select value={bulan} onChange={e => setBulan(e.target.value)}
            style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "9px 14px", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)", background: "white", cursor: "pointer" }}>
            {bulanOpsi.map(b => <option key={b}>{b}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => window.print()}>Cetak PDF</button>
        </div>
      </div>

      {/* Section A: KPI Utama */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Pendapatan", val: fmt(d.pendapatan), color: "#059669", sub: `${persenTarget}% dari target ${fmt(d.target)}`, progress: persenTarget },
          { label: "Total Pengeluaran", val: fmt(d.pengeluaran), color: "#dc2626", sub: `Termasuk honor guru ${fmt(d.honorTotal)}` },
          { label: "Laba Bersih", val: fmt(labaBersih), color: labaBersih > 0 ? "#1d4ed8" : "#dc2626", sub: labaBersih > 0 ? "Profit bulan ini" : "Rugi bulan ini" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 22, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{k.sub}</div>
            {k.progress !== undefined && (
              <div style={{ marginTop: 8, height: 5, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#059669", width: `${Math.min(k.progress, 100)}%`, borderRadius: 999, transition: "width 0.4s ease" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Target Pendapatan", val: fmt(d.target), color: "#7c3aed", sub: `${d.target > d.pendapatan ? "Kurang " + fmt(d.target - d.pendapatan) : "Target tercapai!"}` },
          { label: "Total Honor Guru", val: fmt(d.honorTotal), color: "#b45309", sub: `${d.honorGuru.length} guru aktif mengajar` },
          { label: "Metode Cash", val: fmt(d.cash), color: "#7c3aed", sub: `${pct(d.cash, d.pendapatan)}% dari total pendapatan` },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 20, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Section B: Ringkasan P&L */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 18px" }}>
          Ringkasan Profit &amp; Loss — {bulan}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Pendapatan Bruto", val: fmt(d.pendapatan), warna: "#059669", prefix: "+" },
            { label: "Total Pengeluaran Operasional", val: fmt(d.pengeluaran - d.honorTotal), warna: "#dc2626", prefix: "−", sub: "Tanpa honor guru" },
            { label: "Honor Guru", val: fmt(d.honorTotal), warna: "#dc2626", prefix: "−", sub: `${d.honorGuru.length} guru` },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "var(--color-bg)", borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{row.label}</div>
                {row.sub && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{row.sub}</div>}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: row.warna }}>{row.prefix} {row.val}</div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: labaBersih > 0 ? "#d1fae5" : "#fee2e2", borderRadius: 12, border: `2px solid ${labaBersih > 0 ? "#86efac" : "#fca5a5"}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: labaBersih > 0 ? "#15803d" : "#991b1b" }}>Laba Bersih</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: labaBersih > 0 ? "#15803d" : "#991b1b" }}>{fmt(labaBersih)}</div>
          </div>
        </div>
      </div>

      {/* Section C: Rincian Pendapatan per Program */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Rincian Pendapatan per Program</h2>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{bulan}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Program", "Siswa Aktif", "Nominal Pendapatan", "% dari Total", "Visual"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.rincianPendapatan.map((p, i) => (
              <tr key={i} style={{ borderBottom: i < d.rincianPendapatan.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>{p.program}</td>
                <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{p.siswa} siswa</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, color: "#059669" }}>{fmt(p.nominal)}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-primary)" }}>{pct(p.nominal, d.pendapatan)}%</td>
                <td style={{ padding: "14px 16px", minWidth: 140 }}>
                  <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--color-primary)", width: `${pct(p.nominal, d.pendapatan)}%`, borderRadius: 999, transition: "width 0.4s ease" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section D: Metode Pembayaran */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { label: "Digital (VA / QRIS / E-Wallet)", val: fmt(d.digital), p: pct(d.digital, d.pendapatan), color: "#1d4ed8", detail: "Virtual Account, QRIS, GoPay, ShopeePay" },
          { label: "Cash (Tunai)", val: fmt(d.cash), p: pct(d.cash, d.pendapatan), color: "#7c3aed", detail: "Pembayaran langsung di cabang" },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: 22 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: m.color, marginBottom: 6 }}>{m.val}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>{m.detail}</div>
            <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", background: m.color, width: `${m.p}%`, borderRadius: 999, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 8 }}>{m.p}% dari total pendapatan</div>
          </div>
        ))}
      </div>

      {/* Section E: Tabel Transaksi Terakhir */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Rincian Transaksi Terakhir</h2>
          <Link href="/admin/tagihan" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>Lihat Semua Tagihan &rarr;</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID Transaksi", "Tanggal", "Siswa", "Program", "Metode", "Nominal", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.transaksi.map((t, i) => {
              const st = warnaStatus[t.status] || { bg: "#f1f5f9", color: "#64748b" };
              return (
                <tr key={t.id} style={{ borderBottom: i < d.transaksi.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{t.id}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{t.tanggal}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>{t.siswa}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{t.program}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13 }}>{t.metode}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 800, fontSize: 13, color: "#059669" }}>{fmt(t.nominal)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{t.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section F: Laporan Honor Guru */}
      <div style={{ marginTop: 8, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", padding: "14px 20px", display: "flex", gap: 12, alignItems: "center" }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div style={{ fontSize: 13, color: "#92400e" }}>
          <strong>Informasi Eksklusif Owner:</strong> Data honor guru bersifat rahasia. Hanya Owner/Super Admin yang dapat melihat nominal honor dan tarif per jam.
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Honorarium Guru — {bulan}</h2>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>Berdasarkan jam mengajar × tarif per jam + bonus</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700 }}>Total Honor</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>{fmt(d.honorTotal)}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Guru", "Spesialisasi", "Jam Mengajar", "Tarif/Jam", "Bonus", "Total Honor", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.honorGuru.map((g, i) => {
              const total = g.jam * g.tarif + g.bonus;
              const st = warnaHonor[g.status];
              return (
                <tr key={i} style={{ borderBottom: i < d.honorGuru.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{g.nama[0]}</div>
                      <span style={{ fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{g.nama}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{g.spesialisasi}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{g.jam} jam</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{fmt(g.tarif)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: g.bonus > 0 ? "#059669" : "var(--color-text-muted)" }}>{g.bonus > 0 ? `+${fmt(g.bonus)}` : "–"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 900, color: "var(--color-primary)" }}>{fmt(total)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{g.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "16px 20px", background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>Total Pengeluaran Honor Guru</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#dc2626" }}>{fmt(d.honorTotal)}</span>
        </div>
      </div>
    </div>
  );
}
