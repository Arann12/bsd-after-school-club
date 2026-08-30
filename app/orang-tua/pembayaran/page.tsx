"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrangTuaPembayaranPage() {
  const router = useRouter();

  // Payment Mode: 'pertemuan' (Rp 100k) or 'paket' (Rp 300k)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"pertemuan" | "paket">("pertemuan");
  
  // Modal Workflow State: null (closed), 'select_method', 'pay_details', 'waiting_confirmation'
  const [modalStep, setModalStep] = useState<null | "select_method" | "pay_details" | "waiting_confirmation">(null);
  
  // Selected Payment Method: 'va' | 'ewallet' | 'qris' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState<"va" | "ewallet" | "qris" | "cash">("va");
  
  // Specific Sub-options:
  const [selectedBank, setSelectedBank] = useState<"BCA" | "BNI" | "Mandiri" | "BRI">("BCA");
  const [selectedEwallet, setSelectedEwallet] = useState<"GoPay" | "OVO" | "Dana" | "ShopeePay">("GoPay");
  const [phoneNumber, setPhoneNumber] = useState("081234567890");
  
  // Copy to clipboard notification state
  const [copied, setCopied] = useState<string | null>(null);
  
  // Accordion state for Cara Pembayaran
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Dynamic values depending on mode
  const billAmount = selectedPaymentMode === "pertemuan" ? 100000 : 300000;
  const billLabel = selectedPaymentMode === "pertemuan" ? "Pertemuan 7 & 8" : "Sisa Pertemuan 7 - 12 (Paket)";
  const billBreakdown = selectedPaymentMode === "pertemuan" 
    ? [
        { label: "Pertemuan 7", amount: "Rp 50.000" },
        { label: "Pertemuan 8", amount: "Rp 50.000" },
      ]
    : [
        { label: "Sisa Pertemuan (7-12)", amount: "6 x Rp 50.000" },
      ];

  const handleOpenPayment = (mode: "pertemuan" | "paket") => {
    setSelectedPaymentMode(mode);
    setModalStep("select_method");
    setCopied(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCheckStatus = () => {
    const invoiceId = "INV-2024-0803";
    const statusQuery = paymentMethod === "cash" ? "pending" : "success";
    router.push(`/orang-tua/pembayaran/status?id=${invoiceId}&method=${paymentMethod}&mode=${selectedPaymentMode}&status=${statusQuery}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── PAGE HEADER & CHILD SELECTOR ─────────────────────────── */}
      <div className="page-header" style={{ alignItems: "center" }}>
        <div>
          <h1 className="page-title">Pembayaran</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", fontWeight: 500 }}>
              Anak yang Dipilih:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>👦</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Merta
              </span>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── TOP 3 STAT CARDS ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {/* Total Tagihan Tertunda */}
        <div className="stat-card">
          <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            TOTAL TAGIHAN TERTUNDA
          </span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#ef4444" }}>
            Rp 150.000
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            1 Tagihan belum dibayar
          </div>
        </div>

        {/* Progress Pertemuan */}
        <div className="stat-card">
          <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            PROGRESS PERTEMUAN
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="stat-card-value" style={{ fontSize: 26 }}>
              6<span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-muted)" }}>/12</span>
            </div>
            <div className="progress-bar-bg" style={{ height: 7 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(6 / 12) * 100}%`, background: "var(--color-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Status Pembayaran Terakhir */}
        <div className="stat-card">
          <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            STATUS PEMBAYARAN TERAKHIR
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontWeight: 800, fontSize: 16 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Berhasil
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              25 Ags 2024
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE 2-COLUMN SECTION ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 22 }}>
        {/* ── LEFT COLUMN: Detail Program & Timeline ─────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Detail Program Card */}
          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>Detail Program</h2>
              <span className="badge badge-info" style={{ fontSize: 10.5, padding: "2px 8px" }}>
                Aktif
              </span>
            </div>

            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 2 }}>
              Program
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>
              Phonics Level 2
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--color-border-light)", paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Harga per Pertemuan</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 2 }}>
                  Rp 50.000
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Total Pertemuan Paket</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 2 }}>
                  12 Pertemuan
                </div>
              </div>
            </div>
          </div>

          {/* Progress Pertemuan (Paket Aktif) Stepper */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 14 }}>
              <h2 className="card-title">Progress Pertemuan (Paket Aktif)</h2>
            </div>
            <div className="card-body" style={{ paddingTop: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Item 1: Pertemuan 1 - 5 (Lunas) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#d1fae5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    Pertemuan 1 - 5
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Selesai • Lunas
                  </div>
                </div>
              </div>

              {/* Item 2: Pertemuan 6 (Hari Ini - Lunas) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Pertemuan 6
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      Hari ini • Phonics Review
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>
                    LUNAS
                  </span>
                </div>
              </div>

              {/* Item 3: Pertemuan 7 (Belum Dibayar) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  !
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Pertemuan 7
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      2 Sept 2024
                    </div>
                  </div>
                  <span className="badge badge-danger" style={{ fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>
                    BELUM DIBAYAR
                  </span>
                </div>
              </div>

              {/* Item 4: Pertemuan 8 (Belum Dibayar) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  !
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Pertemuan 8
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                      4 Sept 2024
                    </div>
                  </div>
                  <span className="badge badge-danger" style={{ fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>
                    BELUM DIBAYAR
                  </span>
                </div>
              </div>

              {/* Item 5: Pertemuan 9 - 12 (Mendatang) */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, opacity: 0.6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#f1f5f9",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#cbd5e1" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    Pertemuan 9 - 12
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Jadwal mendatang
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Tindakan Pembayaran (Option 1 & Option 2) ─ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>
            Tindakan Pembayaran
          </h2>

          {/* OPSI 1: Bayar per Pertemuan (Light Border + Yellow accent) */}
          <div
            className="card"
            style={{
              border: "1.5px solid #fde68a",
              boxShadow: "0 4px 14px rgba(245,158,11,0.08)",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>
                  Bayar per Pertemuan
                </h3>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Bayar untuk pertemuan yang sudah berjalan atau akan datang.
                </p>
              </div>
              <span className="badge badge-danger" style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px" }}>
                2 Belum Dibayar
              </span>
            </div>

            {/* List breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--color-border-light)", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Pertemuan 7</span>
                <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Rp 50.000</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Pertemuan 8</span>
                <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Rp 50.000</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px dashed var(--color-border)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Total Dibayar</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#be123c" }}>Rp 100.000</span>
              </div>
            </div>

            {/* Button */}
            <button
              className="btn btn-accent"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "11px",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: "var(--radius-md)",
              }}
              onClick={() => handleOpenPayment("pertemuan")}
            >
              💳 Bayar Pertemuan (Rp 100k)
            </button>
          </div>

          {/* OPSI 2: Lunasi Sisa Paket (Dark Blue Gradient Box) */}
          <div
            style={{
              background: "linear-gradient(135deg, #103b57 0%, #1a5c8a 100%)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 22px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 6px 18px rgba(26,92,138,0.2)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                <span style={{ color: "#fbbf24" }}>✪</span> Lunasi Sisa Paket
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                Bayar semua sisa pertemuan di paket ini sekaligus.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                <span>Sisa Pertemuan (7-12)</span>
                <span style={{ fontWeight: 700 }}>6 x Rp 50.000</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  paddingTop: 10,
                }}
              >
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Total Pelunasan</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#ffffff" }}>Rp 300.000</span>
              </div>
            </div>

            {/* White Button */}
            <button
              style={{
                width: "100%",
                background: "#ffffff",
                color: "#1a5c8a",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "all 0.15s ease",
              }}
              onClick={() => handleOpenPayment("paket")}
            >
              Lunasi Paket Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: Riwayat Pembayaran Table ───────────────── */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: 14 }}>
          <h2 className="card-title">Riwayat Pembayaran</h2>
          <button
            className="link-text"
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onClick={() => alert("Mengunduh laporan pembayaran PDF...")}
          >
            Unduh Laporan 📥
          </button>
        </div>
        <div className="card-body" style={{ paddingTop: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID TRANSAKSI</th>
                <th>TANGGAL</th>
                <th>KETERANGAN</th>
                <th>METODE</th>
                <th>JUMLAH</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "INV-08-002",
                  tanggal: "25 Ags 2024",
                  keterangan: "Pertemuan 6",
                  metode: "Cash (Di Cabang)",
                  jumlah: "Rp 50.000",
                  status: "Menunggu Verifikasi Admin",
                  isPending: true,
                  mode: "pertemuan",
                },
                {
                  id: "INV-08-001",
                  tanggal: "15 Ags 2024",
                  keterangan: "Pertemuan 1 - 5 (Paket)",
                  metode: "Virtual Account BCA",
                  jumlah: "Rp 250.000",
                  status: "Selesai",
                  isPending: false,
                  mode: "paket",
                },
                {
                  id: "INV-07-015",
                  tanggal: "01 Jul 2024",
                  keterangan: "Biaya Pendaftaran & Seragam",
                  metode: "QRIS",
                  jumlah: "Rp 150.000",
                  status: "Selesai",
                  isPending: false,
                  mode: "paket",
                },
              ].map((row) => (
                <tr key={row.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 600 }}>#{row.id}</td>
                  <td>{row.tanggal}</td>
                  <td style={{ fontWeight: 600 }}>{row.keterangan}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{row.metode}</td>
                  <td style={{ fontWeight: 700 }}>{row.jumlah}</td>
                  <td>
                    {row.isPending ? (
                      <span className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        ⏳ {row.status}
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        ✓ {row.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/orang-tua/pembayaran/status?id=${row.id}&method=${row.metode.toLowerCase().includes('cash') ? 'cash' : 'va'}&status=${row.isPending ? 'pending' : 'success'}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      Lihat Bukti →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── KEBIJAKAN PEMBAYARAN & KEHADIRAN ───────────────────────── */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#dbeafe",
            color: "#1d4ed8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ℹ
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 8 }}>
            Kebijakan Pembayaran & Kehadiran
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>Pembayaran tagihan maksimal dilakukan <strong>sebelum pertemuan dimulai</strong>.</li>
            <li>Pertemuan yang jatuh pada hari libur nasional (tanggal merah) <strong>tidak dikenakan biaya</strong> dan jadwal akan digeser ke pertemuan berikutnya.</li>
            <li>Jika anak izin (dengan pemberitahuan maksimal <strong>H-1</strong>), pertemuan dapat di-reschedule tanpa biaya tambahan (maksimal 2x per bulan).</li>
            <li>Pembayaran secara cash (tunai) di cabang wajib memberikan bukti struk kepada Admin untuk diverifikasi pada sistem.</li>
          </ul>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ── MULTI-STEP PAYMENT MODAL ──────────────────────────────── */}
      {/* ============================================================ */}
      {modalStep !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "var(--radius-lg)",
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* ── STEP 1: PILIH METODE PEMBAYARAN ─────────────────────── */}
            {modalStep === "select_method" && (
              <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    Pilih Metode Pembayaran
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: -8 }}>
                  Pilih metode pembayaran untuk melunasi tagihan pertemuan yang dipilih.
                </p>

                {/* Ringkasan Tagihan Box */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                    RINGKASAN TAGIHAN
                  </div>
                  {billBreakdown.map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{item.amount}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: 10,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 19, fontWeight: 900, color: "var(--color-primary)" }}>
                      Rp {billAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Radio Payment Methods */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Virtual Account */}
                  <label
                    onClick={() => setPaymentMethod("va")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "va" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "va" ? "#f0f7ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          background: "#e0f2fe",
                          color: "var(--color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🏛️
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                          Virtual Account
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                          Bayar melalui nomor Virtual Account
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: paymentMethod === "va" ? "5px solid var(--color-primary)" : "2px solid #cbd5e1",
                        background: "#ffffff",
                      }}
                    />
                  </label>

                  {/* E-Wallet */}
                  <label
                    onClick={() => setPaymentMethod("ewallet")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "ewallet" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "ewallet" ? "#f0f7ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          background: "#fef3c7",
                          color: "#d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        📱
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                          E-Wallet
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                          Bayar menggunakan dompet digital (GoPay, OVO, Dana, ShopeePay)
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: paymentMethod === "ewallet" ? "5px solid var(--color-primary)" : "2px solid #cbd5e1",
                        background: "#ffffff",
                      }}
                    />
                  </label>

                  {/* QRIS */}
                  <label
                    onClick={() => setPaymentMethod("qris")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "qris" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "qris" ? "#f0f7ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          background: "#dcfce7",
                          color: "#15803d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🔲
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                          QRIS
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                          Scan QRIS menggunakan semua aplikasi pembayaran
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: paymentMethod === "qris" ? "5px solid var(--color-primary)" : "2px solid #cbd5e1",
                        background: "#ffffff",
                      }}
                    />
                  </label>

                  {/* Cash */}
                  <label
                    onClick={() => setPaymentMethod("cash")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: paymentMethod === "cash" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: paymentMethod === "cash" ? "#f0f7ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-md)",
                          background: "#ede9fe",
                          color: "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        💵
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                          Cash
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                          Pembayaran tunai melalui Admin atau Cabang
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: paymentMethod === "cash" ? "5px solid var(--color-primary)" : "2px solid #cbd5e1",
                        background: "#ffffff",
                      }}
                    />
                  </label>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, justifyContent: "center", padding: "11px", fontWeight: 600 }}
                    onClick={() => setModalStep(null)}
                  >
                    Batal
                  </button>
                  <button
                    className="btn btn-accent"
                    style={{ flex: 1.5, justifyContent: "center", padding: "11px", fontWeight: 700 }}
                    onClick={() => setModalStep("pay_details")}
                  >
                    Lanjutkan Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: DETAIL PEMBAYARAN SESUAI METODE ────────────── */}
            {modalStep === "pay_details" && (
              <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "85vh", overflowY: "auto" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    {paymentMethod === "va" && "Pembayaran Virtual Account"}
                    {paymentMethod === "ewallet" && "Pembayaran E-Wallet"}
                    {paymentMethod === "qris" && "Pembayaran QRIS"}
                    {paymentMethod === "cash" && "Pembayaran Cash (Tunai di Cabang)"}
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: -8 }}>
                  {paymentMethod === "va" && "Silakan selesaikan pembayaran menggunakan Virtual Account sebelum batas waktu."}
                  {paymentMethod === "ewallet" && "Pilih dompet digital Anda dan lakukan konfirmasi pembayaran."}
                  {paymentMethod === "qris" && "Buka aplikasi pembayaran dan scan kode QR di bawah."}
                  {paymentMethod === "cash" && "Tunjukkan kode referensi pembayaran ini kepada Admin di cabang."}
                </p>

                {/* Ringkasan Pembayaran Box */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                    RINGKASAN PEMBAYARAN
                  </div>
                  {billBreakdown.map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{item.amount}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: 10,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 19, fontWeight: 900, color: "var(--color-primary)" }}>
                      Rp {billAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* 1. VIRTUAL ACCOUNT VIEW */}
                {paymentMethod === "va" && (
                  <>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                        PILIH BANK
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                        {(["BCA", "BNI", "Mandiri", "BRI"] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setSelectedBank(b)}
                            style={{
                              padding: "10px",
                              borderRadius: "var(--radius-md)",
                              border: selectedBank === b ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                              background: selectedBank === b ? "#ffffff" : "#f8fafc",
                              fontWeight: selectedBank === b ? 800 : 600,
                              color: selectedBank === b ? "var(--color-primary)" : "var(--color-text-primary)",
                              cursor: "pointer",
                              fontSize: 13.5,
                              boxShadow: selectedBank === b ? "0 1px 4px rgba(26,92,138,0.15)" : "none",
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f0f7ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
                        NOMOR VIRTUAL ACCOUNT {selectedBank}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: "var(--color-primary)", letterSpacing: "1px" }}>
                          1234 5678 9012 3456
                        </span>
                        <button
                          onClick={() => handleCopy("1234567890123456", "va")}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #bfdbfe",
                            borderRadius: 6,
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--color-primary)",
                          }}
                        >
                          📋 {copied === "va" ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 2 }}>
                        Total: Rp {billAmount.toLocaleString("id-ID")}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#be123c", fontWeight: 600 }}>
                        Bayar sebelum 27 Agustus 2024, 23:59
                      </div>
                    </div>
                  </>
                )}

                {/* 2. E-WALLET VIEW */}
                {paymentMethod === "ewallet" && (
                  <>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                        PILIH E-WALLET
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                        {(["GoPay", "OVO", "Dana", "ShopeePay"] as const).map((ew) => (
                          <button
                            key={ew}
                            onClick={() => setSelectedEwallet(ew)}
                            style={{
                              padding: "10px",
                              borderRadius: "var(--radius-md)",
                              border: selectedEwallet === ew ? "2px solid #f59e0b" : "1px solid var(--color-border)",
                              background: selectedEwallet === ew ? "#fffbeb" : "#f8fafc",
                              fontWeight: selectedEwallet === ew ? 800 : 600,
                              color: selectedEwallet === ew ? "#b45309" : "var(--color-text-primary)",
                              cursor: "pointer",
                              fontSize: 13.5,
                            }}
                          >
                            {ew}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: "var(--radius-md)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>
                        Nomor Handphone Terdaftar di {selectedEwallet}:
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="search-input"
                          style={{ padding: "8px 12px", borderRadius: "var(--radius-md)" }}
                        />
                        <button
                          className="btn btn-accent"
                          style={{ padding: "8px 14px", fontSize: 12.5 }}
                          onClick={() => alert(`Notifikasi pembayaran dikirim ke aplikasi ${selectedEwallet}!`)}
                        >
                          Buka {selectedEwallet}
                        </button>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#b45309" }}>
                        Pastikan saldo {selectedEwallet} Anda mencukupi (Min. Rp {billAmount.toLocaleString("id-ID")}).
                      </div>
                    </div>
                  </>
                )}

                {/* 3. QRIS VIEW */}
                {paymentMethod === "qris" && (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px 16px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary)" }}>
                      BSD AFTER SCHOOL CLUB (NMID: ID1029384756)
                    </div>
                    
                    {/* SVG Vector QR Code */}
                    <div
                      style={{
                        width: 170,
                        height: 170,
                        background: "#ffffff",
                        border: "2px solid var(--color-border)",
                        borderRadius: 12,
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <svg width={130} height={130} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="2" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="2" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="16" y="4" width="4" height="4" fill="#ffffff" />
                        <rect x="2" y="14" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="4" y="16" width="4" height="4" fill="#ffffff" />
                        <rect x="14" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="19" y="14" width="3" height="3" fill="#1e293b" />
                        <rect x="14" y="19" width="3" height="3" fill="#1e293b" />
                        <rect x="19" y="19" width="3" height="3" fill="#1e293b" />
                        <rect x="11" y="7" width="2" height="2" fill="#1e293b" />
                        <rect x="7" y="11" width="2" height="2" fill="#1e293b" />
                        <rect x="11" y="11" width="2" height="2" fill="#1e293b" />
                        <rect x="15" y="11" width="2" height="2" fill="#1e293b" />
                        <rect x="11" y="15" width="2" height="2" fill="#1e293b" />
                      </svg>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "1px" }}>
                        QRIS STANDAR NASIONAL
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCopy("ID1029384756", "qris")}
                      >
                        {copied === "qris" ? "NMID Tersalin!" : "Salin NMID"}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => alert("Mengunduh gambar QRIS...")}
                      >
                        Unduh QR 📥
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. CASH VIEW */}
                {paymentMethod === "cash" && (
                  <div
                    style={{
                      background: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      borderRadius: "var(--radius-md)",
                      padding: "18px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 24 }}>🏢</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#6b21a8" }}>
                          Kode Booking Pembayaran Tunai
                        </div>
                        <div style={{ fontSize: 11.5, color: "#7c3aed" }}>
                          Tunjukkan ke Admin / Resepsionis BSD After School Club
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#ffffff",
                        border: "1.5px dashed #8b5cf6",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", fontWeight: 700 }}>
                          KODE REFERENSI
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#6b21a8", letterSpacing: "1px" }}>
                          CASH-88921-08
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy("CASH-88921-08", "cash")}
                        style={{
                          background: "#f5f3ff",
                          border: "1px solid #c4b5fd",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#6b21a8",
                        }}
                      >
                        {copied === "cash" ? "Tersalin!" : "Salin Kode"}
                      </button>
                    </div>

                    <div style={{ fontSize: 12, color: "#581c87", lineHeight: 1.4 }}>
                      📍 <strong>Lokasi Pembayaran:</strong> Front Office BSD After School Club (Senin - Sabtu, 08.00 - 17.00 WIB). Admin akan memverifikasi pembayaran Anda setelah uang tunai diterima.
                    </div>
                  </div>
                )}

                {/* Notice Box */}
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  <span style={{ fontSize: 16 }}>ℹ</span>
                  <span>Pastikan nominal pembayaran sesuai agar pembayaran dapat terverifikasi secara otomatis.</span>
                </div>

                {/* Accordion Cara Pembayaran */}
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "#ffffff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <span>Cara Pembayaran</span>
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{
                        transform: accordionOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {accordionOpen && (
                    <div style={{ padding: "12px 16px", background: "var(--color-bg)", fontSize: 12.5, color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border-light)" }}>
                      {paymentMethod === "va" && (
                        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                          <li>Buka aplikasi Mobile Banking atau ATM {selectedBank}.</li>
                          <li>Pilih menu <strong>Transfer / Pembayaran</strong> &gt; <strong>Virtual Account</strong>.</li>
                          <li>Masukkan nomor Virtual Account: <strong>1234 5678 9012 3456</strong>.</li>
                          <li>Periksa rincian tagihan (Rp {billAmount.toLocaleString("id-ID")}) lalu konfirmasi PIN.</li>
                          <li>Simpan bukti pembayaran dan klik tombol di bawah.</li>
                        </ol>
                      )}
                      {paymentMethod === "ewallet" && (
                        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                          <li>Buka aplikasi <strong>{selectedEwallet}</strong> di smartphone Anda.</li>
                          <li>Buka notifikasi tagihan atau konfirmasi pembayaran masuk dari BSD After School Club.</li>
                          <li>Pastikan nominal sebesar <strong>Rp {billAmount.toLocaleString("id-ID")}</strong>.</li>
                          <li>Masukkan PIN {selectedEwallet} untuk menyelesaikan transaksi.</li>
                        </ol>
                      )}
                      {paymentMethod === "qris" && (
                        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                          <li>Buka aplikasi dompet digital atau m-banking apa saja yang memiliki fitur QRIS.</li>
                          <li>Pilih menu <strong>Scan QR</strong>.</li>
                          <li>Arahkan kamera ke kode QR di atas atau unggah gambar QR.</li>
                          <li>Periksa nama penerima <strong>BSD After School Club</strong> dan nominal, lalu bayar.</li>
                        </ol>
                      )}
                      {paymentMethod === "cash" && (
                        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                          <li>Kunjungi kantor cabang BSD After School Club.</li>
                          <li>Temui petugas Admin / Resepsionis dan sebutkan kode <strong>CASH-88921-08</strong>.</li>
                          <li>Serahkan uang tunai sebesar <strong>Rp {billAmount.toLocaleString("id-ID")}</strong>.</li>
                          <li>Admin akan mencetak tanda terima resmi dan memverifikasi pembayaran di sistem.</li>
                        </ol>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, justifyContent: "center", padding: "11px", fontWeight: 600 }}
                    onClick={() => setModalStep("select_method")}
                  >
                    Kembali
                  </button>
                  <button
                    className="btn btn-accent"
                    style={{ flex: 1.5, justifyContent: "center", padding: "11px", fontWeight: 700 }}
                    onClick={() => setModalStep("waiting_confirmation")}
                  >
                    Saya Sudah Melakukan Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: MENUNGGU KONFIRMASI PEMBAYARAN ───────────────── */}
            {modalStep === "waiting_confirmation" && (
              <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
                {/* Header Close */}
                <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    Menunggu Konfirmasi Pembayaran
                  </h3>
                  <button
                    onClick={() => setModalStep(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Animated Circular Spinner */}
                <div style={{ padding: "10px 0" }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid #e0f2fe",
                      borderTopColor: "var(--color-primary)",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto",
                    }}
                  />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>

                <p style={{ fontSize: 13, color: "var(--color-text-muted)", maxWidth: 360, lineHeight: 1.4 }}>
                  {paymentMethod === "cash" 
                    ? "Pengajuan pembayaran cash Anda telah dikirim ke Admin. Silakan serahkan uang tunai di cabang."
                    : "Sistem sedang menunggu konfirmasi dari penyedia pembayaran."}
                </p>

                {/* Ringkasan Tagihan Box */}
                <div
                  style={{
                    width: "100%",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                    RINGKASAN TAGIHAN
                  </div>
                  {billBreakdown.map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-text-secondary)" }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{item.amount}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: 10,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Total Pembayaran</span>
                    <span style={{ fontSize: 19, fontWeight: 900, color: "var(--color-primary)" }}>
                      Rp {billAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Cek Status Button — Routes to status invoice page */}
                <button
                  className="btn btn-accent"
                  style={{ width: "100%", justifyContent: "center", padding: "12px", fontWeight: 700, fontSize: 14 }}
                  onClick={handleCheckStatus}
                >
                  Cek Status Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
