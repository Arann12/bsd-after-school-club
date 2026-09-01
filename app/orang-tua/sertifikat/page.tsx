"use client";
import { useState } from "react";

interface CertificateState {
  id: string;
  nomorSertifikat: string;
  program: string;
  level: string;
  isGenerated: boolean;
  tglLulus?: string;
  predikat?: string;
}

const mockParentCertificates: CertificateState[] = [
  { id: "CERT-001", nomorSertifikat: "BSD/CERT/2026/001", program: "Calistung", level: "Level 1", isGenerated: true, tglLulus: "15 Agt 2026", predikat: "Dengan Pujian (Cumlaude)" },
  { id: "CERT-002", nomorSertifikat: "BSD/CERT/2026/002", program: "English", level: "Level 2 (B1)", isGenerated: false },
];

export default function OrangTuaSertifikatPage() {
  const [certs, setCerts] = useState<CertificateState[]>(mockParentCertificates);
  const [selectedCert, setSelectedCert] = useState<CertificateState | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikat Kelulusan Anak</h1>
          <p className="page-subtitle">Daftar sertifikat resmi kelulusan program yang diperoleh oleh anak Anda.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {certs.map(c => (
          <div key={c.id} className="card" style={{ padding: 24, opacity: c.isGenerated ? 1 : 0.85 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: c.isGenerated ? "#d1fae5" : "#f1f5f9", color: c.isGenerated ? "#059669" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>
                  {c.isGenerated ? "✓" : "🔒"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{c.isGenerated ? c.nomorSertifikat : "SERTIFIKAT TERGEMBOK"}</span>
                    {!c.isGenerated && (
                      <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                        Belum Terbit
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: "2px 0 0" }}>{c.program} ({c.level}) — Andi Setiawan</h3>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {c.isGenerated ? `Tanggal Lulus: ${c.tglLulus} · Predikat: ${c.predikat}` : "Sertifikat belum digenerate oleh Pengajar / Owner. Selesaikan modul pembelajaran untuk membuka."}
                  </div>
                </div>
              </div>

              {c.isGenerated ? (
                <button className="btn btn-accent" onClick={() => setSelectedCert(c)}>
                  Lihat & Unduh Sertifikat (PDF)
                </button>
              ) : (
                <button className="btn btn-ghost" disabled style={{ opacity: 0.6, cursor: "not-allowed", border: "1px solid #cbd5e1" }}>
                  🔒 Sertifikat Tergembok
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview Certificate */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 640, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", border: "8px double #cbd5e1" }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.2em", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>BSD AFTER SCHOOL CLUB</div>
              <h1 style={{ fontSize: 24, fontFamily: "serif", fontWeight: 900, color: "#0f172a", margin: "6px 0 0" }}>SERTIFIKAT KELULUSAN</h1>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>Nomor: {selectedCert.nomorSertifikat}</div>
            </div>

            <div style={{ textAlign: "center", padding: "10px 20px" }}>
              <p style={{ fontSize: 14, color: "#64748b", fontStyle: "italic", margin: 0 }}>Dengan ini menyatakan bahwa:</p>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", margin: "10px 0" }}>Andi Setiawan</h2>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
                Telah menyelesaikan seluruh materi pembelajaran pada program <strong>{selectedCert.program} ({selectedCert.level})</strong> dan dinyatakan lulus dengan predikat:
              </p>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#059669", background: "#f0fdf4", display: "inline-block", padding: "6px 20px", borderRadius: 999, margin: "10px 0 16px" }}>
                "{selectedCert.predikat}"
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCert(null)}>Tutup</button>
              <button className="btn btn-accent" onClick={() => alert("Mengunduh Sertifikat PDF...")}>Cetak / Unduh PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
