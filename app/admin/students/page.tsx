"use client";
import { useState } from "react";

const students = [
  { id: "STD-2026-0001", name: "Andi Setiawan", parent: "Budi Setiawan", program: "Calistung Level 1", kelas: "KLS-2026-0001", pertemuan: "6/12", status: "Aktif", tagihan: "Lunas" },
  { id: "STD-2026-0002", name: "Budi Santoso", parent: "Hendra Santoso", program: "English B1", kelas: "KLS-2026-0002", pertemuan: "10/12", status: "Aktif", tagihan: "Belum Bayar" },
  { id: "STD-2026-0003", name: "Citra Kirana", parent: "Dewi Kirana", program: "Math Advance", kelas: "KLS-2026-0003", pertemuan: "3/12", status: "Aktif", tagihan: "Lunas" },
  { id: "STD-2026-0004", name: "Dian Pratama", parent: "Sari Pratama", program: "Phonics Starter", kelas: "KLS-2026-0001", pertemuan: "1/12", status: "Trial", tagihan: "Belum Bayar" },
  { id: "STD-2026-0005", name: "Eko Wijaya", parent: "Joko Wijaya", program: "Calistung Level 2", kelas: "KLS-2026-0002", pertemuan: "12/12", status: "Graduated", tagihan: "Lunas" },
  { id: "STD-2026-0006", name: "Fitri Handayani", parent: "Rina Handayani", program: "English B1", kelas: "KLS-2026-0002", pertemuan: "8/12", status: "Aktif", tagihan: "Lunas" },
  { id: "STD-2026-0007", name: "Gilang Ramadan", parent: "Ahmad Ramadan", program: "Math Advance", kelas: "KLS-2026-0003", pertemuan: "5/12", status: "On Leave", tagihan: "Lunas" },
  { id: "STD-2026-0008", name: "Hana Pertiwi", parent: "Siska Pertiwi", program: "Phonics Starter", kelas: "KLS-2026-0001", pertemuan: "2/12", status: "Aktif", tagihan: "Overdue" },
  { id: "STD-2026-0009", name: "Ivan Kurnia", parent: "Lestari Kurnia", program: "Calistung Level 1", kelas: "KLS-2026-0001", pertemuan: "0/8", status: "Trial", tagihan: "Belum Bayar" },
];

const warnaStatus: Record<string, { bg: string; color: string }> = {
  Trial:     { bg: "#fef9c3", color: "#ca8a04" },
  Aktif:     { bg: "#d1fae5", color: "#059669" },
  "On Leave":{ bg: "#fef3c7", color: "#b45309" },
  Nonaktif:  { bg: "#f1f5f9", color: "#64748b" },
  Graduated: { bg: "#dbeafe", color: "#1d4ed8" },
};

const warnaTagihan: Record<string, { bg: string; color: string }> = {
  Lunas:                { bg: "#d1fae5", color: "#059669" },
  "Menunggu Konfirmasi":{ bg: "#fef3c7", color: "#b45309" },
  "Belum Bayar":        { bg: "#fee2e2", color: "#dc2626" },
  "Overdue":            { bg: "#fce7f3", color: "#be185d" },
  "Partially Paid":     { bg: "#e0f2fe", color: "#0369a1" },
};

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);

  const programs = ["Semua", ...Array.from(new Set(students.map(s => s.program)))];
  const statusList = ["Semua", "Trial", "Aktif", "On Leave", "Nonaktif", "Graduated"];

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.parent.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    const matchProgram = filterProgram === "Semua" || s.program === filterProgram;
    return matchSearch && matchStatus && matchProgram;
  });

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
          <h1 className="page-title">Data Siswa</h1>
          <p className="page-subtitle">Kelola seluruh data siswa yang terdaftar.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => alert("Ekspor...")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Ekspor
          </button>
          <button className="btn btn-accent" onClick={() => { setSelectedStudent(null); setShowModal(true); }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Siswa",   value: students.length, bg: "#dbeafe", color: "#1d4ed8" },
          { label: "Trial",         value: students.filter(s => s.status === "Trial").length,     bg: "#fef9c3", color: "#ca8a04" },
          { label: "Aktif",         value: students.filter(s => s.status === "Aktif").length,     bg: "#d1fae5", color: "#059669" },
          { label: "Overdue / Belum Bayar", value: students.filter(s => s.tagihan === "Overdue" || s.tagihan === "Belum Bayar").length, bg: "#fee2e2", color: "#dc2626" },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ gap: 8 }}>
            <div className="stat-card-header">
              <span className="stat-card-label">{c.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: 28, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                style={{ paddingLeft: 38, width: "100%" }}
                placeholder="Cari nama, ID, atau orang tua..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Status Filter */}
            <select className="select-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", fontSize: 13.5 }}>
              {statusList.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Program Filter */}
            <select className="select-control" value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ padding: "9px 12px", fontSize: 13.5 }}>
              {programs.map(p => <option key={p}>{p}</option>)}
            </select>
            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {filtered.length} siswa ditemukan
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Siswa", "Nama Siswa", "Orang Tua", "Program", "Kelas", "Pertemuan", "Status", "Tagihan", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>
                    Tidak ada siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="row-hover"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", transition: "background 0.15s" }}
                  onClick={() => { setSelectedStudent(s); setShowModal(true); }}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12.5, color: "var(--color-text-muted)", fontWeight: 600 }}>{s.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {s.name[0]}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.parent}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.program}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{s.kelas}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--color-border)", borderRadius: 999, minWidth: 48, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: "var(--color-primary)", width: `${(parseInt(s.pertemuan) / parseInt(s.pertemuan.split("/")[1])) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{s.pertemuan}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ ...warnaStatus[s.status], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{s.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ ...warnaTagihan[s.tagihan], fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{s.tagihan}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedStudent(s); setShowModal(true); }}>Detail</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail / Tambah Siswa */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                {selectedStudent ? "Detail Siswa" : "Tambah Siswa Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {selectedStudent ? (
              /* Detail View */
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Avatar + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedStudent.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedStudent.id}</div>
                    <span style={{ ...warnaStatus[selectedStudent.status], fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, marginTop: 4, display: "inline-block" }}>{selectedStudent.status}</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "Orang Tua", value: selectedStudent.parent },
                    { label: "Program", value: selectedStudent.program },
                    { label: "Kelas", value: selectedStudent.kelas },
                    { label: "Progress Pertemuan", value: selectedStudent.pertemuan },
                  ].map(f => (
                    <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* Tagihan Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>Status Tagihan</span>
                  <span style={{ ...warnaTagihan[selectedStudent.tagihan], fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>{selectedStudent.tagihan}</span>
                </div>

                {/* Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>Tutup</button>
                  <button className="btn btn-primary" onClick={() => alert(`Edit ${selectedStudent.name}`)}>Edit Data Siswa</button>
                </div>
              </div>
            ) : (
              /* Tambah Siswa Form — Master Data Lengkap sesuai PRD */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Lengkap Siswa</label>
                    <input className="form-input" placeholder="Masukkan nama siswa" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal Lahir</label>
                    <input className="form-input" type="date" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Sekolah Asal</label>
                    <input className="form-input" placeholder="Contoh: SD BSD 01" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kelas di Sekolah</label>
                    <input className="form-input" placeholder="Contoh: Kelas 2 SD / TK B" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Orang Tua / Wali</label>
                    <input className="form-input" placeholder="Nama Orang Tua" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">No. HP Orang Tua</label>
                    <input className="form-input" placeholder="08xx-xxxx-xxxx" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Program Utama (Maks 2)</label>
                    <select className="form-input">
                      <option value="">-- Pilih Program Utama --</option>
                      {programs.filter(p => p !== "Semua").map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Program Tambahan (opsional)</label>
                    <select className="form-input">
                      <option value="">-- Tanpa Program ke-2 --</option>
                      {programs.filter(p => p !== "Semua").map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Level Kursus</label>
                    <input className="form-input" placeholder="Contoh: Level 1 / Intermediate" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal Mulai Belajar</label>
                    <input className="form-input" type="date" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Catatan Khusus (Alergi, kebutuhan khusus, dll)</label>
                  <input className="form-input" placeholder="Contoh: Alergi kacang, butuh perhatian khusus membaca" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
                  <button className="btn btn-accent" onClick={() => { alert("Siswa berhasil ditambahkan!"); setShowModal(false); }}>Simpan Siswa</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
