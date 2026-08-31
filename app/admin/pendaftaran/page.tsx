"use client";
import { useState } from "react";
import Link from "next/link";

type StatusEnroll = "Pending" | "Approved" | "Rejected";

const dataProgram = [
  { id: "PRG-0001", nama: "Calistung Level 1", harga: 500000, durasi: "12 Sesi" },
  { id: "PRG-0002", nama: "English B1",        harga: 600000, durasi: "12 Sesi" },
  { id: "PRG-0003", nama: "Math Advance",       harga: 650000, durasi: "12 Sesi" },
];

const dataKelas = [
  { id: "KLS-2026-0001", nama: "KLS-A (Senin & Rabu 14:00)", program: "Calistung Level 1", sisaKapasitas: 1, kapasitas: 7, terisi: 6 },
  { id: "KLS-2026-0002", nama: "KLS-B (Selasa & Kamis 15:00)", program: "English B1",      sisaKapasitas: 0, kapasitas: 7, terisi: 7 },
  { id: "KLS-2026-0003", nama: "KLS-C (Rabu & Jumat 16:00)",   program: "Math Advance",    sisaKapasitas: 3, kapasitas: 7, terisi: 4 },
];

const ortuExisting = [
  { id: "PAR-2026-0001", nama: "Budi Setiawan",  hp: "081234567890" },
  { id: "PAR-2026-0002", nama: "Joko Santoso",   hp: "081987654321" },
  { id: "PAR-2026-0003", nama: "Dewi Kirana",    hp: "085678901234" },
];

const antrianAwal: {
  id: string; nama: string; orang_tua: string; program: string; kelas: string;
  tanggal: string; status: StatusEnroll; catatan: string;
}[] = [
  { id: "ENR-2026-0001", nama: "Rizky Aditya",  orang_tua: "Ahmad Rizky",  program: "Calistung Level 1", kelas: "KLS-A", tanggal: "30 Agt 2026", status: "Pending",  catatan: "" },
  { id: "ENR-2026-0002", nama: "Sari Melati",   orang_tua: "Budi Santoso", program: "English B1",        kelas: "KLS-B", tanggal: "29 Agt 2026", status: "Approved", catatan: "Sudah konfirmasi via WA" },
  { id: "ENR-2026-0003", nama: "Bagas Pratama", orang_tua: "Rina Dewi",    program: "Math Advance",      kelas: "KLS-C", tanggal: "28 Agt 2026", status: "Rejected", catatan: "Kelas penuh, disarankan menunggu batch baru" },
];

const warnaStatus: Record<StatusEnroll, { bg: string; color: string }> = {
  Pending:  { bg: "#fef3c7", color: "#b45309" },
  Approved: { bg: "#d1fae5", color: "#059669" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};

export default function PendaftaranPage() {
  const [tab, setTab] = useState<"antrian" | "form">("antrian");
  const [antrian, setAntrian] = useState(antrianAwal);
  const [dipilih, setDipilih] = useState<typeof antrianAwal[0] | null>(null);
  const [catatanAdmin, setCatatanAdmin] = useState("");

  // Form state
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
  const [sukses, setSukses] = useState(false);
  const [sedangKirim, setSedangKirim] = useState(false);

  const kelasDipilih = dataKelas.find(k => k.id === selectedKelas);
  const kelasPenuh = kelasDipilih?.sisaKapasitas === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa.trim() || kelasPenuh) return;
    setSedangKirim(true);
    setTimeout(() => {
      const newId = `ENR-2026-${String(antrian.length + 1).padStart(4, "0")}`;
      const prog = dataProgram.find(p => p.id === selectedProgram);
      const kls = dataKelas.find(k => k.id === selectedKelas);
      setAntrian(prev => [{
        id: newId, nama: namaSiswa,
        orang_tua: modeOrtu === "pilih" ? ortuExisting.find(o => o.id === selectedOrtu)?.nama || "" : namaOrtuBaru,
        program: prog?.nama || "", kelas: kls?.nama.split(" ")[0] || "",
        tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: "Pending", catatan: "",
      }, ...prev]);
      setSedangKirim(false);
      setSukses(true);
      setTab("antrian");
    }, 1200);
  };

  const setStatus = (id: string, status: StatusEnroll) => {
    setAntrian(prev => prev.map(a => a.id === id ? { ...a, status, catatan: catatanAdmin } : a));
    setDipilih(null);
    setCatatanAdmin("");
  };

  const pending = antrian.filter(a => a.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .row-enr:hover{background:#f8fafc!important;cursor:pointer}
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pendaftaran Siswa</h1>
          <p className="page-subtitle">Kelola antrian pendaftaran dan proses approval/rejection calon siswa.</p>
        </div>
        <div className="page-header-actions">
          {pending > 0 && (
            <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 999, border: "1px solid #fde68a" }}>
              {pending} Menunggu Review
            </span>
          )}
          <button className={`btn ${tab === "form" ? "btn-outline" : "btn-accent"}`} onClick={() => { setTab(tab === "form" ? "antrian" : "form"); setSukses(false); }}>
            {tab === "form" ? "← Kembali ke Antrian" : "+ Daftarkan Siswa Baru"}
          </button>
        </div>
      </div>

      {/* Stat Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Menunggu Review", val: antrian.filter(a=>a.status==="Pending").length,   warna: "#b45309", bg: "#fef3c7" },
          { label: "Disetujui",       val: antrian.filter(a=>a.status==="Approved").length,  warna: "#059669", bg: "#d1fae5" },
          { label: "Ditolak",         val: antrian.filter(a=>a.status==="Rejected").length,  warna: "#dc2626", bg: "#fee2e2" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{s.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: s.warna }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* TAB: ANTRIAN */}
      {tab === "antrian" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header">
            <h2 className="card-title">Antrian Pendaftaran</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                  {["ID Enrollment", "Nama Calon Siswa", "Orang Tua", "Program", "Kelas", "Tanggal", "Status", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {antrian.map((a, i) => (
                  <tr key={a.id} className="row-enr"
                    style={{ borderBottom: i < antrian.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background .15s" }}
                    onClick={() => { setDipilih(a); setCatatanAdmin(a.catatan); }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{a.id}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{a.nama}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{a.orang_tua}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{a.program}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.kelas}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>{a.tanggal}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ ...warnaStatus[a.status], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                      {a.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-accent btn-sm" onClick={() => { setDipilih(a); setCatatanAdmin(""); }}>Review</button>
                        </div>
                      )}
                      {a.status !== "Pending" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setDipilih(a); setCatatanAdmin(a.catatan); }}>Detail</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: FORM PENDAFTARAN */}
      {tab === "form" && !sukses && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 840, width: "100%" }}>
          {/* Orang Tua */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>1. Data Orang Tua / Wali</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {(["pilih", "baru"] as const).map(m => (
                <button key={m} type="button" onClick={() => setModeOrtu(m)}
                  style={{ padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: modeOrtu === m ? "var(--color-primary-bg)" : "white",
                    color: modeOrtu === m ? "var(--color-primary)" : "var(--color-text-secondary)",
                    borderColor: modeOrtu === m ? "var(--color-primary)" : "var(--color-border)" }}>
                  {m === "pilih" ? "Orang Tua Terdaftar" : "+ Tambah Orang Tua Baru"}
                </button>
              ))}
            </div>
            {modeOrtu === "pilih" ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Orang Tua</label>
                <select className="form-input" value={selectedOrtu} onChange={e => setSelectedOrtu(e.target.value)}>
                  {ortuExisting.map(o => <option key={o.id} value={o.id}>{o.nama} ({o.hp})</option>)}
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

          {/* Data Siswa */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>2. Data Siswa</h3>
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
                  <option>Laki-laki</option><option>Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Program & Kelas */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 16 }}>3. Program & Penempatan Kelas</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Program</label>
                <select className="form-input" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
                  {dataProgram.map(p => <option key={p.id} value={p.id}>{p.nama} — Rp {p.harga.toLocaleString("id")}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pilih Kelas / Batch</label>
                <select className="form-input" value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
                  {dataKelas.map(k => (
                    <option key={k.id} value={k.id} disabled={k.sisaKapasitas === 0}>
                      {k.nama} {k.sisaKapasitas === 0 ? `— PENUH (${k.kapasitas}/${k.kapasitas})` : `(Sisa ${k.sisaKapasitas} dari ${k.kapasitas})`}
                    </option>
                  ))}
                </select>
                {kelasPenuh && (
                  <div style={{ marginTop: 8, background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                    Kelas ini PENUH (maks. 7 siswa). Pilih kelas/batch lain atau buat kelas baru.
                  </div>
                )}
              </div>
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13, color: "#1e40af" }}>
              Setelah disubmit, pendaftaran masuk ke antrian <strong>Pending</strong> dan menunggu review Admin sebelum siswa resmi terdaftar.
            </div>
          </div>

          <button type="submit" disabled={sedangKirim || !namaSiswa.trim() || kelasPenuh}
            style={{ width: "100%", padding: "14px", borderRadius: "var(--radius-md)", border: "none", fontWeight: 800, fontSize: 15, cursor: kelasPenuh ? "not-allowed" : "pointer", transition: "all .2s ease",
              background: kelasPenuh ? "#94a3b8" : "var(--color-primary)", color: "white",
              opacity: sedangKirim || !namaSiswa.trim() ? 0.6 : 1 }}>
            {sedangKirim ? "Memproses..." : kelasPenuh ? "Kelas Penuh — Pilih Kelas Lain" : "Kirim ke Antrian Pending"}
          </button>
        </form>
      )}

      {sukses && tab === "antrian" && (
        <div style={{ background: "#d1fae5", border: "1px solid #86efac", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", animation: "fadeIn .3s ease" }}>
          <div style={{ fontSize: 14, color: "#15803d", fontWeight: 600 }}>Pendaftaran berhasil dikirim ke antrian. Status: <strong>Pending</strong> — menunggu review Admin.</div>
        </div>
      )}

      {/* Modal Review */}
      {dipilih && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn .2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)", animation: "modalIn .25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Review Pendaftaran</h2>
              <button onClick={() => setDipilih(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "ID Enrollment", value: dipilih.id },
                { label: "Status", value: dipilih.status },
                { label: "Nama Calon Siswa", value: dipilih.nama },
                { label: "Orang Tua", value: dipilih.orang_tua },
                { label: "Program", value: dipilih.program },
                { label: "Kelas", value: dipilih.kelas },
                { label: "Tanggal Daftar", value: dipilih.tanggal },
              ].map(f => (
                <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: f.label === "Status" ? warnaStatus[f.value as StatusEnroll]?.color || "var(--color-text-primary)" : "var(--color-text-primary)" }}>{f.value}</div>
                </div>
              ))}
            </div>

            {dipilih.status === "Pending" && (
              <>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Catatan Admin (opsional)</label>
                  <input className="form-input" placeholder="Contoh: Sudah konfirmasi via WA" value={catatanAdmin} onChange={e => setCatatanAdmin(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
                  <button className="btn btn-outline" style={{ color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => setStatus(dipilih.id, "Rejected")}>Tolak</button>
                  <button className="btn btn-accent" onClick={() => setStatus(dipilih.id, "Approved")}>Setujui</button>
                </div>
              </>
            )}

            {dipilih.status !== "Pending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dipilih.catatan && (
                  <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    <strong>Catatan:</strong> {dipilih.catatan}
                  </div>
                )}
                <button className="btn btn-ghost" onClick={() => setDipilih(null)}>Tutup</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
