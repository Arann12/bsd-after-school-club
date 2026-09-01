"use client";
import { useState } from "react";

export interface GuruAbsensiData {
  id: string;
  nama: string;
  spesialisasi: string;
  totalSesiBulanIni: number;
  tingkatKehadiran: number; // percentage
  statusLogbook: string;
}

const daftarGuru: GuruAbsensiData[] = [
  { id: "G-001", nama: "Ms. Sarah", spesialisasi: "Calistung & English", totalSesiBulanIni: 16, tingkatKehadiran: 100, statusLogbook: "Terisi Lengkap" },
  { id: "G-002", nama: "Mr. Andi", spesialisasi: "Math & Logic", totalSesiBulanIni: 14, tingkatKehadiran: 93, statusLogbook: "Terisi Lengkap" },
  { id: "G-003", nama: "Ms. Nina", spesialisasi: "Phonics & Reading", totalSesiBulanIni: 18, tingkatKehadiran: 95, statusLogbook: "Terisi Lengkap" },
  { id: "G-004", nama: "Mr. Budi", spesialisasi: "English & Coding Kids", totalSesiBulanIni: 12, tingkatKehadiran: 90, statusLogbook: "1 Sesi Pending" },
];

// Mock monthly logbook & absensi calendar entries for selected teacher
const mockCalendarData: Record<string, { tanggal: string; dayNum: number; status: "Hadir" | "Izin" | "Kosong"; kelas: string; materi: string; siswaHadir: string; catatan: string }[]> = {
  "G-001": [
    { tanggal: "2026-09-01", dayNum: 1, status: "Hadir", kelas: "Calistung A", materi: "Mengenal Huruf Vokal dan Angka 1-10", siswaHadir: "6 / 6 Siswa", catatan: "Siswa sangat antusias dan mengikuti dengan lancar." },
    { tanggal: "2026-09-03", dayNum: 3, status: "Hadir", kelas: "English B1", materi: "Basic Greetings & Phonics Blends", siswaHadir: "5 / 5 Siswa", catatan: "Review kosa kata harian & latihan pengucapan." },
    { tanggal: "2026-09-07", dayNum: 7, status: "Hadir", kelas: "Calistung A", materi: "Membaca Suku Kata Terbuka (Ba, Bi, Bu)", siswaHadir: "6 / 6 Siswa", catatan: "Latihan mendikte kata-kata sederhana." },
    { tanggal: "2026-09-10", dayNum: 10, status: "Hadir", kelas: "English B1", materi: "Vocabulary: Colors & Animals", siswaHadir: "5 / 5 Siswa", catatan: "Menggunakan kartu alfabet bergambar." },
  ],
  "G-002": [
    { tanggal: "2026-09-02", dayNum: 2, status: "Hadir", kelas: "Math Level 1", materi: "Penjumlahan Bergambar 1-20", siswaHadir: "5 / 5 Siswa", catatan: "Menggunakan media hitung stik warna." },
    { tanggal: "2026-09-04", dayNum: 4, status: "Hadir", kelas: "Math Level 2", materi: "Pengurangan dan Permainan Logika", siswaHadir: "4 / 4 Siswa", catatan: "Siswa dapat menyelesaikan soal tantangan." },
  ],
};

export default function AdminAbsensiPage() {
  const [selectedGuru, setSelectedGuru] = useState<GuruAbsensiData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [activeLogDetail, setActiveLogDetail] = useState<{ tanggal: string; dayNum: number; status: "Hadir" | "Izin" | "Kosong"; kelas: string; materi: string; siswaHadir: string; catatan: string } | null>(null);

  const teacherLogs = selectedGuru ? (mockCalendarData[selectedGuru.id] || []) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Absensi & Logbook Guru Kursus</h1>
          <p className="page-subtitle">Pilih guru pengajar untuk melihat kalender absensi bulanan dan rincian logbook pengajaran.</p>
        </div>
        {selectedGuru && (
          <button className="btn btn-outline" onClick={() => { setSelectedGuru(null); setActiveLogDetail(null); }}>
            ← Kembali ke Daftar Guru
          </button>
        )}
      </div>

      {/* VIEW 1: DAFTAR SEMUA GURU GURU KURSUS */}
      {!selectedGuru ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-secondary)" }}>
            Daftar Guru Pengajar ({daftarGuru.length} Guru)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {daftarGuru.map(g => (
              <div
                key={g.id}
                className="card"
                onClick={() => setSelectedGuru(g)}
                style={{
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", fontWeight: 900, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {g.nama[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>{g.nama}</h3>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{g.spesialisasi}</div>
                  </div>
                </div>

                <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Sesi Selesai</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.totalSesiBulanIni} Sesi</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Tingkat Kehadiran</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>{g.tingkatKehadiran}%</div>
                  </div>
                </div>

                <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
                  Buka Kalender Logbook &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: KALENDER ABSENSI BULANAN GURU YANG DIPILIH */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card Info Guru */}
          <div className="card" style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22 }}>
                {selectedGuru.nama[0]}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedGuru.nama}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{selectedGuru.spesialisasi} · Total {selectedGuru.totalSesiBulanIni} Sesi Pengajaran</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select className="select-control" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: "8px 14px", fontSize: 13, background: "#fff", color: "#0f172a", fontWeight: 700 }}>
                <option value="September 2026">September 2026</option>
                <option value="Agustus 2026">Agustus 2026</option>
              </select>
            </div>
          </div>

          {/* Grid Kalender Bulanan */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                Kalender Presensi & Logbook — {selectedMonth}
              </h2>
              <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: "#059669" }}>● Hadir & Logbook Terisi</span>
                <span style={{ color: "#b45309" }}>● Izin / Pending</span>
                <span style={{ color: "#94a3b8" }}>● Tidak Ada Kelas</span>
              </div>
            </div>

            {/* Matrix Day Grid (30 Days) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", paddingBottom: 6 }}>
                  {d}
                </div>
              ))}

              {Array.from({ length: 30 }, (_, index) => {
                const dayNum = index + 1;
                const logEntry = teacherLogs.find(l => l.dayNum === dayNum);

                return (
                  <div
                    key={dayNum}
                    onClick={() => logEntry && setActiveLogDetail(logEntry)}
                    style={{
                      background: logEntry ? (logEntry.status === "Hadir" ? "#f0fdf4" : "#fef3c7") : "#f8fafc",
                      border: logEntry ? (logEntry.status === "Hadir" ? "1.5px solid #86efac" : "1.5px solid #fde047") : "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: 10,
                      minHeight: 85,
                      cursor: logEntry ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: logEntry ? "#0f172a" : "#94a3b8" }}>{dayNum}</span>
                      {logEntry && (
                        <span style={{ background: logEntry.status === "Hadir" ? "#d1fae5" : "#fef3c7", color: logEntry.status === "Hadir" ? "#059669" : "#b45309", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>
                          {logEntry.status}
                        </span>
                      )}
                    </div>

                    {logEntry ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {logEntry.kelas}
                        </div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{logEntry.siswaHadir}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: "#cbd5e1", fontStyle: "italic" }}>Libur / Kosong</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Rincian Detail Logbook yang Diklik */}
          {activeLogDetail && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "#fff", borderRadius: 18, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Detail Logbook Pengajaran</h3>
                  <button onClick={() => setActiveLogDetail(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>✕</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#166534" }}>{activeLogDetail.tanggal} · {activeLogDetail.kelas}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#15803d", marginTop: 4 }}>{activeLogDetail.materi}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Presensi Kehadiran Siswa</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginTop: 2 }}>{activeLogDetail.siswaHadir}</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Status Verifikasi</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7", marginTop: 2 }}>Terverifikasi Admin</div>
                    </div>
                  </div>

                  <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Catatan Jurnal Pengajar</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{activeLogDetail.catatan}</div>
                  </div>

                  <button className="btn btn-accent" style={{ marginTop: 8 }} onClick={() => setActiveLogDetail(null)}>Tutup Rincian</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
