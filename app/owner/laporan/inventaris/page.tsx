"use client";
import { useState } from "react";
import Link from "next/link";

const dataLaporanInventaris = [
  { id: "REP-INV-001", bulan: "Agustus 2026", totalBarang: 127, kondisiBaik: 120, perluPerbaikan: 7, totalNilaiAset: "Rp 18.500.000", pj: "Admin Operasional" },
  { id: "REP-INV-002", bulan: "Juli 2026", totalBarang: 125, kondisiBaik: 122, perluPerbaikan: 3, totalNilaiAset: "Rp 17.800.000", pj: "Admin Operasional" },
  { id: "REP-INV-003", bulan: "Juni 2026", totalBarang: 110, kondisiBaik: 108, perluPerbaikan: 2, totalNilaiAset: "Rp 15.200.000", pj: "Admin Operasional" },
];

export default function OwnerLaporanInventarisPage() {
  const [periode, setPeriode] = useState("Agustus 2026");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Inventaris & Aset (Owner)</h1>
          <p className="page-subtitle">Laporan bulanan/tahunan kondisi fasilitas, alat peraga, dan aset BSD After School Club.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => window.print()}>Cetak PDF Laporan</button>
          <Link href="/owner/inventaris" className="btn btn-accent">Ke Daftar Inventaris &rarr;</Link>
        </div>
      </div>

      {/* Grid Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Nilai Aset Kursus", value: "Rp 18.500.000", color: "#1d4ed8" },
          { label: "Total Item Barang", value: "127 Unit", color: "#0f172a" },
          { label: "Barang Kondisi Baik", value: "120 Unit (94%)", color: "#059669" },
          { label: "Perlu Perbaikan / Rusak", value: "7 Unit (6%)", color: "#b45309" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{s.label}</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabel Rekap Laporan per Bulan */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Arsip Laporan Inventaris Akhir Bulan</h3>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Diperbarui otomatis tiap akhir bulan</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["ID Laporan", "Periode Bulan", "Total Barang", "Kondisi Baik", "Perlu Perbaikan", "Total Nilai Aset", "Penanggung Jawab", "Aksi"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataLaporanInventaris.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: idx < dataLaporanInventaris.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{row.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{row.bulan}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700 }}>{row.totalBarang} Unit</td>
                <td style={{ padding: "14px 16px", color: "#059669", fontWeight: 700, fontSize: 13 }}>{row.kondisiBaik} Unit</td>
                <td style={{ padding: "14px 16px", color: "#b45309", fontWeight: 700, fontSize: 13 }}>{row.perluPerbaikan} Unit</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, color: "#1d4ed8", fontSize: 14 }}>{row.totalNilaiAset}</td>
                <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>{row.pj}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Unduh PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
