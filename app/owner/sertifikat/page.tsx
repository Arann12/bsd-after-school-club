"use client";
import { useState } from "react";

export interface CertificateItem {
  id: string;
  nomorSertifikat: string;
  namaSiswa: string;
  program: string;
  level: string;
  tglLulus: string;
  nilaiAkhir: string;
  predikat: "Dengan Pujian (Cumlaude)" | "Sangat Baik" | "Baik";
  status: "Diterbitkan" | "Proses Cetak";
}

const initialCertificates: CertificateItem[] = [
  { id: "CERT-001", nomorSertifikat: "BSD/CERT/2026/001", namaSiswa: "Eko Wijaya", program: "Calistung", level: "Level 2", tglLulus: "15 Agt 2026", nilaiAkhir: "94.5", predikat: "Dengan Pujian (Cumlaude)", status: "Diterbitkan" },
  { id: "CERT-002", nomorSertifikat: "BSD/CERT/2026/002", namaSiswa: "Budi Santoso", program: "English", level: "Level 2 (B1)", tglLulus: "20 Agt 2026", nilaiAkhir: "88.0", predikat: "Sangat Baik", status: "Diterbitkan" },
  { id: "CERT-003", nomorSertifikat: "BSD/CERT/2026/003", namaSiswa: "Citra Kirana", program: "Math", level: "Level 3 (Advance)", tglLulus: "01 Sep 2026", nilaiAkhir: "91.0", predikat: "Dengan Pujian (Cumlaude)", status: "Proses Cetak" },
];

export default function SertifikatPage() {
  const [certList, setCertList] = useState<CertificateItem[]>(initialCertificates);
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const filtered = certList.filter(c =>
    c.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
    c.nomorSertifikat.toLowerCase().includes(search.toLowerCase()) ||
    c.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikat Kelulusan Siswa</h1>
          <p className="page-subtitle">Modul penerbitan sertifikat kelulusan program dan pencetakan dokumen resmi BSD After School Club.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowGenerateModal(true)}>
          + Terbitkan Sertifikat Baru
        </button>
      </div>

      {/* Notification Toast Inline */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifToast}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Sertifikat Diterbitkan", value: certList.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Predikat Cumlaude", value: certList.filter(c => c.predikat.includes("Cumlaude")).length, color: "#059669", bg: "#d1fae5" },
          { label: "Proses Cetak / Verifikasi", value: certList.filter(c => c.status === "Proses Cetak").length, color: "#b45309", bg: "#fef3c7" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="search-input" style={{ paddingLeft: 38, width: "100%" }} placeholder="Cari nama siswa, no sertifikat..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["No. Sertifikat", "Nama Siswa", "Program & Level", "Tanggal Lulus", "Nilai & Predikat", "Status", "Cetak & Pratinjau"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary)" }}>{c.nomorSertifikat}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{c.namaSiswa}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700 }}>{c.program}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{c.level}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)" }}>{c.tglLulus}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800, color: "#059669" }}>Nilai: {c.nilaiAkhir}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.predikat}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: c.status === "Diterbitkan" ? "#d1fae5" : "#fef3c7",
                      color: c.status === "Diterbitkan" ? "#059669" : "#b45309",
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedCert(c)}>
                      Lihat / Cetak Sertifikat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PRATINJAU SERTIFIKAT DOKUMEN (REQUIREMENT #11) */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 680, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", border: "8px double #cbd5e1" }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, letterSpacing: "0.2em", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>BSD AFTER SCHOOL CLUB</div>
              <h1 style={{ fontSize: 24, fontFamily: "serif", fontWeight: 900, color: "#0f172a", margin: "6px 0 0" }}>SERTIFIKAT KELULUSAN</h1>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>Nomor: {selectedCert.nomorSertifikat}</div>
            </div>

            <div style={{ textAlign: "center", padding: "10px 20px" }}>
              <p style={{ fontSize: 14, color: "#64748b", fontStyle: "italic", margin: 0 }}>Dengan ini menyatakan bahwa:</p>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1d4ed8", margin: "10px 0" }}>{selectedCert.namaSiswa}</h2>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                Telah menyelesaikan seluruh rangkaian kegiatan pembelajaran pada program <strong>{selectedCert.program} ({selectedCert.level})</strong> dengan hasil nilai akhir <strong>{selectedCert.nilaiAkhir}</strong> dan dinyatakan lulus dengan predikat:
              </p>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", background: "#f0fdf4", display: "inline-block", padding: "8px 24px", borderRadius: 999, margin: "10px 0 20px" }}>
                "{selectedCert.predikat}"
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px dashed #cbd5e1" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Tanggal Kelulusan</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{selectedCert.tglLulus}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Direktur BSD After School Club</div>
                  <div style={{ height: 40 }} />
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", textDecoration: "underline" }}>Academic Director</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setSelectedCert(null)}>Tutup Pratinjau</button>
              <button className="btn btn-accent" onClick={() => { setNotifToast("Mengunduh file PDF sertifikat..."); setTimeout(() => setNotifToast(null), 3000); }}>
                Unduh Sertifikat (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERATE SERTIFIKAT */}
      {showGenerateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 500, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Terbitkan Sertifikat Baru</h2>
              <button onClick={() => setShowGenerateModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Siswa Lulus</label>
                <select className="form-input">
                  <option>Andi Setiawan (Calistung Level 1)</option>
                  <option>Budi Santoso (English Level 2)</option>
                  <option>Citra Kirana (Math Level 3)</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nilai Akhir (0-100)</label>
                  <input className="form-input" placeholder="95.0" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Predikat</label>
                  <select className="form-input">
                    <option>Dengan Pujian (Cumlaude)</option>
                    <option>Sangat Baik</option>
                    <option>Baik</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowGenerateModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={() => { setNotifToast("Sertifikat berhasil diterbitkan!"); setTimeout(() => setNotifToast(null), 3000); setShowGenerateModal(false); }}>Terbitkan Sertifikat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
