"use client";
import { useState } from "react";
import Link from "next/link";

const dataProgram = [
  { id: "PRG-001", nama: "Calistung Level 1", harga: 500000, durasi: "12 Sesi" },
  { id: "PRG-002", nama: "Calistung Level 2", harga: 550000, durasi: "12 Sesi" },
  { id: "PRG-003", nama: "English B1", harga: 600000, durasi: "12 Sesi" },
  { id: "PRG-004", nama: "Math Advance", harga: 650000, durasi: "12 Sesi" },
  { id: "PRG-005", nama: "Phonics Starter", harga: 480000, durasi: "12 Sesi" },
];

const dataKelas = [
  { id: "KLS-A", nama: "KLS-A (Senin & Rabu 14:00)", program: "Calistung Level 1", sisaKapasitas: 4 },
  { id: "KLS-B", nama: "KLS-B (Selasa & Kamis 15:00)", program: "English B1", sisaKapasitas: 2 },
  { id: "KLS-C", nama: "KLS-C (Rabu & Jumat 16:00)", program: "Math Advance", sisaKapasitas: 5 },
];

const ortuExisting = [
  { id: "PAR-001", nama: "Budi Setiawan", hp: "081234567890" },
  { id: "PAR-002", nama: "Joko Santoso", hp: "081987654321" },
  { id: "PAR-003", nama: "Dewi Kirana", hp: "085678901234" },
];

export default function PendaftaranPage() {
  const [modeOrtu, setModeOrtu] = useState<"pilih" | "baru">("pilih");
  const [selectedOrtu, setSelectedOrtu] = useState(ortuExisting[0].id);
  const [namaOrtuBaru, setNamaOrtuBaru] = useState("");
  const [hpOrtuBaru, setHpOrtuBaru] = useState("");
  const [emailOrtuBaru, setEmailOrtuBaru] = useState("");

  const [namaSiswa, setNamaSiswa] = useState("");
  const [tgllahir, setTgllahir] = useState("");
  const [gender, setGender] = useState("Laki-laki");

  const [selectedProgram, setSelectedProgram] = useState(dataProgram[0].id);
  const [selectedKelas, setSelectedKelas] = useState(dataKelas[0].id);
  const [metodePembayaran, setMetodePembayaran] = useState("Cash via Admin");

  const [sukses, setSukses] = useState(false);
  const [sedangKirim, setSedangKirim] = useState(false);

  const progDipilih = dataProgram.find(p => p.id === selectedProgram);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa.trim()) return;
    setSedangKirim(true);
    setTimeout(() => {
      setSedangKirim(false);
      setSukses(true);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 840, margin: "0 auto", width: "100%" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pendaftaran Siswa Baru</h1>
          <p className="page-subtitle">Form pendaftaran dan penempatan kelas oleh Admin.</p>
        </div>
        <Link href="/admin/students" className="btn btn-outline">
          ← Kembali ke Daftar Siswa
        </Link>
      </div>

      {sukses ? (
        <div className="card" style={{ padding: 36, textAlign: "center", animation: "modalIn .3s ease" }}>
          <div style={{ fontSize: 54, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-primary)", marginBottom: 8 }}>Pendaftaran Berhasil!</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>
            Siswa <strong>{namaSiswa}</strong> telah terdaftar dalam program <strong>{progDipilih?.nama}</strong>. ID Siswa <strong>STD-2026-009</strong> dan Invoice <strong>INV-2026-000009</strong> telah diterbitkan secara otomatis.
          </p>

          <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px", display: "inline-flex", gap: 20, textAlign: "left", marginBottom: 28, border: "1px solid var(--color-border)" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Nominal Invoice</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>Rp {progDipilih?.harga.toLocaleString("id")}</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: 20 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Metode Bayar</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{metodePembayaran}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-outline" onClick={() => { setSukses(false); setNamaSiswa(""); }}>+ Daftarkan Siswa Lain</button>
            <Link href="/admin/students" className="btn btn-primary">Lihat Data Siswa →</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Section 1: Data Orang Tua */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>👨‍👩‍👧</span> 1. Data Orang Tua / Wali
            </h3>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button type="button" onClick={() => setModeOrtu("pilih")}
                style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: modeOrtu === "pilih" ? "var(--color-primary-bg)" : "white",
                  color: modeOrtu === "pilih" ? "var(--color-primary)" : "var(--color-text-secondary)",
                  borderColor: modeOrtu === "pilih" ? "var(--color-primary)" : "var(--color-border)",
                }}>
                Gunakan Orang Tua Terdaftar
              </button>
              <button type="button" onClick={() => setModeOrtu("baru")}
                style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: modeOrtu === "baru" ? "var(--color-primary-bg)" : "white",
                  color: modeOrtu === "baru" ? "var(--color-primary)" : "var(--color-text-secondary)",
                  borderColor: modeOrtu === "baru" ? "var(--color-primary)" : "var(--color-border)",
                }}>
                + Tambah Orang Tua Baru
              </button>
            </div>

            {modeOrtu === "pilih" ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Orang Tua</label>
                <select className="form-input" value={selectedOrtu} onChange={e => setSelectedOrtu(e.target.value)}>
                  {ortuExisting.map(o => (
                    <option key={o.id} value={o.id}>{o.nama} ({o.hp})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Lengkap Orang Tua</label>
                  <input className="form-input" placeholder="Contoh: Rina Handayani" value={namaOrtuBaru} onChange={e => setNamaOrtuBaru(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">No. WhatsApp</label>
                  <input className="form-input" placeholder="0812xxxxxxx" value={hpOrtuBaru} onChange={e => setHpOrtuBaru(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Email (untuk login akun Orang Tua)</label>
                  <input className="form-input" type="email" placeholder="nama@email.com" value={emailOrtuBaru} onChange={e => setEmailOrtuBaru(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Data Siswa */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🧒</span> 2. Data Siswa
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap Siswa</label>
                <input className="form-input" placeholder="Contoh: Anisa Putri" value={namaSiswa} onChange={e => setNamaSiswa(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Lahir</label>
                <input className="form-input" type="date" value={tgllahir} onChange={e => setTgllahir(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jenis Kelamin</label>
                <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Program & Kelas */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📚</span> 3. Program & Penempatan Kelas
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Program</label>
                <select className="form-input" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
                  {dataProgram.map(p => (
                    <option key={p.id} value={p.id}>{p.nama} — Rp {p.harga.toLocaleString("id")}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Kelas</label>
                <select className="form-input" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
                  {dataKelas.map(k => (
                    <option key={k.id} value={k.id}>{k.nama} (Sisa {k.sisaKapasitas} kursus)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Metode Pembayaran Pendaftaran</label>
              <select className="form-input" value={metodePembayaran} onChange={e => setMetodePembayaran(e.target.value)}>
                <option>Cash via Admin (Lunas Langsung)</option>
                <option>Tagihan Digital ke Orang Tua (Virtual Account / QRIS)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <button type="submit" disabled={sedangKirim || !namaSiswa.trim()}
            style={{ width: "100%", padding: "14px", borderRadius: "var(--radius-md)", border: "none", background: "var(--color-primary)", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "all .2s ease", opacity: sedangKirim || !namaSiswa.trim() ? .6 : 1 }}>
            {sedangKirim ? "⏳ Memproses Pendaftaran..." : "✅ Daftarkan Siswa Baru"}
          </button>
        </form>
      )}
    </div>
  );
}
