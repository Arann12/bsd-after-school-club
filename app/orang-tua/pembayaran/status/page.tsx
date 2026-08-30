"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";

function StatusContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "INV-2024-0803";
  const method = searchParams.get("method") || "va";
  const mode = searchParams.get("mode") || "pertemuan";
  const status = searchParams.get("status") || "success";

  const isSuccess = status === "success";
  const isCash = method === "cash";
  const amount = mode === "pertemuan" ? 100000 : 300000;

  const methodName = 
    method === "va" ? "Virtual Account BCA" :
    method === "ewallet" ? "E-Wallet (GoPay)" :
    method === "qris" ? "QRIS Standar Nasional" :
    "Cash (Tunai di Cabang)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 840, margin: "0 auto", width: "100%" }}>
      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
        <Link href="/orang-tua/pembayaran" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Pembayaran
        </Link>
        <span>/</span>
        <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Status & Bukti Transaksi</span>
      </div>

      {/* ── STATUS HERO CARD ──────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          background: isSuccess
            ? "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)"
            : "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
          border: isSuccess ? "1.5px solid #a7f3d0" : "1.5px solid #fde68a",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isSuccess ? "#10b981" : "#f59e0b",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            boxShadow: isSuccess ? "0 6px 16px rgba(16,185,129,0.3)" : "0 6px 16px rgba(245,158,11,0.3)",
            marginBottom: 14,
          }}
        >
          {isSuccess ? "✓" : "⏳"}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text-primary)", marginBottom: 6 }}>
          {isSuccess ? "Pembayaran Berhasil Diverifikasi!" : "Menunggu Verifikasi Admin"}
        </h1>

        <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", maxWidth: 480, lineHeight: 1.5 }}>
          {isSuccess
            ? "Terima kasih, pembayaran Anda telah diterima oleh sistem dan sesi pembelajaran anak telah aktif."
            : "Pengajuan pembayaran cash Anda telah tercatat. Silakan serahkan uang tunai ke petugas admin di cabang."}
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <span className={`badge ${isSuccess ? "badge-success" : "badge-warning"}`} style={{ fontSize: 12, padding: "4px 12px" }}>
            {isSuccess ? "STATUS: LUNAS" : "STATUS: MENUNGGU VERIFIKASI"}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: 12, padding: "4px 12px", fontFamily: "monospace" }}>
            #{id}
          </span>
        </div>
      </div>

      {/* ── INVOICE RECEIPT CARD ──────────────────────────────────── */}
      <div className="card" style={{ padding: "28px 32px", boxShadow: "var(--shadow-md)" }}>
        {/* Receipt Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1.5px dashed var(--color-border)",
            paddingBottom: 20,
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Logo subtitle="Tanda Terima Resmi" size={40} />
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 8 }}>
              BSD City, Tangerang Selatan, Banten
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)" }}>NO. TRANSAKSI</div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "monospace", color: "var(--color-text-primary)" }}>
              #{id}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
              29 Agustus 2024, 00:55 WIB
            </div>
          </div>
        </div>

        {/* Client & Student Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            background: "var(--color-bg)",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Siswa</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>Merta</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>ID: #STD-88921</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Orang Tua / Wali</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>Ayah Budi</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>081234567890</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Program Belajar</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-primary)" }}>Phonics Level 2</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Guru: Ms. Sarah</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Metode Pembayaran</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{methodName}</div>
            <div style={{ fontSize: 11.5, color: isSuccess ? "#059669" : "#d97706", fontWeight: 600 }}>
              {isSuccess ? "Terverifikasi Otomatis" : "Verifikasi Manual"}
            </div>
          </div>
        </div>

        {/* Item Table */}
        <table className="data-table" style={{ marginBottom: 20 }}>
          <thead>
            <tr>
              <th>DESKRIPSI SESI</th>
              <th style={{ textAlign: "center" }}>JUMLAH SESI</th>
              <th style={{ textAlign: "right" }}>TARIF</th>
              <th style={{ textAlign: "right" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {mode === "pertemuan" ? (
              <>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700 }}>Pertemuan 7 — Phonics Level 2</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Jadwal: 2 Sept 2024 (14:00 - 15:30)</div>
                  </td>
                  <td style={{ textAlign: "center" }}>1 Sesi</td>
                  <td style={{ textAlign: "right" }}>Rp 50.000</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>Rp 50.000</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 700 }}>Pertemuan 8 — Phonics Level 2</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Jadwal: 4 Sept 2024 (14:00 - 15:30)</div>
                  </td>
                  <td style={{ textAlign: "center" }}>1 Sesi</td>
                  <td style={{ textAlign: "right" }}>Rp 50.000</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>Rp 50.000</td>
                </tr>
              </>
            ) : (
              <tr>
                <td>
                  <div style={{ fontWeight: 700 }}>Pelunasan Sisa Paket (Pertemuan 7 - 12)</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Paket 12 Pertemuan Phonics Level 2</div>
                </td>
                <td style={{ textAlign: "center" }}>6 Sesi</td>
                <td style={{ textAlign: "right" }}>Rp 50.000</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>Rp 300.000</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Cost Summary Breakdown */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)" }}>
              <span>Subtotal Tagihan</span>
              <span style={{ fontWeight: 600 }}>Rp {amount.toLocaleString("id-ID")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)" }}>
              <span>Biaya Layanan Gateway</span>
              <span style={{ fontWeight: 600, color: "#10b981" }}>Gratis (Rp 0)</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px solid var(--color-border)",
                paddingTop: 10,
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>Total Pembayaran</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)" }}>
                Rp {amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, borderTop: "1px solid var(--color-border-light)", paddingTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn btn-outline"
            onClick={() => window.print()}
            style={{ flex: 1, justifyContent: "center", minWidth: 160 }}
          >
            🖨️ Cetak Bukti / Unduh PDF
          </button>
          <Link
            href="/orang-tua/dashboard"
            className="btn btn-primary"
            style={{ flex: 1.2, justifyContent: "center", textDecoration: "none", minWidth: 180 }}
          >
            📅 Lihat Jadwal Kelas Budi
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StatusPembayaranPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Memuat status transaksi...</div>}>
      <StatusContent />
    </Suspense>
  );
}
