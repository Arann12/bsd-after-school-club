"use client";
import { useState } from "react";

export default function OrangTuaProgressPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress & Laporan Perkembangan Anak</h1>
          <p className="page-subtitle">Pencapaian indikator konkret kemampuan membaca, berhitung, dan perkembangan belajar anak.</p>
        </div>
      </div>

      {/* Card Info Anak */}
      <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
          👦
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Siswa: Andi Setiawan</div>
          <div style={{ fontSize: 12.5, opacity: 0.9 }}>Program: Calistung Level 1 & Phonics Starter</div>
        </div>
      </div>

      {/* Progress Cards per Program */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>CALISTUNG LEVEL 1</span>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>Guru: Ms. Sarah</h3>
            </div>
            <span style={{ background: "#d1fae5", color: "#059669", fontSize: 16, fontWeight: 900, padding: "4px 12px", borderRadius: 999 }}>
              88 / 100
            </span>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Pencapaian Indikator Belajar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>✓ Mengenal Abjad Vokal & Konsonan A–N</div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>✓ Menulis Angka 1–20</div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>✓ Membaca Suku Kata BA-BI-BU</div>
            </div>
          </div>

          <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Catatan Guru untuk Orang Tua</div>
            <p style={{ fontSize: 12.5, color: "var(--color-text-primary)", margin: "4px 0 0", lineHeight: 1.5 }}>
              "Andi sangat aktif membaca abjad A-G. Latihan menulis huruf b dan d perlu diulangi sedikit di rumah."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
