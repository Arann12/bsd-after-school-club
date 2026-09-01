"use client";
import { useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export interface SiswaLogDetail {
  nama: string;
  status: "Hadir" | "Izin" | "Alpha";
  catatanGuru: string;
  nilai?: string; // optional assessment/nilai
}

export interface LogEntry {
  tanggal: string;
  dayNum: number;
  hari: string;
  status: "Hadir" | "Izin" | "Kosong";
  kelas: string;
  program: string;
  materi: string;
  siswaHadir: string; // summary string
  catatan: string;    // catatan keseluruhan guru
  daftarSiswa: SiswaLogDetail[];
}

export interface GuruAbsensiData {
  id: string;
  nama: string;
  spesialisasi: string;
  totalSesiBulanIni: number;
  tingkatKehadiran: number;
  statusLogbook: string;
}

/* ─────────────────────────────────────────────
   MOCK DATA — GURU
───────────────────────────────────────────── */
const daftarGuru: GuruAbsensiData[] = [
  { id: "G-001", nama: "Ms. Sarah", spesialisasi: "Calistung & English", totalSesiBulanIni: 16, tingkatKehadiran: 100, statusLogbook: "Terisi Lengkap" },
  { id: "G-002", nama: "Mr. Andi", spesialisasi: "Math & Logic", totalSesiBulanIni: 14, tingkatKehadiran: 93, statusLogbook: "Terisi Lengkap" },
  { id: "G-003", nama: "Ms. Nina", spesialisasi: "Phonics & Reading", totalSesiBulanIni: 18, tingkatKehadiran: 95, statusLogbook: "Terisi Lengkap" },
  { id: "G-004", nama: "Mr. Budi", spesialisasi: "English & Coding Kids", totalSesiBulanIni: 12, tingkatKehadiran: 90, statusLogbook: "1 Sesi Pending" },
];

/* ─────────────────────────────────────────────
   MOCK DATA — LOGBOOK PER GURU (dengan daftar siswa)
───────────────────────────────────────────── */
const mockCalendarData: Record<string, LogEntry[]> = {
  "G-001": [
    {
      tanggal: "2026-09-01",
      dayNum: 1,
      hari: "Senin",
      status: "Hadir",
      kelas: "Calistung A",
      program: "Calistung Level 1",
      materi: "Mengenal Huruf Vokal dan Angka 1–10",
      siswaHadir: "6 / 6 Siswa",
      catatan: "Seluruh siswa sangat antusias dan mengikuti pelajaran dengan sangat lancar. Disarankan lanjut ke materi suku kata minggu depan.",
      daftarSiswa: [
        { nama: "Aira Putri Salsabila", status: "Hadir", catatanGuru: "Aktif dan cepat memahami vokal.", nilai: "A" },
        { nama: "Bima Raharjo", status: "Hadir", catatanGuru: "Perlu latihan menulis angka lebih banyak.", nilai: "B+" },
        { nama: "Citra Ayu Dewi", status: "Hadir", catatanGuru: "Sudah lancar mengidentifikasi semua huruf vokal.", nilai: "A" },
        { nama: "Dito Firmansyah", status: "Hadir", catatanGuru: "Konsentrasi baik, perlu dibimbing di angka 8 dan 9.", nilai: "B" },
        { nama: "Elsa Nuraini", status: "Hadir", catatanGuru: "Sangat aktif bertanya, perkembangan sangat pesat.", nilai: "A+" },
        { nama: "Fadhil Akbar", status: "Hadir", catatanGuru: "Sudah fasih menulis angka 1–10 tanpa bantuan.", nilai: "A" },
      ],
    },
    {
      tanggal: "2026-09-03",
      dayNum: 3,
      hari: "Rabu",
      status: "Hadir",
      kelas: "English B1",
      program: "English Beginner",
      materi: "Basic Greetings & Phonics Blends",
      siswaHadir: "4 / 5 Siswa",
      catatan: "Review kosa kata harian & latihan pengucapan berjalan baik. Satu siswa izin sakit.",
      daftarSiswa: [
        { nama: "Ghina Maharani", status: "Hadir", catatanGuru: "Pengucapan sangat baik, aktif di sesi percakapan.", nilai: "A" },
        { nama: "Hendra Kusuma", status: "Hadir", catatanGuru: "Perlu latihan pengucapan 'th' lebih banyak.", nilai: "B+" },
        { nama: "Indah Permata", status: "Izin", catatanGuru: "Izin sakit, perlu catch-up di sesi berikutnya.", nilai: "-" },
        { nama: "Joko Santoso", status: "Hadir", catatanGuru: "Hafal semua greetings dengan benar.", nilai: "A-" },
        { nama: "Kiki Ramadhani", status: "Hadir", catatanGuru: "Sudah bisa menyusun kalimat perkenalan sederhana.", nilai: "A" },
      ],
    },
    {
      tanggal: "2026-09-07",
      dayNum: 7,
      hari: "Senin",
      status: "Hadir",
      kelas: "Calistung A",
      program: "Calistung Level 1",
      materi: "Membaca Suku Kata Terbuka (Ba, Bi, Bu, Be, Bo)",
      siswaHadir: "6 / 6 Siswa",
      catatan: "Latihan mendikte kata-kata sederhana berjalan dengan lancar. Semua siswa hadir.",
      daftarSiswa: [
        { nama: "Aira Putri Salsabila", status: "Hadir", catatanGuru: "Sudah lancar membaca suku kata terbuka.", nilai: "A" },
        { nama: "Bima Raharjo", status: "Hadir", catatanGuru: "Masih perlu latihan suku 'bu' dan 'bo'.", nilai: "B" },
        { nama: "Citra Ayu Dewi", status: "Hadir", catatanGuru: "Membaca dengan fasih dan percaya diri.", nilai: "A+" },
        { nama: "Dito Firmansyah", status: "Hadir", catatanGuru: "Perkembangan bagus dari sesi sebelumnya.", nilai: "B+" },
        { nama: "Elsa Nuraini", status: "Hadir", catatanGuru: "Membantu teman-temannya dengan semangat.", nilai: "A+" },
        { nama: "Fadhil Akbar", status: "Hadir", catatanGuru: "Sudah mampu dikte 5 kata tanpa kesalahan.", nilai: "A" },
      ],
    },
    {
      tanggal: "2026-09-10",
      dayNum: 10,
      hari: "Rabu",
      status: "Hadir",
      kelas: "English B1",
      program: "English Beginner",
      materi: "Vocabulary: Colors & Animals",
      siswaHadir: "5 / 5 Siswa",
      catatan: "Menggunakan kartu alfabet bergambar. Semua siswa antusias dengan permainan kosakata.",
      daftarSiswa: [
        { nama: "Ghina Maharani", status: "Hadir", catatanGuru: "Hapal 20+ kosakata warna dan hewan.", nilai: "A+" },
        { nama: "Hendra Kusuma", status: "Hadir", catatanGuru: "Perlu bantuan mengeja nama hewan yang panjang.", nilai: "B" },
        { nama: "Indah Permata", status: "Hadir", catatanGuru: "Kembali hadir, langsung aktif berpartisipasi.", nilai: "A-" },
        { nama: "Joko Santoso", status: "Hadir", catatanGuru: "Berhasil memenangkan kuis kosakata kelas.", nilai: "A+" },
        { nama: "Kiki Ramadhani", status: "Hadir", catatanGuru: "Sudah bisa menyebutkan warna dalam kalimat.", nilai: "A" },
      ],
    },
  ],
  "G-002": [
    {
      tanggal: "2026-09-02",
      dayNum: 2,
      hari: "Selasa",
      status: "Hadir",
      kelas: "Math Level 1",
      program: "Math Starter",
      materi: "Penjumlahan Bergambar 1–20",
      siswaHadir: "5 / 5 Siswa",
      catatan: "Menggunakan media hitung stik warna. Seluruh siswa antusias dan aktif.",
      daftarSiswa: [
        { nama: "Lena Kusumawati", status: "Hadir", catatanGuru: "Cepat menghitung dengan metode bergambar.", nilai: "A" },
        { nama: "Miko Prasetyo", status: "Hadir", catatanGuru: "Masih perlu bantuan untuk angka di atas 15.", nilai: "B" },
        { nama: "Nadia Putri", status: "Hadir", catatanGuru: "Sangat teliti dan rapi dalam mengerjakan soal.", nilai: "A+" },
        { nama: "Oscar Hidayat", status: "Hadir", catatanGuru: "Aktif bertanya, perkembangan sangat baik.", nilai: "A-" },
        { nama: "Putri Rahayu", status: "Hadir", catatanGuru: "Sudah mampu menjumlahkan tanpa stik warna.", nilai: "A" },
      ],
    },
    {
      tanggal: "2026-09-04",
      dayNum: 4,
      hari: "Kamis",
      status: "Hadir",
      kelas: "Math Level 2",
      program: "Math Advanced",
      materi: "Pengurangan dan Permainan Logika",
      siswaHadir: "3 / 4 Siswa",
      catatan: "Siswa dapat menyelesaikan soal tantangan. Satu siswa alpha tidak ada keterangan.",
      daftarSiswa: [
        { nama: "Rafi Auliya", status: "Hadir", catatanGuru: "Menyelesaikan soal pengurangan 3 digit dengan tepat.", nilai: "A" },
        { nama: "Salsa Bella", status: "Alpha", catatanGuru: "Tidak hadir tanpa keterangan, perlu dihubungi orang tua.", nilai: "-" },
        { nama: "Toni Setiawan", status: "Hadir", catatanGuru: "Sangat menyukai permainan logika, sangat cepat.", nilai: "A+" },
        { nama: "Umi Kalsum", status: "Hadir", catatanGuru: "Perlu latihan lebih untuk pengurangan dengan meminjam.", nilai: "B+" },
      ],
    },
  ],
  "G-003": [
    {
      tanggal: "2026-09-01",
      dayNum: 1,
      hari: "Senin",
      status: "Hadir",
      kelas: "Phonics Starter",
      program: "Phonics Level 1",
      materi: "Letter Sounds: /s/, /a/, /t/, /i/, /p/",
      siswaHadir: "6 / 6 Siswa",
      catatan: "Sesi pertama berjalan sangat baik. Semua siswa antusias dengan media kartu fonik.",
      daftarSiswa: [
        { nama: "Vina Aulia", status: "Hadir", catatanGuru: "Sudah bisa mengenali 5 bunyi huruf dengan benar.", nilai: "A" },
        { nama: "Wahyu Pratama", status: "Hadir", catatanGuru: "Perlu latihan bunyi /p/ lebih sering.", nilai: "B+" },
        { nama: "Xena Faradilla", status: "Hadir", catatanGuru: "Perkembangan luar biasa sejak kelas sebelumnya.", nilai: "A+" },
        { nama: "Yusuf Hakim", status: "Hadir", catatanGuru: "Dapat mengidentifikasi semua bunyi tanpa petunjuk.", nilai: "A" },
        { nama: "Zahra Nabilah", status: "Hadir", catatanGuru: "Aktif mengikuti permainan bunyi huruf.", nilai: "A-" },
        { nama: "Arif Budiman", status: "Hadir", catatanGuru: "Menyelesaikan semua latihan lebih cepat dari teman.", nilai: "A+" },
      ],
    },
  ],
  "G-004": [
    {
      tanggal: "2026-09-03",
      dayNum: 3,
      hari: "Rabu",
      status: "Hadir",
      kelas: "English Advanced",
      program: "English Level 3",
      materi: "Present Tense & Daily Routine Sentences",
      siswaHadir: "4 / 5 Siswa",
      catatan: "Sesi berlangsung baik. Satu siswa izin. Materi lanjut ke past tense minggu depan.",
      daftarSiswa: [
        { nama: "Bella Anastasia", status: "Hadir", catatanGuru: "Mampu membuat kalimat rutin harian dengan lancar.", nilai: "A" },
        { nama: "Cipta Nugraha", status: "Izin", catatanGuru: "Izin ada acara keluarga.", nilai: "-" },
        { nama: "Devi Ratnasari", status: "Hadir", catatanGuru: "Aktif berpraktik speaking dengan teman.", nilai: "A-" },
        { nama: "Evan Kristianto", status: "Hadir", catatanGuru: "Sudah faham penggunaan 'do/does' dengan benar.", nilai: "A+" },
        { nama: "Fira Azzahra", status: "Hadir", catatanGuru: "Perlu latihan kalimat negatif lebih banyak.", nilai: "B+" },
      ],
    },
  ],
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const statusColor = (s: SiswaLogDetail["status"]) => {
  if (s === "Hadir") return { bg: "#d1fae5", text: "#065f46" };
  if (s === "Izin") return { bg: "#fef3c7", text: "#92400e" };
  return { bg: "#fee2e2", text: "#991b1b" };
};

const nilaiColor = (n?: string) => {
  if (!n || n === "-") return "#94a3b8";
  if (n.startsWith("A")) return "#059669";
  if (n.startsWith("B")) return "#0284c7";
  return "#64748b";
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function AdminAbsensiPage() {
  const [selectedGuru, setSelectedGuru] = useState<GuruAbsensiData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [activeLogDetail, setActiveLogDetail] = useState<LogEntry | null>(null);

  const teacherLogs = selectedGuru ? (mockCalendarData[selectedGuru.id] || []) : [];

  const rekap = activeLogDetail
    ? {
        hadir: activeLogDetail.daftarSiswa.filter((s) => s.status === "Hadir").length,
        izin: activeLogDetail.daftarSiswa.filter((s) => s.status === "Izin").length,
        alpha: activeLogDetail.daftarSiswa.filter((s) => s.status === "Alpha").length,
        total: activeLogDetail.daftarSiswa.length,
      }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ── */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Absensi &amp; Logbook Guru Kursus</h1>
          <p className="page-subtitle">Pilih guru pengajar untuk melihat kalender absensi bulanan dan rincian logbook pengajaran.</p>
        </div>
        {selectedGuru && (
          <button className="btn btn-outline" onClick={() => { setSelectedGuru(null); setActiveLogDetail(null); }}>
            ← Kembali ke Daftar Guru
          </button>
        )}
      </div>

      {/* ── VIEW 1: DAFTAR GURU ── */}
      {!selectedGuru ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-secondary)" }}>
            Daftar Guru Pengajar ({daftarGuru.length} Guru)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {daftarGuru.map((g) => (
              <div
                key={g.id}
                className="card"
                onClick={() => setSelectedGuru(g)}
                style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
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
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Sesi</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.totalSesiBulanIni} Sesi</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Kehadiran</div>
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
        /* ── VIEW 2: KALENDER ABSENSI ── */
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
              <select className="select-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: "8px 14px", fontSize: 13, background: "#fff", color: "#0f172a", fontWeight: 700 }}>
                <option value="September 2026">September 2026</option>
                <option value="Agustus 2026">Agustus 2026</option>
              </select>
            </div>
          </div>

          {/* Kalender Grid */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                Kalender Presensi &amp; Logbook — {selectedMonth}
              </h2>
              <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: "#059669" }}>● Hadir &amp; Logbook Terisi</span>
                <span style={{ color: "#b45309" }}>● Izin / Pending</span>
                <span style={{ color: "#94a3b8" }}>● Tidak Ada Kelas</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", paddingBottom: 6 }}>{d}</div>
              ))}

              {Array.from({ length: 30 }, (_, index) => {
                const dayNum = index + 1;
                const logEntry = teacherLogs.find((l) => l.dayNum === dayNum);

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
                      transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    }}
                    onMouseEnter={(e) => { if (logEntry) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
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
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{logEntry.kelas}</div>
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
        </div>
      )}

      {/* ── MODAL DETAIL LOGBOOK + DAFTAR SISWA ── */}
      {activeLogDetail && rekap && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveLogDetail(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 680, width: "100%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px -10px rgba(0,0,0,0.35)" }}>
            
            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", padding: "20px 24px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {activeLogDetail.hari}, {activeLogDetail.tanggal}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, margin: "4px 0 2px" }}>{activeLogDetail.kelas}</h3>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{activeLogDetail.program}</div>
                </div>
                <button
                  onClick={() => setActiveLogDetail(null)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", width: 32, height: 32, borderRadius: 8, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>

              {/* Rekap mini */}
              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{rekap.hadir}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>Hadir</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{rekap.izin}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>Izin</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{rekap.alpha}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>Alpha</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{rekap.total}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>Total</div>
                </div>
              </div>
            </div>

            {/* Modal Body — scrollable */}
            <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Materi */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Materi yang Diajarkan</div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>{activeLogDetail.materi}</div>
                </div>
              </div>

              {/* Catatan Guru */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Catatan Jurnal Pengajar</div>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>
                    &ldquo;{activeLogDetail.catatan}&rdquo;
                  </div>
                </div>
              </div>

              {/* Daftar Siswa */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Daftar Siswa Kursus ({activeLogDetail.daftarSiswa.length} Siswa)
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeLogDetail.daftarSiswa.map((siswa, idx) => {
                    const sc = statusColor(siswa.status);
                    return (
                      <div
                        key={idx}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        {/* Avatar */}
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {siswa.nama[0]}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a202c" }}>{siswa.nama}</div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                              {/* Status badge */}
                              <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6 }}>
                                {siswa.status}
                              </span>
                              {/* Nilai badge */}
                              {siswa.nilai && siswa.nilai !== "-" && (
                                <span style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: nilaiColor(siswa.nilai), fontSize: 12, fontWeight: 900, padding: "2px 10px", borderRadius: 6 }}>
                                  {siswa.nilai}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>
                            📝 {siswa.catatanGuru}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Verifikasi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase" }}>Status Verifikasi</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0284c7", marginTop: 2 }}>✓ Terverifikasi Admin</div>
                </div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Tingkat Kehadiran Sesi</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#059669", marginTop: 2 }}>
                    {Math.round((rekap.hadir / rekap.total) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }} onClick={() => setActiveLogDetail(null)}>
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
