"use client";
import { useState } from "react";
import Link from "next/link";

export interface Guru {
  id: string;
  nama: string;
  spesialisasi: string;
  hp: string;
  email: string;
  alamat: string;
  bank: string;
  noRekening: string;
  atasNamaRekening: string;
  honorPerJam: number;
  totalHonorBulanIni: number;
  jamBulanIni: number;
  status: "Aktif" | "Nonaktif";
  tglBergabung: string;
}

const daftarGuru: Guru[] = [
  {
    id: "GUR-2026-001",
    nama: "Ms. Sarah",
    spesialisasi: "Calistung & Phonics",
    hp: "081299887766",
    email: "sarah@bsdclub.com",
    alamat: "Griya Loka BSD Block A2 No. 10, Tangerang Selatan",
    bank: "BCA",
    noRekening: "8830192831",
    atasNamaRekening: "Sarah Safitri",
    honorPerJam: 75000,
    totalHonorBulanIni: 1350000,
    jamBulanIni: 18,
    status: "Aktif",
    tglBergabung: "10 Jan 2025",
  },
  {
    id: "GUR-2026-002",
    nama: "Mr. Andi",
    spesialisasi: "English B1 & B2",
    hp: "081388776655",
    email: "andi@bsdclub.com",
    alamat: "Jl. Pahlawan Serpong No. 45, Tangerang Selatan",
    bank: "Mandiri",
    noRekening: "1370019283741",
    atasNamaRekening: "Andi Prasetya",
    honorPerJam: 80000,
    totalHonorBulanIni: 1120000,
    jamBulanIni: 14,
    status: "Aktif",
    tglBergabung: "15 Mar 2025",
  },
  {
    id: "GUR-2026-003",
    nama: "Ms. Nina",
    spesialisasi: "Math Advance",
    hp: "081477665544",
    email: "nina@bsdclub.com",
    alamat: "Foresta BSD Cluster Fiore No. 18",
    bank: "BRI",
    noRekening: "034101029384501",
    atasNamaRekening: "Nina Kusumawati",
    honorPerJam: 75000,
    totalHonorBulanIni: 900000,
    jamBulanIni: 12,
    status: "Aktif",
    tglBergabung: "01 Jun 2025",
  },
  {
    id: "GUR-2026-004",
    nama: "Mr. Budi",
    spesialisasi: "Coding & Robotics",
    hp: "081566554433",
    email: "budi@bsdclub.com",
    alamat: "BSD City Villa Melati Mas Block J3/12",
    bank: "BNI",
    noRekening: "0829103948",
    atasNamaRekening: "Budi Santoso",
    honorPerJam: 90000,
    totalHonorBulanIni: 720000,
    jamBulanIni: 8,
    status: "Aktif",
    tglBergabung: "10 Agt 2025",
  },
];

export default function AdminGuruPage() {
  const [listGuru, setListGuru] = useState<Guru[]>(daftarGuru);
  const [cari, setCari] = useState("");
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);

  const terfilter = listGuru.filter(g =>
    g.nama.toLowerCase().includes(cari.toLowerCase()) ||
    g.spesialisasi.toLowerCase().includes(cari.toLowerCase()) ||
    g.hp.includes(cari)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Guru & Staff Pengajar</h1>
          <p className="page-subtitle">Kelola data tenaga pengajar, rincian rekening, honor, kontak WhatsApp, dan absensi.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowTambahModal(true)}>
          + Tambah Guru Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Guru & Staff", value: listGuru.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Guru Aktif", value: listGuru.filter(g => g.status === "Aktif").length, color: "#059669", bg: "#d1fae5" },
          { label: "Total Jam Bulan Ini", value: `${listGuru.reduce((a, g) => a + g.jamBulanIni, 0)} Jam`, color: "#7c3aed", bg: "#ede9fe" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search Bar dengan Icon */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <svg
              width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              style={{ paddingLeft: 42, width: "100%", fontSize: 14 }}
              placeholder="Cari nama guru, spesialisasi, atau nomor WA..."
              value={cari}
              onChange={e => setCari(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Guru", "Nama Pengajar", "Spesialisasi Program", "No. WA / Email", "Jam Bulan Ini", "Status", "CTA / Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terfilter.map((g, i) => (
                <tr key={g.id} className="row-hover" style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }} onClick={() => setSelectedGuru(g)}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{g.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ede9fe", color: "#6d28d9", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {g.nama[0]}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{g.nama}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{g.spesialisasi}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                    <div>{g.hp}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{g.email}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{g.jamBulanIni} Jam</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{g.status}</span>
                  </td>
                  {/* BUTTON CTA DI KANAN (Requirement #4) */}
                  <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-accent btn-sm" onClick={() => setSelectedGuru(g)}>
                        Detail
                      </button>
                      <a href={`https://wa.me/62${g.hp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ textDecoration: "none", color: "#25D366", borderColor: "#25D366" }}>
                        WA
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL GURU (Requirement #4) */}
      {selectedGuru && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 580, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Informasi Guru & Staff</h2>
              <button onClick={() => setSelectedGuru(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Profile Card */}
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#7c3aed", color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selectedGuru.nama[0]}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedGuru.nama}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedGuru.id} · Spesialisasi: {selectedGuru.spesialisasi}</div>
                  <div style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 700, marginTop: 4 }}>Bergabung sejak: {selectedGuru.tglBergabung}</div>
                </div>
              </div>

              {/* Data Rekening & Honor */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  🏦 Informasi Bank Rekening & Honor
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Bank & No. Rekening</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                      {selectedGuru.bank} — {selectedGuru.noRekening}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Atas Nama Rekening</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                      {selectedGuru.atasNamaRekening}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Tarif Honor Per Jam</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>
                      Rp {selectedGuru.honorPerJam.toLocaleString("id-ID")}/jam
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Estimasi Honor Bulan Ini ({selectedGuru.jamBulanIni} jam)</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#1d4ed8", marginTop: 2 }}>
                      Rp {selectedGuru.totalHonorBulanIni.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kontak & Alamat */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>No. WhatsApp</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedGuru.hp}</div>
                </div>
                <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedGuru.email}</div>
                </div>
              </div>

              <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Alamat Rumah Lengkap</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{selectedGuru.alamat}</div>
              </div>

              {/* SHORTCUT TOMBOL KE ABSENSI DAN LOGBOOK GURU (Requirement #4) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <Link href={`/owner/absensi?guru=${encodeURIComponent(selectedGuru.nama)}`} className="btn btn-outline" style={{ textDecoration: "none", textAlign: "center" }}>
                  📋 Ke Absensi & Logbook
                </Link>
                <a href={`https://wa.me/62${selectedGuru.hp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ textDecoration: "none", textAlign: "center" }}>
                  💬 Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH GURU BARU (Requirement #6) */}
      {showTambahModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 540, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Tambah Guru / Staff Baru</h2>
              <button onClick={() => setShowTambahModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap Guru</label>
                <input className="form-input" placeholder="Contoh: Ms. Clara" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Spesialisasi Program</label>
                  <input className="form-input" placeholder="Contoh: English & Phonics" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. WhatsApp</label>
                  <input className="form-input" placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" placeholder="guru@bsdclub.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tarif Honor Per Jam (Rp)</label>
                  <input className="form-input" placeholder="75000" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Bank</label>
                  <input className="form-input" placeholder="BCA / Mandiri" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. Rekening</label>
                  <input className="form-input" placeholder="1234567890" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowTambahModal(false)}>Batal</button>
                <button className="btn btn-accent" onClick={() => { alert("Guru baru berhasil ditambahkan!"); setShowTambahModal(false); }}>Simpan Guru</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
