"use client";
import { useState } from "react";
import Link from "next/link";
import { students as initialStudents } from "@/lib/data";
import type { Student } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLoadingState } from "@/lib/hooks";
import { SkeletonTable } from "@/components/ui/Skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Toast, { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";

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
  const loading = useLoadingState(400);
  const [studentList, setStudentList] = useState<Student[]>([...initialStudents]);
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterTagihan, setFilterTagihan] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModalDetail, setShowModalDetail] = useState(false);

  // Shortcut action modals
  const [showPindahProgram, setShowPindahProgram] = useState(false);
  const [showNaikLevel, setShowNaikLevel] = useState(false);
  const [targetProgram, setTargetProgram] = useState("");
  const [targetLevel, setTargetLevel] = useState("");

  const kelases = ["Semua", ...Array.from(new Set(studentList.map(s => s.kelas)))];
  const programs = ["Semua", ...Array.from(new Set(studentList.map(s => s.program)))];
  const statusList = ["Semua", "Trial", "Aktif", "On Leave", "Nonaktif", "Graduated"];
  const tagihanList = ["Semua", "Lunas", "Belum Bayar", "Overdue", "Menunggu Konfirmasi"];

  const filtered = studentList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.parent.toLowerCase().includes(search.toLowerCase()) ||
      s.guru.toLowerCase().includes(search.toLowerCase());
    const matchKelas = filterKelas === "Semua" || s.kelas === filterKelas;
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    const matchTagihan = filterTagihan === "Semua" ||
      (filterTagihan === "Belum Bayar" ? (s.tagihan === "Belum Bayar" || s.tagihan === "Overdue") : s.tagihan === filterTagihan);
    const matchProgram = filterProgram === "Semua" || s.program === filterProgram;
    return matchSearch && matchKelas && matchStatus && matchTagihan && matchProgram;
  });

  const { toast, showToast } = useToast();

  const triggerToast = (msg: string) => {
    showToast(msg);
  };

  const handlePindahProgram = () => {
    if (!selectedStudent || !targetProgram) return;
    setStudentList(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, program: targetProgram } : s));
    triggerToast(`Program ${selectedStudent.name} berhasil dipindahkan ke: ${targetProgram}`);
    setShowPindahProgram(false);
    setShowModalDetail(false);
  };

  const handleNaikLevel = () => {
    if (!selectedStudent || !targetLevel) return;
    setStudentList(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, level: targetLevel } : s));
    triggerToast(`Level ${selectedStudent.name} berhasil dinaikkan ke: ${targetLevel}`);
    setShowNaikLevel(false);
    setShowModalDetail(false);
  };

  if (loading) return <SkeletonTable rows={6} cols={7} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .row-hover:hover { background: #f8fafc !important; cursor: pointer; }
      `}</style>

      <Toast toast={toast} />

      {/* Header */}
      <PageHeader title="Data Siswa" subtitle="Kelola data siswa, filter per kelas, guru pengajar, dan status pembayaran."
        actions={<>
          <button className="btn btn-outline" onClick={() => triggerToast("Mengekspor data siswa...")}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Ekspor
          </button>
          <button className="btn btn-accent" onClick={() => { setSelectedStudent(null); setShowModalDetail(true); }}>+ Tambah Siswa Baru</button>
        </>}
      />

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Siswa",   value: studentList.length, bg: "#dbeafe", color: "#1d4ed8" },
          { label: "Siswa Aktif",   value: studentList.filter(s => s.status === "Aktif").length,     bg: "#d1fae5", color: "#059669" },
          { label: "Lunas SPP",     value: studentList.filter(s => s.tagihan === "Lunas").length,    bg: "#d1fae5", color: "#059669" },
          { label: "Belum Bayar / Overdue", value: studentList.filter(s => s.tagihan === "Overdue" || s.tagihan === "Belum Bayar").length, bg: "#fee2e2", color: "#dc2626" },
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

      {/* Filter Bar Lengkap (Sort per Kelas, Guru, Tagihan) */}
      <div className="card">
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Search Input dengan Icon */}
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                style={{ paddingLeft: 38, width: "100%" }}
                placeholder="Cari nama siswa, ortu, guru, atau ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Kelas */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2 }}>SORT PER KELAS</label>
              <select className="select-control" value={filterKelas} onChange={e => setFilterKelas(e.target.value)} style={{ padding: "8px 12px", fontSize: 13 }}>
                {kelases.map(k => <option key={k} value={k}>{k === "Semua" ? "Semua Kelas" : `Kelas: ${k}`}</option>)}
              </select>
            </div>

            {/* Filter Status Tagihan */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2 }}>STATUS PEMBAYARAN</label>
              <select className="select-control" value={filterTagihan} onChange={e => setFilterTagihan(e.target.value)} style={{ padding: "8px 12px", fontSize: 13 }}>
                {tagihanList.map(t => <option key={t} value={t}>{t === "Semua" ? "Semua Status Bayar" : t}</option>)}
              </select>
            </div>

            {/* Filter Program */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2 }}>PROGRAM</label>
              <select className="select-control" value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ padding: "8px 12px", fontSize: 13 }}>
                {programs.map(p => <option key={p} value={p}>{p === "Semua" ? "Semua Program" : p}</option>)}
              </select>
            </div>

            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto", alignSelf: "flex-end" }}>
              {filtered.length} siswa
            </span>
          </div>
        </div>
      </div>

      {/* Table Siswa */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                {["ID Siswa", "Nama Siswa", "Orang Tua", "Program & Level", "Kelas", "Guru Mengajar", "Status Siswa", "Status Bayar", "Shortcut Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className="row-hover"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff" }}
                  onClick={() => { setSelectedStudent(s); setShowModalDetail(true); }}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12.5, color: "var(--color-text-muted)", fontWeight: 600 }}>{s.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)", display: "block" }}>{s.name}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{s.pertemuan} Sesi</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.parent}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{s.program}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-primary)", fontWeight: 600 }}>{s.level}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11.5, fontWeight: 800, padding: "3px 10px", borderRadius: 6 }}>{s.kelas}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s.guru}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={s.status} variant="student" />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={s.tagihan} variant="payment" />
                  </td>
                  <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedStudent(s); setShowModalDetail(true); }}>Detail</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Shortcut Menu Siswa */}
      <Modal open={showModalDetail} onClose={() => setShowModalDetail(false)} title={selectedStudent ? `Detail Siswa — ${selectedStudent.name}` : "Tambah Siswa Baru"} maxWidth={620}>

            {selectedStudent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Header Card */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--color-bg)", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)" }}>{selectedStudent.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{selectedStudent.id} · Wali: {selectedStudent.parent} ({selectedStudent.parentPhone})</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <StatusBadge status={selectedStudent.status} variant="student" />
                      <StatusBadge status={`SPP: ${selectedStudent.tagihan}`} variant="payment" />
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Program Utama", value: selectedStudent.program },
                    { label: "Tingkatan Level", value: selectedStudent.level },
                    { label: "Kelas Terdaftar", value: selectedStudent.kelas },
                    { label: "Guru Pengajar", value: selectedStudent.guru },
                    { label: "Total Pertemuan", value: selectedStudent.pertemuan },
                    { label: "No. WA Orang Tua", value: selectedStudent.parentPhone },
                  ].map(f => (
                    <div key={f.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* SHORTCUT MENU AKSI KE HALAMAN LAIN (Requirement #2) */}
                <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                    Shortcut Aksi Siswa
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    <button className="btn btn-outline" style={{ background: "#fff", fontSize: 12, padding: "8px 10px" }}
                      onClick={() => { setTargetProgram(selectedStudent.program); setShowPindahProgram(true); }}>
                      Memindahkan Program
                    </button>
                    <button className="btn btn-outline" style={{ background: "#fff", fontSize: 12, padding: "8px 10px" }}
                      onClick={() => { setTargetLevel(selectedStudent.level); setShowNaikLevel(true); }}>
                      Menaikkan Level
                    </button>
                    <Link href={`/owner/absensi?siswa=${encodeURIComponent(selectedStudent.name)}`} className="btn btn-outline" style={{ background: "#fff", fontSize: 12, padding: "8px 10px", textAlign: "center", textDecoration: "none" }}>
                      Lihat Absensi
                    </Link>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setShowModalDetail(false)}>Tutup</button>
                  <button className="btn btn-accent" onClick={() => { triggerToast(`Simpan perubahan data ${selectedStudent.name}`); setShowModalDetail(false); }}>Simpan Perubahan</button>
                </div>
              </div>
            ) : (
              /* Form Tambah Siswa */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Lengkap Siswa</label>
                    <input className="form-input" placeholder="Masukkan nama siswa" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Orang Tua / Wali</label>
                    <input className="form-input" placeholder="Nama Orang Tua" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Program</label>
                    <select className="form-input">
                      {programs.filter(p => p !== "Semua").map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kelas</label>
                    <select className="form-input">
                      {kelases.filter(k => k !== "Semua").map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowModalDetail(false)}>Batal</button>
                  <button className="btn btn-accent" onClick={() => { triggerToast("Siswa baru berhasil ditambahkan!"); setShowModalDetail(false); }}>Simpan Siswa</button>
                </div>
              </div>
            )}
      </Modal>

      {/* Modal Pindah Program */}
      <Modal open={showPindahProgram && !!selectedStudent} onClose={() => setShowPindahProgram(false)} title="Pindahkan Program Kursus" maxWidth={440}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>Siswa: <strong>{selectedStudent?.name}</strong> (Program Saat ini: {selectedStudent?.program})</p>
        <div className="form-group">
          <label className="form-label">Pilih Program Baru</label>
          <select className="form-input" value={targetProgram} onChange={e => setTargetProgram(e.target.value)}>
            <option value="">-- Pilih Program --</option>
            {programs.filter(p => p !== "Semua").map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => setShowPindahProgram(false)}>Batal</button>
          <button className="btn btn-accent" onClick={handlePindahProgram}>Konfirmasi Pindah</button>
        </div>
      </Modal>

      {/* Modal Naik Level */}
      <Modal open={showNaikLevel && !!selectedStudent} onClose={() => setShowNaikLevel(false)} title="Naikkan Level Program" maxWidth={440}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>Siswa: <strong>{selectedStudent?.name}</strong> (Level Saat ini: {selectedStudent?.level})</p>
        <div className="form-group">
          <label className="form-label">Level Baru</label>
          <input className="form-input" placeholder="Contoh: Level 2 / Advanced" value={targetLevel} onChange={e => setTargetLevel(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => setShowNaikLevel(false)}>Batal</button>
          <button className="btn btn-accent" onClick={handleNaikLevel}>Konfirmasi Naik Level</button>
        </div>
      </Modal>
    </div>
  );
}
