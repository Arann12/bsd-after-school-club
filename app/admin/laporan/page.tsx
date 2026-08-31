"use client";
import { useState } from "react";

const dataLaporanSiswa = [
  { id: "STD-2026-001", nama: "Andi Setiawan", program: "Calistung Level 1", kelas: "KLS-A", kehadiran: "92%", nilaiTugas: 88, nilaiUjian: 90, nilaiAkhir: 89, status: "Aktif", sertifikat: false },
  { id: "STD-2026-005", nama: "Eko Wijaya", program: "Calistung Level 2", kelas: "KLS-B", kehadiran: "100%", nilaiTugas: 95, nilaiUjian: 92, nilaiAkhir: 94, status: "Lulus", sertifikat: true, noSertifikat: "CERT-2026-0001", tanggalLulus: "28 Agustus 2026" },
  { id: "STD-2026-002", nama: "Budi Santoso", program: "English B1", kelas: "KLS-B", kehadiran: "85%", nilaiTugas: 80, nilaiUjian: 84, nilaiAkhir: 82, status: "Aktif", sertifikat: false },
  { id: "STD-2026-003", nama: "Citra Kirana", program: "Math Advance", kelas: "KLS-C", kehadiran: "95%", nilaiTugas: 90, nilaiUjian: 94, nilaiAkhir: 92, status: "Siap Graduated", sertifikat: false },
];

export default function LaporanPage() {
  const [tab, setTab] = useState<"akademik" | "keuangan" | "sertifikat">("sertifikat");
  const [dipilih, setDipilih] = useState<typeof dataLaporanSiswa[0] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sedangGenerate, setSedangGenerate] = useState(false);
  const [sertifikatSelesai, setSertifikatSelesai] = useState<string[]>(["STD-2026-005"]);

  const handleGenerate = (siswa: typeof dataLaporanSiswa[0]) => {
    setSedangGenerate(true);
    setTimeout(() => {
      setSedangGenerate(false);
      if (!sertifikatSelesai.includes(siswa.id)) {
        setSertifikatSelesai(prev => [...prev, siswa.id]);
      }
      setDipilih(siswa);
      setShowPreview(true);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes certReveal { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan & Sertifikat</h1>
          <p className="page-subtitle">Rekap akademik, laporan keuangan, dan pencetakan sertifikat siswa.</p>
        </div>
      </div>

      {/* Tab Navigasi Utama */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
        {[
          { id: "sertifikat", label: "📜 Sertifikat & Kelulusan" },
          { id: "akademik", label: "📊 Laporan Akademik" },
          { id: "keuangan", label: "💰 Laporan Keuangan" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{
              padding: "10px 20px", borderRadius: "var(--radius-md)", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all .15s",
              background: tab === t.id ? "var(--color-primary)" : "var(--color-bg)",
              color: tab === t.id ? "white" : "var(--color-text-secondary)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SERTIFIKAT */}
      {tab === "sertifikat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stat Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <div className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">Siswa Graduated</span>
              <div className="stat-card-value" style={{ fontSize: 28, color: "#059669" }}>{sertifikatSelesai.length}</div>
            </div>
            <div className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">Siap Generate</span>
              <div className="stat-card-value" style={{ fontSize: 28, color: "#1d4ed8" }}>
                {dataLaporanSiswa.filter(s => s.status === "Siap Graduated" && !sertifikatSelesai.includes(s.id)).length}
              </div>
            </div>
            <div className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">Total Sertifikat Terbit</span>
              <div className="stat-card-value" style={{ fontSize: 28, color: "#7c3aed" }}>{sertifikatSelesai.length}</div>
            </div>
          </div>

          {/* Tabel Nilai & Sertifikat */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <h2 className="card-title">Daftar Penilaian & Kelulusan Siswa</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                    {["ID Siswa", "Nama Siswa", "Program", "Kehadiran", "Tugas", "Ujian", "Nilai Akhir", "Status", "Sertifikat", "Aksi"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataLaporanSiswa.map((s, i) => {
                    const sudahTerbit = sertifikatSelesai.includes(s.id);
                    return (
                      <tr key={s.id} className="row-hover" style={{ borderBottom: i < dataLaporanSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{s.id}</td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{s.nama}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.program}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{s.kehadiran}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.nilaiTugas}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.nilaiUjian}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{s.nilaiAkhir}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: sudahTerbit || s.status === "Lulus" ? "#d1fae5" : s.status === "Siap Graduated" ? "#dbeafe" : "#f1f5f9", color: sudahTerbit || s.status === "Lulus" ? "#059669" : s.status === "Siap Graduated" ? "#1d4ed8" : "#64748b", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                            {sudahTerbit ? "Lulus (Graduated)" : s.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {sudahTerbit ? (
                            <span style={{ color: "#059669", fontSize: 12, fontWeight: 700 }}>CERT-2026-000{i + 1}</span>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Belum Terbit</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {sudahTerbit ? (
                            <button className="btn btn-outline btn-sm" onClick={() => { setDipilih(s); setShowPreview(true); }}>Lihat Sertifikat</button>
                          ) : (
                            <button className="btn btn-accent btn-sm" disabled={sedangGenerate} onClick={() => handleGenerate(s)}>
                              {sedangGenerate ? "⏳ Generating..." : "⚡ Generate Sertifikat"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AKADEMIK */}
      {tab === "akademik" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Rekap Kehadiran per Program</h3>
            {[
              { pro: "Calistung Level 1", persen: 94, siswa: 34 },
              { pro: "English B1", persen: 89, siswa: 28 },
              { pro: "Math Advance", persen: 96, siswa: 22 },
              { pro: "Phonics Starter", persen: 91, siswa: 18 },
            ].map(p => (
              <div key={p.pro} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span>{p.pro} ({p.siswa} siswa)</span>
                  <span style={{ color: "var(--color-primary)" }}>{p.persen}%</span>
                </div>
                <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--color-primary)", width: `${p.persen}%`, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Distribusi Status Siswa</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Siswa Aktif", jml: "84 Siswa", warna: "#059669" },
                { label: "Graduated / Lulus", jml: "12 Siswa", warna: "#1d4ed8" },
                { label: "Cuti Sementara", jml: "3 Siswa", warna: "#b45309" },
              ].map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--color-bg)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.warna }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{d.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: d.warna }}>{d.jml}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KEUANGAN */}
      {tab === "keuangan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <div className="stat-card">
              <span className="stat-card-label">Total Pendapatan Bulan Ini</span>
              <div className="stat-card-value" style={{ fontSize: 24, color: "#059669" }}>Rp 18.450.000</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pembayaran Digital (VA/QRIS)</span>
              <div className="stat-card-value" style={{ fontSize: 24, color: "#1d4ed8" }}>Rp 12.200.000</div>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Pembayaran Cash</span>
              <div className="stat-card-value" style={{ fontSize: 24, color: "#7c3aed" }}>Rp 6.250.000</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW SERTIFIKAT RESMI */}
      {showPreview && dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 680, width: "100%", padding: 36, boxShadow: "0 25px 50px -12px rgba(0,0,0,.35)", animation: "certReveal .35s cubic-bezier(0.16,1,0.3,1)", overflowY: "auto", maxHeight: "90vh" }}>
            
            {/* Sertifikat Visual (Bingkai Emas & Elegan) */}
            <div style={{
              border: "8px double #d97706",
              borderRadius: 12,
              padding: 32,
              textAlign: "center",
              background: "linear-gradient(180deg, #fffdfa 0%, #fff9f0 100%)",
              position: "relative",
              boxShadow: "inset 0 0 20px rgba(217,119,6,0.08)"
            }}>
              {/* Stempel / Seal */}
              <div style={{ position: "absolute", top: 16, right: 20, fontSize: 11, fontWeight: 800, color: "#b45309", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: 999, background: "#fef3c7" }}>
                OFFICIAL CERTIFICATE
              </div>

              <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b45309", fontWeight: 800, marginBottom: 8 }}>
                BSD AFTER SCHOOL CLUB
              </div>
              <h1 style={{ fontFamily: "serif", fontSize: 28, color: "#1a5c8a", margin: "0 0 16px", fontWeight: 700 }}>
                SERTIFIKAT KELULUSAN
              </h1>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                Diberikan secara resmi kepada:
              </div>

              {/* Nama Siswa */}
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", borderBottom: "2px solid #d97706", display: "inline-block", paddingBottom: 6, marginBottom: 20 }}>
                {dipilih.nama}
              </div>

              <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 24px" }}>
                Telah berhasil menyelesaikan seluruh rangkaian program <strong style={{ color: "#1a5c8a" }}>{dipilih.program}</strong> dengan nilai akhir <strong style={{ color: "#059669" }}>{dipilih.nilaiAkhir} (Sangat Memuaskan)</strong>.
              </div>

              {/* Footer Sertifikat */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30, paddingTop: 16, borderTop: "1px dashed #cbd5e1" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>No. Sertifikat</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, fontFamily: "monospace", color: "#0f172a" }}>CERT-2026-0001</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>BSD After School Club</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{dipilih.tanggalLulus || "28 Agustus 2026"}</div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setShowPreview(false)}>Tutup</button>
              <button className="btn btn-outline" onClick={() => alert("Mencetak sertifikat...")}>🖨️ Cetak</button>
              <button className="btn btn-accent" onClick={() => alert("Mengunduh PDF sertifikat...")}>📥 Unduh PDF</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
