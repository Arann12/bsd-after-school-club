"use client";
import { useState } from "react";

export default function OrangTuaSertifikatPage() {
  const [selectedCert, setSelectedCert] = useState<boolean>(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikat Kelulusan Anak</h1>
          <p className="page-subtitle">Daftar sertifikat resmi kelulusan program yang diperoleh oleh anak Anda.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900 }}>
              CERT
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>BSD/CERT/2026/001</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>Calistung Level 1 — Andi Setiawan</h3>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>Tanggal Lulus: 15 Agt 2026 · Predikat: Dengan Pujian (Cumlaude)</div>
            </div>
          </div>
          <button className="btn btn-accent" onClick={() => setSelectedCert(true)}>
            Lihat & Unduh Sertifikat (PDF)
          </button>
        </div>
      </div>

      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 640, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", border: "8px double #cbd5e1" }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>BSD AFTER SCHOOL CLUB</div>
              <h1 style={{ fontSize: 24, fontFamily: "serif", fontWeight: 900, color: "#0f172a", margin: "6px 0 0" }}>SERTIFIKAT KELULUSAN</h1>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>Nomor: BSD/CERT/2026/001</div>
            </div>

            <div style={{ textAlign: "center", padding: "10px 20px" }}>
              <p style={{ fontSize: 14, color: "#64748b", fontStyle: "italic", margin: 0 }}>Dengan ini menyatakan bahwa:</p>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", margin: "10px 0" }}>Andi Setiawan</h2>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
                Telah menyelesaikan seluruh materi pembelajaran pada program <strong>Calistung (Level 1)</strong> dan dinyatakan lulus dengan predikat:
              </p>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#059669", background: "#f0fdf4", display: "inline-block", padding: "6px 20px", borderRadius: 999, margin: "10px 0 16px" }}>
                "Dengan Pujian (Cumlaude)"
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCert(false)}>Tutup</button>
              <button className="btn btn-accent" onClick={() => alert("Mengunduh Sertifikat PDF...")}>Cetak / Unduh PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
