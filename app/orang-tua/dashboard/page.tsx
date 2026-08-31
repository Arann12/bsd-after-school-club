"use client";

import React, { useState } from "react";
import type { Metadata } from "next";

export default function OrangTuaDashboardPage() {
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashSubmitted, setCashSubmitted] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #12486b 0%, #1a5c8a 60%, #207398 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "24px 28px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 6px 18px rgba(26,92,138,0.25)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            Selamat Pagi, Ayah Budi!
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
            Budi hadir <strong style={{ color: "#ffffff", fontWeight: 700 }}>92%</strong> bulan ini dan memiliki{" "}
            <strong style={{ color: "#fbbf24", fontWeight: 700 }}>1 tagihan</strong> yang perlu dibayar sebelum 3 September.
          </p>
        </div>
        <div>
          <a
            href="#tagihan-aktif"
            className="btn btn-accent"
            style={{
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Bayar Sekarang
          </a>
        </div>
      </div>

      {/* ── 4 STAT CARDS ───────────────────────────────────────────── */}
      <div className="stat-grid">
        {/* Kehadiran Budi */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
              KEHADIRAN BUDI
            </span>
            <span className="badge badge-success" style={{ fontSize: 11, padding: "2px 8px" }}>
              +2%
            </span>
          </div>
          <div className="stat-card-value" style={{ fontSize: 30, color: "var(--color-text-primary)" }}>
            92%
          </div>
        </div>

        {/* Kelas Berikutnya */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
              KELAS BERIKUTNYA
            </span>
            <span className="badge badge-warning" style={{ fontSize: 11, padding: "2px 8px" }}>
              2 Jam lagi
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>
              Phonics L2
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Hari ini, 14:00
            </div>
          </div>
        </div>

        {/* Status Tagihan */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
              STATUS TAGIHAN
            </span>
            <span className="badge badge-danger" style={{ fontSize: 11, padding: "2px 8px" }}>
              Overdue
            </span>
          </div>
          <div className="stat-card-value" style={{ fontSize: 24, color: "#b91c1c" }}>
            Rp 350.000
          </div>
        </div>

        {/* Sisa Pertemuan */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
              SISA PERTEMUAN
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)" }}>
              40%
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)" }}>
              5<span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-muted)" }}>/12</span>
            </div>
            <div className="progress-bar-bg" style={{ height: 7 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(5 / 12) * 100}%`, background: "var(--color-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN MAIN GRID ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Student Profile Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              {/* Child Avatar */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #bfdbfe",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* Child Information */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    Budi Santoso
                  </h2>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>
                    Aktif
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
                  ID: #STD-88921
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: 12,
                    background: "var(--color-bg)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Sekolah</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      SDN 01 BSD
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Level Saat Ini</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)" }}>
                      Phonics L2
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Guru Pembimbing</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Ms. Sarah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal Kelas Minggu Ini */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Jadwal Kelas Minggu Ini</h2>
              <button className="more-btn" aria-label="Menu jadwal">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Schedule Item 1: Selesai */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--color-text-muted)" }}>SEN</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>26</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Phonics L2
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      14:00 - 15:30
                    </div>
                  </div>
                </div>
                <span className="badge badge-success">
                  Selesai
                </span>
              </div>

              {/* Schedule Item 2: Berlangsung */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid #f59e0b",
                  background: "#fffbeb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "var(--radius-md)",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#b45309" }}>RAB</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#92400e" }}>28</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Phonics L2
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      14:00 - 15:30
                    </div>
                  </div>
                </div>
                <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b45309" }} />
                  Berlangsung
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Pembayaran */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Riwayat Pembayaran</h2>
            </div>
            <div className="card-body" style={{ paddingTop: 0, overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TANGGAL</th>
                    <th>JUMLAH</th>
                    <th>METODE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tanggal: "01 Ags 2024", jumlah: "Rp 350.000", metode: "Virtual Account", status: "Selesai" },
                    { tanggal: "03 Jul 2024", jumlah: "Rp 350.000", metode: "Cash", status: "Selesai" },
                  ].map((pay) => (
                    <tr key={pay.tanggal}>
                      <td style={{ fontWeight: 600 }}>{pay.tanggal}</td>
                      <td style={{ fontWeight: 700 }}>{pay.jumlah}</td>
                      <td style={{ color: "var(--color-text-secondary)" }}>{pay.metode}</td>
                      <td>
                        <span className="badge badge-success">{pay.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Tagihan Aktif Card */}
          <div className="card" id="tagihan-aktif" style={{ border: "1.5px solid #fee2e2" }}>
            <div className="card-header" style={{ paddingBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--color-text-primary)" }}>
                  Tagihan Aktif
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                  #INV/2024/08/001
                </div>
              </div>
            </div>
            <div className="card-body" style={{ paddingTop: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Pink Highlight Invoice Box */}
              <div
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 12, color: "#9f1239", fontWeight: 600 }}>
                  Total Tagihan
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#be123c", lineHeight: 1 }}>
                  Rp 350.000
                </div>
                <div style={{ fontSize: 12, color: "#e11d48", fontWeight: 600, marginTop: 4 }}>
                  Jatuh Tempo: <span style={{ fontWeight: 700 }}>3 Sept 2024</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                className="btn btn-accent"
                style={{ width: "100%", justifyContent: "center", padding: "11px", fontWeight: 700 }}
                onClick={() => alert("Mengarahkan ke gateway pembayaran...")}
              >
                Bayar Sekarang
              </button>

              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", padding: "10px", fontWeight: 600 }}
                onClick={() => setCashModalOpen(true)}
              >
                Ajukan Pembayaran Cash
              </button>
            </div>
          </div>

          {/* Riwayat Kehadiran (Bulan Ini) */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Riwayat Kehadiran (Bulan Ini)</h2>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Calendar Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>
                  <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                </div>
                {/* Week 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#10b981" }} title="Hadir" />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                </div>
                {/* Week 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                  <div style={{ height: 26, borderRadius: 4, background: "#10b981" }} title="Hadir" />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#10b981" }} title="Hadir" />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                </div>
                {/* Week 3 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                  <div style={{ height: 26, borderRadius: 4, background: "#f59e0b" }} title="Izin" />
                  <div style={{ height: 26, borderRadius: 4, background: "#f1f5f9" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#fde047", border: "2px dashed #ca8a04" }} title="Hari Ini" />
                  <div style={{ height: 26, borderRadius: 4, background: "#f8fafc" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f8fafc" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f8fafc" }} />
                  <div style={{ height: 26, borderRadius: 4, background: "#f8fafc" }} />
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontSize: 11.5, color: "var(--color-text-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} />
                  Hadir
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />
                  Izin
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444" }} />
                  Alpha
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM 3-CARD ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* Card 1: Sertifikat & Laporan */}
        <div
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#f1f5f9",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              marginBottom: 12,
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
            Sertifikat & Laporan
          </h3>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
            Budi telah menyelesaikan 5/12 pertemuan menuju kelulusan.
          </p>
        </div>

        {/* Card 2: Pengumuman Preview */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ paddingBottom: 10 }}>
            <h2 className="card-title">Pengumuman</h2>
          </div>
          <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                position: "relative",
                height: 110,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                padding: "12px 14px",
                color: "white",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at top right, rgba(245,158,11,0.4), transparent 60%)",
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span className="badge badge-warning" style={{ fontSize: 9.5, padding: "1px 6px", marginBottom: 4 }}>
                  Kegiatan
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>
                  Lomba Mewarnai Kemerdekaan
                </div>
              </div>
            </div>
            {/* Carousel Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-primary)" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1" }} />
            </div>
          </div>
        </div>

        {/* Card 3: Butuh Bantuan? */}
        <div className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 4 }}>
              Butuh Bantuan?
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", lineHeight: 1.4, marginBottom: 14 }}>
              Tim admin kami siap membantu Anda selama jam kerja.
            </p>
          </div>
          <div>
            <button
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center", padding: "8px 12px", fontSize: 13, fontWeight: 600, marginBottom: 8 }}
              onClick={() => alert("Menghubungi admin BSD After School Club...")}
            >
              Hubungi Admin
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 11.5, color: "var(--color-primary)", fontWeight: 600 }}>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>FAQ</a>
              <span>•</span>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>Panduan</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: AJUKAN PEMBAYARAN CASH ── */}
      {cashModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-lg)",
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: "var(--color-text-primary)" }}>
              Ajukan Pembayaran Cash
            </h3>
            {cashSubmitted ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Pengajuan Berhasil Dikirim!
                </h4>
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 16 }}>
                  Status pembayaran Anda kini <strong>Menunggu Verifikasi Admin</strong>. Silakan serahkan uang tunai ke meja resepsionis/admin.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setCashModalOpen(false);
                    setCashSubmitted(false);
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 14, lineHeight: 1.4 }}>
                  Setelah mengajukan, silakan bayar secara tunai ke Admin di center BSD After School Club. Admin akan memverifikasi pembayaran Anda.
                </p>
                <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Tagihan</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    #INV/2024/08/001 — Phonics L2
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)", marginTop: 4 }}>
                    Rp 350.000
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setCashModalOpen(false)}>
                    Batal
                  </button>
                  <button className="btn btn-accent" onClick={() => setCashSubmitted(true)}>
                    Konfirmasi Pengajuan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
