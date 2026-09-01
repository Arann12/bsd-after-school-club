"use client";
import { useState } from "react";

export interface OrangTuaData {
  id: string;
  nama: string;
  hp: string;
  email: string;
  alamat: string;
  pekerjaan: string;
  anak: string[];
  totalTagihan: number;
  tglMulaiBayar: string;
  batasWaktuBayar: string;
  statusTagihan: "Lunas" | "Belum Bayar" | "Overdue" | "Menunggu Konfirmasi";
  terdaftar: string;
  metodePembayaran: string;
}

const daftarOrangTua: OrangTuaData[] = [
  {
    id: "PAR-001",
    nama: "Budi Setiawan",
    hp: "081234567890",
    email: "budi.setiawan@email.com",
    alamat: "Jl. BSD Raya Utama No. 12, Tangerang Selatan",
    pekerjaan: "Wiraswasta",
    anak: ["Andi Setiawan"],
    totalTagihan: 600000,
    tglMulaiBayar: "01 Sep 2026",
    batasWaktuBayar: "10 Sep 2026",
    statusTagihan: "Lunas",
    terdaftar: "12 Jan 2026",
    metodePembayaran: "Virtual Account BCA",
  },
  {
    id: "PAR-002",
    nama: "Joko Santoso",
    hp: "081987654321",
    email: "joko.santoso@email.com",
    alamat: "Griya Asri BSD Block C4/15, Tangerang",
    pekerjaan: "Karyawan Swasta",
    anak: ["Budi Santoso", "Eko Wijaya"],
    totalTagihan: 1200000,
    tglMulaiBayar: "01 Sep 2026",
    batasWaktuBayar: "10 Sep 2026",
    statusTagihan: "Lunas",
    terdaftar: "15 Feb 2026",
    metodePembayaran: "QRIS",
  },
  {
    id: "PAR-003",
    nama: "Dewi Kirana",
    hp: "085678901234",
    email: "dewi.kirana@email.com",
    alamat: "Cluster Greenwich BSD No. 88, Tangerang Selatan",
    pekerjaan: "Dokter",
    anak: ["Citra Kirana"],
    totalTagihan: 720000,
    tglMulaiBayar: "01 Sep 2026",
    batasWaktuBayar: "10 Sep 2026",
    statusTagihan: "Lunas",
    terdaftar: "01 Mar 2026",
    metodePembayaran: "Transfer Mandiri",
  },
  {
    id: "PAR-004",
    nama: "Sari Pratama",
    hp: "082112233445",
    email: "sari.pratama@email.com",
    alamat: "Jl. Serpong Park C3 No. 5, Tangerang Selatan",
    pekerjaan: "Arsitek",
    anak: ["Dian Pratama"],
    totalTagihan: 500000,
    tglMulaiBayar: "01 Sep 2026",
    batasWaktuBayar: "10 Sep 2026",
    statusTagihan: "Belum Bayar",
    terdaftar: "10 Apr 2026",
    metodePembayaran: "Belum Dipilih",
  },
  {
    id: "PAR-005",
    nama: "Siska Pertiwi",
    hp: "081777889900",
    email: "siska.pertiwi@email.com",
    alamat: "Vanya Park BSD Cluster Askara No. 22",
    pekerjaan: "Desainer",
    anak: ["Hana Pertiwi"],
    totalTagihan: 500000,
    tglMulaiBayar: "25 Agt 2026",
    batasWaktuBayar: "05 Sep 2026",
    statusTagihan: "Overdue",
    terdaftar: "05 Mei 2026",
    metodePembayaran: "Belum Dipilih",
  },
];

export default function AdminOrangTuaPage() {
  const [cari, setCari] = useState("");
  const [selectedOrangTua, setSelectedOrangTua] = useState<OrangTuaData | null>(null);

  const terfilter = daftarOrangTua.filter(o =>
    o.nama.toLowerCase().includes(cari.toLowerCase()) ||
    o.hp.includes(cari) ||
    o.email.toLowerCase().includes(cari.toLowerCase()) ||
    o.anak.some(a => a.toLowerCase().includes(cari.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Data Orang Tua</h1>
          <p className="page-subtitle">Rincian lengkap informasi orang tua, biaya tagihan, tanggal mulai bayar, dan batas waktu jatuh tempo.</p>
        </div>
      </div>

      {/* Bar Pencarian dengan ICON SEARCH (Requirement #3) */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            {/* Search Icon SVG */}
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              style={{ paddingLeft: 42, width: "100%", fontSize: 14 }}
              placeholder="Cari nama orang tua, No. WA, email, atau nama anak..."
              value={cari}
              onChange={e => setCari(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Akun Wali", value: daftarOrangTua.length, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Tagihan Lunas", value: daftarOrangTua.filter(o => o.statusTagihan === "Lunas").length, color: "#059669", bg: "#d1fae5" },
          { label: "Belum Bayar / Overdue", value: daftarOrangTua.filter(o => o.statusTagihan !== "Lunas").length, color: "#dc2626", bg: "#fee2e2" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{c.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Tabel Data Orang Tua */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Wali", "Nama Orang Tua", "No. WA / Email", "Anak Terhubung", "Biaya Tagihan", "Tanggal Mulai", "Batas Waktu Bayar", "Status", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terfilter.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>
                    Orang tua tidak ditemukan.
                  </td>
                </tr>
              ) : terfilter.map((o, i) => (
                <tr key={o.id} className="row-hover" style={{ borderBottom: i < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none" }} onClick={() => setSelectedOrangTua(o)}>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{o.nama}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    <div>{o.hp}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{o.email}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {o.anak.map(a => (
                        <span key={a} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{a}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>
                    Rp {o.totalTagihan.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)" }}>{o.tglMulaiBayar}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12.5, fontWeight: 700, color: o.statusTagihan === "Overdue" ? "#dc2626" : "var(--color-text-primary)" }}>
                    {o.batasWaktuBayar}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      background: o.statusTagihan === "Lunas" ? "#d1fae5" : o.statusTagihan === "Overdue" ? "#fee2e2" : "#fef3c7",
                      color: o.statusTagihan === "Lunas" ? "#059669" : o.statusTagihan === "Overdue" ? "#dc2626" : "#b45309",
                      fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999
                    }}>
                      {o.statusTagihan}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrangTua(o)}>Detail</button>
                      <a href={`https://wa.me/62${o.hp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>WA</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Informasi Lengkap Orang Tua (Requirement #3) */}
      {selectedOrangTua && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Informasi Orang Tua / Wali</h2>
              <button onClick={() => setSelectedOrangTua(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header Info */}
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selectedOrangTua.nama[0]}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedOrangTua.nama}</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedOrangTua.id} · Terdaftar sejak {selectedOrangTua.terdaftar}</div>
                </div>
              </div>

              {/* Rincian Biaya & Periode Pembayaran */}
              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  💳 Informasi Biaya & Tagihan
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>Biaya Harus Dibayar</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#15803d", marginTop: 2 }}>
                      Rp {selectedOrangTua.totalTagihan.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>Metode Pembayaran</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#166534", marginTop: 2 }}>
                      {selectedOrangTua.metodePembayaran}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>Tanggal Mulai Bayar</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#166534", marginTop: 2 }}>
                      {selectedOrangTua.tglMulaiBayar}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>Batas Waktu Bayar (Due Date)</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: selectedOrangTua.statusTagihan === "Overdue" ? "#dc2626" : "#166534", marginTop: 2 }}>
                      {selectedOrangTua.batasWaktuBayar}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Pribadi & Kontak */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "No. WhatsApp", value: selectedOrangTua.hp },
                  { label: "Email", value: selectedOrangTua.email },
                  { label: "Pekerjaan", value: selectedOrangTua.pekerjaan },
                  { label: "Alamat Tempat Tinggal", value: selectedOrangTua.alamat },
                ].map(f => (
                  <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Anak Terhubung */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Anak Terhubung</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedOrangTua.anak.map(a => (
                    <span key={a} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 8 }}>
                      👦 {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedOrangTua(null)}>Tutup</button>
                <a href={`https://wa.me/62${selectedOrangTua.hp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ textAlign: "center", textDecoration: "none" }}>
                  📱 Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
