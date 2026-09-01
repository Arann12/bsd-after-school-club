"use client";
import { useState } from "react";

export interface TeachingSessionLog {
  id: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  kelas: string;
  program: string;
  ruang: string;
  siswaHadir: number;
  totalSiswa: number;
  materi: string;
  catatanGuru: string;
  statusLogbook: "Logbook Terverifikasi" | "Menunggu Verifikasi";
}

const initialTeachingLogs: TeachingSessionLog[] = [
  {
    id: "LOG-2026-001",
    tanggal: "01 Sep 2026",
    jamMulai: "14:00",
    jamSelesai: "16:00",
    durasiJam: 2,
    kelas: "KLS-A",
    program: "Calistung Level 1",
    ruang: "Ruang Kelas 1",
    siswaHadir: 6,
    totalSiswa: 6,
    materi: "Pengenalan Huruf Konsonan & Latihan Membaca Suku Kata BA-BI-BU-BE-BO",
    catatanGuru: "Seluruh siswa mengikuti dengan antusias. Dian dan Budi sudah lancar menyambung 2 suku kata.",
    statusLogbook: "Logbook Terverifikasi",
  },
  {
    id: "LOG-2026-002",
    tanggal: "02 Sep 2026",
    jamMulai: "14:00",
    jamSelesai: "15:00",
    durasiJam: 1,
    kelas: "KLS-D",
    program: "Phonics Starter",
    ruang: "Ruang Kelas 3",
    siswaHadir: 5,
    totalSiswa: 5,
    materi: "Short Vowels Sound /a/ & Sound Matching Game",
    catatanGuru: "Siswa berlatih pengucapan phonics vokal pendek /a/ seperti apple, cat, dan bat.",
    statusLogbook: "Logbook Terverifikasi",
  },
  {
    id: "LOG-2026-003",
    tanggal: "03 Sep 2026",
    jamMulai: "15:30",
    jamSelesai: "17:30",
    durasiJam: 2,
    kelas: "KLS-A",
    program: "Calistung Level 1",
    ruang: "Ruang Kelas 1",
    siswaHadir: 6,
    totalSiswa: 6,
    materi: "Penulisan Angka 1-20 & Penjumlahan Dasar Sederhana (1-10)",
    catatanGuru: "Latihan pemahaman penjumlahan dengan bantuan objek gambar buah.",
    statusLogbook: "Logbook Terverifikasi",
  },
  {
    id: "LOG-2026-004",
    tanggal: "25 Agt 2026",
    jamMulai: "14:00",
    jamSelesai: "16:00",
    durasiJam: 2,
    kelas: "KLS-A",
    program: "Calistung Level 1",
    ruang: "Ruang Kelas 1",
    siswaHadir: 5,
    totalSiswa: 6,
    materi: "Mengenal Bentuk Geometri Dasar & Mewarnai Sesuai Pola",
    catatanGuru: "1 siswa izin sakit (Sari). Pembelajaran berlangsung lancar.",
    statusLogbook: "Logbook Terverifikasi",
  },
  {
    id: "LOG-2026-005",
    tanggal: "27 Agt 2026",
    jamMulai: "15:30",
    jamSelesai: "17:30",
    durasiJam: 2,
    kelas: "KLS-D",
    program: "Phonics Starter",
    ruang: "Ruang Kelas 2",
    siswaHadir: 5,
    totalSiswa: 5,
    materi: "Blending Consonants: ST-, SP-, & SK- Sound Words",
    catatanGuru: "Praktek pengucapan berpasangan dan permainan kartu kata.",
    statusLogbook: "Logbook Terverifikasi",
  },
  {
    id: "LOG-2026-006",
    tanggal: "29 Agt 2026",
    jamMulai: "13:00",
    jamSelesai: "15:00",
    durasiJam: 2,
    kelas: "KLS-B",
    program: "English B1",
    ruang: "Ruang Kelas 2",
    siswaHadir: 7,
    totalSiswa: 8,
    materi: "Daily Activities Vocabulary & Present Simple Sentence Structure",
    catatanGuru: "Diskusi kelompok membuat kalimat rutinitas harian dalam bahasa Inggris.",
    statusLogbook: "Menunggu Verifikasi",
  },
];

export default function GuruHonorJamPage() {
  const [logs, setLogs] = useState<TeachingSessionLog[]>(initialTeachingLogs);
  const [filterPeriode, setFilterPeriode] = useState("Bulan Ini");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [cari, setCari] = useState("");

  // Modal State Detail Sesi
  const [selectedDetailLog, setSelectedDetailLog] = useState<TeachingSessionLog | null>(null);

  // Modal State Ajukan Koreksi Jam
  const [showKoreksiModal, setShowKoreksiModal] = useState(false);
  const [koreksiTanggal, setKoreksiTanggal] = useState("");
  const [koreksiDurasi, setKoreksiDurasi] = useState(2);
  const [koreksiAlasan, setKoreksiAlasan] = useState("");

  const filteredLogs = logs.filter((l) => {
    const query = cari.toLowerCase();
    const matchesSearch =
      l.id.toLowerCase().includes(query) ||
      l.kelas.toLowerCase().includes(query) ||
      l.program.toLowerCase().includes(query) ||
      l.tanggal.toLowerCase().includes(query);

    const matchesProgram = filterProgram === "Semua" || l.program === filterProgram;

    const matchesPeriode =
      filterPeriode === "Semua" ||
      (filterPeriode === "Bulan Ini" && l.tanggal.includes("Sep")) ||
      (filterPeriode === "Bulan Lalu" && l.tanggal.includes("Agt"));

    return matchesSearch && matchesProgram && matchesPeriode;
  });

  const totalJamBulanIni = filteredLogs.reduce((acc, l) => acc + l.durasiJam, 0);
  const totalSesi = filteredLogs.length;

  const handleAjukanKoreksi = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pengajuan koreksi jam mengajar tanggal ${koreksiTanggal} (${koreksiDurasi} Jam) telah terkirim ke Admin & Owner.`);
    setShowKoreksiModal(false);
    setKoreksiTanggal("");
    setKoreksiAlasan("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rekap Jam Mengajar Saya</h1>
          <p className="page-subtitle">
            Rincian akumulasi durasi jam mengajar yang tercatat dari seluruh sesi kelas dan logbook harian.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => window.print()}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak Rekap Jam
          </button>
          <button className="btn btn-accent" onClick={() => setShowKoreksiModal(true)}>
            + Ajukan Koreksi Jam
          </button>
        </div>
      </div>

      {/* Info Banner Kebijakan Kerahasiaan Honor */}
      <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "14px 18px", color: "#1e40af", fontSize: 13, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 12 }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <strong>Kebijakan Privasi Honorarium:</strong> Pembayaran honorarium diproses secara privat dan langsung ditransfer oleh Owner/Pimpinan Bimbel. Halaman ini dikhususkan bagi Anda untuk memantau dan mencocokkan total durasi jam mengajar harian, mingguan, dan bulanan.
        </div>
      </div>

      {/* Statistik Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Total Jam Mengajar</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1d4ed8", lineHeight: 1.1 }}>
            {totalJamBulanIni} Jam
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Akumulasi logbook sesi</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Sesi Kelas Selesai</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#059669", lineHeight: 1.1 }}>
            {totalSesi} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Logbook terverifikasi</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Rata-rata Durasi Sesi</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#7c3aed", lineHeight: 1.1 }}>
            {(totalJamBulanIni / (totalSesi || 1)).toFixed(1)} Jam
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Per pertemuan mengajar</div>
        </div>

        <div className="stat-card" style={{ gap: 6 }}>
          <span className="stat-card-label" style={{ fontSize: 11.5 }}>Tingkat Kehadiran Siswa</span>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#0369a1", lineHeight: 1.1 }}>
            98%
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Rata-rata presensi kelas</div>
        </div>
      </div>

      {/* Visual Progress Hours Breakdown per Program */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>
          Distribusi Jam Mengajar per Program Study
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { program: "Calistung Level 1", jam: 6, sesi: 3, percent: 55, color: "#1d4ed8", bg: "#dbeafe" },
            { program: "Phonics Starter", jam: 3, sesi: 2, percent: 27, color: "#059669", bg: "#d1fae5" },
            { program: "English B1", jam: 2, sesi: 1, percent: 18, color: "#7c3aed", bg: "#ede9fe" },
          ].map((p) => (
            <div key={p.program} style={{ background: "var(--color-bg)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)" }}>{p.program}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{p.jam} Jam ({p.sesi} Sesi)</span>
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: 99, height: 7, overflow: "hidden", marginTop: 8 }}>
                <div style={{ background: p.color, height: "100%", width: `${p.percent}%`, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Table Rincian Jam Mengajar */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* Filter Controls Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, background: "#fafafa" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
            Daftar Sesi Mengajar & Logbook
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Input Cari */}
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type="text"
                placeholder="Cari kelas / program / tanggal..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                style={{ fontSize: 12.5, width: 220, paddingLeft: 30 }}
              />
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth={2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Select Program */}
            <select className="select-control" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} style={{ fontSize: 12.5, padding: "6px 12px" }}>
              <option value="Semua">Semua Program</option>
              <option value="Calistung Level 1">Calistung Level 1</option>
              <option value="Phonics Starter">Phonics Starter</option>
              <option value="English B1">English B1</option>
            </select>

            {/* Select Periode */}
            <select className="select-control" value={filterPeriode} onChange={(e) => setFilterPeriode(e.target.value)} style={{ fontSize: 12.5, padding: "6px 12px" }}>
              <option value="Semua">Semua Periode</option>
              <option value="Bulan Ini">September 2026</option>
              <option value="Bulan Lalu">Agustus 2026</option>
            </select>
          </div>
        </div>

        {/* Tabel Data */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["ID Sesi Logbook", "Tanggal Sesi", "Jam Mengajar", "Durasi", "Kelas & Program", "Kehadiran Siswa", "Status Logbook", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)", fontSize: 13 }}>
                    Tidak ada data jam mengajar yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l, i) => (
                  <tr
                    key={l.id}
                    style={{ borderBottom: i < filteredLogs.length - 1 ? "1px solid var(--color-border-light)" : "none", transition: "background .15s" }}
                    className="baris-tagihan"
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "var(--color-text-muted)", fontWeight: 700 }}>
                      {l.id}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {l.tanggal}
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {l.jamMulai} – {l.jamSelesai} WIB
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                        {l.durasiJam} Jam
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{l.kelas}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{l.program}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: l.siswaHadir === l.totalSiswa ? "#059669" : "#b45309" }}>
                        {l.siswaHadir} / {l.totalSiswa} Siswa
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: l.statusLogbook === "Logbook Terverifikasi" ? "#d1fae5" : "#fef3c7",
                          color: l.statusLogbook === "Logbook Terverifikasi" ? "#059669" : "#b45309",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {l.statusLogbook}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: 11.5, padding: "4px 10px" }}
                        onClick={() => setSelectedDetailLog(l)}
                      >
                        Lihat Detail →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL SESI MENGAJAR */}
      {selectedDetailLog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              padding: 26,
            }}
          >
            {/* Header Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 800 }}>
                  {selectedDetailLog.id}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: "2px 0 0" }}>
                  Detail Sesi {selectedDetailLog.kelas} — {selectedDetailLog.program}
                </h2>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {selectedDetailLog.tanggal} · Pukul {selectedDetailLog.jamMulai} – {selectedDetailLog.jamSelesai} WIB
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailLog(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 18, fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Grid Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Durasi Jam</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1d4ed8", marginTop: 2 }}>{selectedDetailLog.durasiJam} Jam</div>
              </div>
              <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Ruang Kelas</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 2 }}>{selectedDetailLog.ruang}</div>
              </div>
              <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Siswa Hadir</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>{selectedDetailLog.siswaHadir} / {selectedDetailLog.totalSiswa} Siswa</div>
              </div>
            </div>

            {/* Section Materi Pembelajaran */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                Materi Pembelajaran / Modul
              </div>
              <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5, fontWeight: 600 }}>
                {selectedDetailLog.materi}
              </div>
            </div>

            {/* Section Catatan Guru */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                Catatan Guru & Evaluasi Sesi
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                {selectedDetailLog.catatanGuru}
              </div>
            </div>

            {/* Status Verifikasi Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: 10, marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: "#047857", fontWeight: 700 }}>
                Status Verifikasi Logbook: <strong>{selectedDetailLog.statusLogbook}</strong>
              </div>
              <span style={{ fontSize: 11, color: "#059669", background: "#fff", padding: "2px 8px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
                Validasi Sistem
              </span>
            </div>

            {/* Footer Modal Action */}
            <button className="btn btn-accent" style={{ width: "100%" }} onClick={() => setSelectedDetailLog(null)}>
              Tutup Detail Sesi
            </button>
          </div>
        </div>
      )}

      {/* MODAL AJUKAN KOREKSI JAM */}
      {showKoreksiModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              padding: 26,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: 0 }}>
                  Form Pengajuan Koreksi Jam
                </h2>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                  Ajukan klaim durasi jam mengajar jika terdapat sesi yang belum terakumulasi.
                </p>
              </div>
              <button onClick={() => setShowKoreksiModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 18, fontWeight: 700 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAjukanKoreksi} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Tanggal Sesi Mengajar</label>
                <input className="form-input" type="date" required value={koreksiTanggal} onChange={(e) => setKoreksiTanggal(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Estimasi Durasi Jam (Jam)</label>
                <input className="form-input" type="number" min={1} max={8} required value={koreksiDurasi} onChange={(e) => setKoreksiDurasi(Number(e.target.value))} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Alasan / Catatan Koreksi</label>
                <textarea className="form-input" rows={3} placeholder="Contoh: Mengisi kelas pengganti KLS-B pada tanggal..." required value={koreksiAlasan} onChange={(e) => setKoreksiAlasan(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowKoreksiModal(false)}>Batal</button>
                <button type="submit" className="btn btn-accent">Kirim Pengajuan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
