"use client";

import { useState } from "react";
import Link from "next/link";

export interface SiswaAbsenItem {
  nama: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alpha";
  catatan?: string;
}

export interface LogbookEntry {
  id: string;
  tanggal: string; // YYYY-MM-DD
  tglDisplay: string; // e.g. "Selasa, 1 Sept 2026"
  tglShort: string;
  dayNum: number;
  bulanKey: string; // "2026-09"
  kelas: string;
  program: string;
  jam: string;
  ruang: string;
  pertemuan: number;
  totalPertemuan: number;
  materi: string;
  catatanGuru: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  status: "Selesai" | "Hari Ini" | "Mendatang";
  warna: string;
  siswaAbsensi: SiswaAbsenItem[];
}

const initialLogbookData: LogbookEntry[] = [
  {
    id: "LOG-0901",
    tanggal: "2026-09-01",
    tglDisplay: "Selasa, 1 September 2026",
    tglShort: "1 Sep",
    dayNum: 1,
    bulanKey: "2026-09",
    kelas: "KLS-D",
    program: "Phonics Starter",
    jam: "16:00–17:00",
    ruang: "Ruang 3",
    pertemuan: 1,
    totalPertemuan: 8,
    materi: "Letter Sounds: /s/, /a/, /t/ & Flashcards Game",
    catatanGuru: "Dian Pratama izin sakit flu (surat terlampir). Siswa lainnya sangat aktif dan lancar membedakan artikulasi sound /s/ dan /a/.",
    hadir: 4,
    izin: 1,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#d97706",
    siswaAbsensi: [
      { nama: "Bagas Ramadhan", status: "Hadir" },
      { nama: "Elsa Putri", status: "Hadir" },
      { nama: "Galih Wibowo", status: "Hadir" },
      { nama: "Dian Pratama", status: "Izin", catatan: "Izin Sakit Flu (Surat Dokter)" },
      { nama: "Joko Santoso", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0902",
    tanggal: "2026-09-02",
    tglDisplay: "Rabu, 2 September 2026",
    tglShort: "2 Sep",
    dayNum: 2,
    bulanKey: "2026-09",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 7,
    totalPertemuan: 12,
    materi: "Mengenal Suku Kata Ba-Bi-Bu-Be-Bo & Dikte 5 Kata Sederhana",
    catatanGuru: "Siswa sangat antusias! Semua dapat membaca suku kata Ba-Bi-Bu-Be-Bo tanpa kebingungan. Andi Setiawan mendapat skor sempurna pada dikte.",
    hadir: 6,
    izin: 0,
    sakit: 0,
    alpha: 0,
    status: "Hari Ini",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0904",
    tanggal: "2026-09-04",
    tglDisplay: "Jumat, 4 September 2026",
    tglShort: "4 Sep",
    dayNum: 4,
    bulanKey: "2026-09",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 8,
    totalPertemuan: 12,
    materi: "Latihan Menulis Angka 1–20 & Berhitung Visual Gambar",
    catatanGuru: "Citra Kirana izin karena acara keluarga. Andi Setiawan perlu pendampingan cara memegang pensil yang benar agar tidak cepat lelah.",
    hadir: 5,
    izin: 1,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir", catatan: "Pendampingan pegang pensil" },
      { nama: "Citra Kirana", status: "Izin", catatan: "Acara Keluarga" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0905",
    tanggal: "2026-09-05",
    tglDisplay: "Sabtu, 5 September 2026",
    tglShort: "5 Sep",
    dayNum: 5,
    bulanKey: "2026-09",
    kelas: "KLS-D",
    program: "Phonics Starter",
    jam: "13:00–14:00",
    ruang: "Ruang 3",
    pertemuan: 2,
    totalPertemuan: 8,
    materi: "Blending Sound /s/, /a/, /t/ menjadi Kata (SAT, PAT, TAP)",
    catatanGuru: "Luar biasa! Seluruh 5 siswa berhasil membunyikan dan menggabungkan huruf menjadi kata 3 huruf secara mandiri.",
    hadir: 5,
    izin: 0,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#d97706",
    siswaAbsensi: [
      { nama: "Bagas Ramadhan", status: "Hadir" },
      { nama: "Elsa Putri", status: "Hadir" },
      { nama: "Galih Wibowo", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Joko Santoso", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0908",
    tanggal: "2026-09-08",
    tglDisplay: "Selasa, 8 September 2026",
    tglShort: "8 Sep",
    dayNum: 8,
    bulanKey: "2026-09",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 9,
    totalPertemuan: 12,
    materi: "Membaca Kalimat Sederhana 3 Kata & Latihan Menulis Rapi",
    catatanGuru: "Fokus anak-anak meningkat drastis. Latihan membaca cerita bergambar singkat berjalan lancar.",
    hadir: 6,
    izin: 0,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0910",
    tanggal: "2026-09-10",
    tglDisplay: "Kamis, 10 September 2026",
    tglShort: "10 Sep",
    dayNum: 10,
    bulanKey: "2026-09",
    kelas: "KLS-D",
    program: "Phonics Starter",
    jam: "16:00–17:00",
    ruang: "Ruang 3",
    pertemuan: 3,
    totalPertemuan: 8,
    materi: "Sound /i/, /n/, /m/ & Game Flashcard Interaktif",
    catatanGuru: "Dian Pratama sakit demam. Galih Wibowo memenangkan kuis tebak kata phonic dengan 15 skor tepat.",
    hadir: 4,
    izin: 0,
    sakit: 1,
    alpha: 0,
    status: "Selesai",
    warna: "#d97706",
    siswaAbsensi: [
      { nama: "Bagas Ramadhan", status: "Hadir" },
      { nama: "Elsa Putri", status: "Hadir" },
      { nama: "Galih Wibowo", status: "Hadir" },
      { nama: "Dian Pratama", status: "Sakit", catatan: "Sakit Demam Tinggi" },
      { nama: "Joko Santoso", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0915",
    tanggal: "2026-09-15",
    tglDisplay: "Selasa, 15 September 2026",
    tglShort: "15 Sep",
    dayNum: 15,
    bulanKey: "2026-09",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 10,
    totalPertemuan: 12,
    materi: "Review Evaluasi Suku Kata & Mewarnai Huruf Vokal",
    catatanGuru: "Persiapan menuju ujian kelulusan Calistung Level 1. Semua siswa siap maju level berikutnya.",
    hadir: 6,
    izin: 0,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  // Agustus 2026 entries for month navigation
  {
    id: "LOG-0823",
    tanggal: "2026-08-23",
    tglDisplay: "Minggu, 23 Agustus 2026",
    tglShort: "23 Agt",
    dayNum: 23,
    bulanKey: "2026-08",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 5,
    totalPertemuan: 12,
    materi: "Latihan Menulis Angka 1–20 & Mengenal Bentuk Geometri",
    catatanGuru: "Andi Setiawan perlu pendampingan cara memegang pensil. Siswa lain aman.",
    hadir: 5,
    izin: 1,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Izin" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0828",
    tanggal: "2026-08-28",
    tglDisplay: "Jumat, 28 Agustus 2026",
    tglShort: "28 Agt",
    dayNum: 28,
    bulanKey: "2026-08",
    kelas: "KLS-D",
    program: "Phonics Starter",
    jam: "13:00–14:00",
    ruang: "Ruang 3",
    pertemuan: 1,
    totalPertemuan: 8,
    materi: "Letter Sounds: /s/, /a/, /t/ & Phonics Song",
    catatanGuru: "Dian Pratama izin karena sakit. Pengenalan awal berjalan menyenangkan.",
    hadir: 4,
    izin: 1,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#d97706",
    siswaAbsensi: [
      { nama: "Bagas Ramadhan", status: "Hadir" },
      { nama: "Elsa Putri", status: "Hadir" },
      { nama: "Galih Wibowo", status: "Hadir" },
      { nama: "Dian Pratama", status: "Izin" },
      { nama: "Joko Santoso", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0830",
    tanggal: "2026-08-30",
    tglDisplay: "Minggu, 30 Agustus 2026",
    tglShort: "30 Agt",
    dayNum: 30,
    bulanKey: "2026-08",
    kelas: "KLS-A",
    program: "Calistung Level 1",
    jam: "14:00–15:00",
    ruang: "Ruang 1",
    pertemuan: 6,
    totalPertemuan: 12,
    materi: "Mengenal Suku Kata & Dikte Singkat 3 Kata",
    catatanGuru: "Siswa sangat antusias, semua dapat membaca suku kata Ba-Bi-Bu-Be-Bo.",
    hadir: 6,
    izin: 0,
    sakit: 0,
    alpha: 0,
    status: "Selesai",
    warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" },
      { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" },
      { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
];

const listBulan = [
  { key: "2026-08", label: "Agustus 2026", days: 31, offsetStart: 5 }, // Aug 1 is Saturday (offset 5)
  { key: "2026-09", label: "September 2026", days: 30, offsetStart: 1 }, // Sept 1 is Tuesday (offset 1)
  { key: "2026-10", label: "Oktober 2026", days: 31, offsetStart: 3 }, // Oct 1 is Thursday (offset 3)
];

export default function GuruKalenderLogbookPage() {
  const [selectedBulanKey, setSelectedBulanKey] = useState("2026-09");
  const [logbookList, setLogbookList] = useState<LogbookEntry[]>(initialLogbookData);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<{ dayNum: number; dateStr: string } | null>(null);
  const [cari, setCari] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [viewMode, setViewMode] = useState<"kalender" | "tabel">("kalender");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMateri, setEditMateri] = useState("");
  const [editCatatan, setEditCatatan] = useState("");

  const currentBulanObj = listBulan.find((b) => b.key === selectedBulanKey) || listBulan[1];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Navigasi bulan
  const handlePrevBulan = () => {
    const idx = listBulan.findIndex((b) => b.key === selectedBulanKey);
    if (idx > 0) setSelectedBulanKey(listBulan[idx - 1].key);
  };

  const handleNextBulan = () => {
    const idx = listBulan.findIndex((b) => b.key === selectedBulanKey);
    if (idx < listBulan.length - 1) setSelectedBulanKey(listBulan[idx + 1].key);
  };

  // Click on date item
  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
    const found = logbookList.find(
      (l) => l.tanggal === dateStr && (filterKelas === "Semua" || l.kelas === filterKelas)
    );
    if (found) {
      setSelectedLogbook(found);
      setEditMateri(found.materi);
      setEditCatatan(found.catatanGuru);
      setIsEditing(false);
    } else {
      setSelectedEmptyDay({ dayNum, dateStr });
    }
  };

  // Filter logbook list
  const logbookBulanIni = logbookList.filter((l) => l.bulanKey === selectedBulanKey);
  const terfilter = logbookBulanIni.filter((l) => {
    const matchKelas = filterKelas === "Semua" || l.kelas === filterKelas;
    const matchSearch =
      l.materi.toLowerCase().includes(cari.toLowerCase()) ||
      l.kelas.toLowerCase().includes(cari.toLowerCase()) ||
      l.catatanGuru.toLowerCase().includes(cari.toLowerCase());
    return matchKelas && matchSearch;
  });

  // Simpan Edit Logbook
  const handleSaveEdit = () => {
    if (!selectedLogbook) return;
    const updated = logbookList.map((item) => {
      if (item.id === selectedLogbook.id) {
        return { ...item, materi: editMateri, catatanGuru: editCatatan };
      }
      return item;
    });
    setLogbookList(updated);
    setSelectedLogbook({ ...selectedLogbook, materi: editMateri, catatanGuru: editCatatan });
    setIsEditing(false);
    showToast("Logbook berhasil diperbarui!");
  };

  // Dynamic Array for days of current month
  const calendarDays = Array.from({ length: currentBulanObj.days }, (_, i) => i + 1);
  const emptyOffsets = Array.from({ length: currentBulanObj.offsetStart }, (_, i) => i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        
        .cal-tile {
          min-height: 110px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border-light);
          background: #ffffff;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          cursor: pointer;
        }
        .cal-tile:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 20px rgba(26, 92, 138, 0.12);
          transform: translateY(-2px);
          z-index: 2;
        }
        .cal-tile.active-day {
          border-color: var(--color-primary);
          background: #f0f9ff;
        }
        .cal-tile.has-logbook {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .cal-tile.has-logbook:hover {
          background: #ffffff;
          border-color: var(--color-primary);
        }
        .btn-tab {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s;
          border: 1.5px solid var(--color-border);
          background: white;
          color: var(--color-text-secondary);
        }
        .btn-tab.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(26, 92, 138, 0.2);
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13.5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "toastIn 0.25s ease-out",
          }}
        >
          <span style={{ color: "#10b981", fontSize: 13, fontWeight: 800 }}>[INFO]</span>
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kalender & History Logbook Mengajar</h1>
          <p className="page-subtitle">
            Klik pada tanggal manapun (misal: Tanggal 1, 5, 8, 15) untuk melihat detail logbook, absensi siswa, dan catatan aktivitas harian.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={`btn-tab ${viewMode === "kalender" ? "active" : ""}`}
            onClick={() => setViewMode("kalender")}
          >
            Kalender Interaktif
          </button>
          <button
            className={`btn-tab ${viewMode === "tabel" ? "active" : ""}`}
            onClick={() => setViewMode("tabel")}
          >
            Tabel History
          </button>
        </div>
      </div>

      {/* Stat Cards Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="stat-card">
          <span className="stat-card-label">Sesi Selesai Bulan Ini</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#059669" }}>
            {logbookBulanIni.length} Sesi
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{currentBulanObj.label}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Logbook Terisi</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#1d4ed8" }}>
            100%
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Semua sesi terdata</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Rata-rata Kehadiran</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#7c3aed" }}>
            95.8%
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Dari seluruh kelas</div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Catatan Khusus Siswa</span>
          <div className="stat-card-value" style={{ fontSize: 26, color: "#d97706" }}>
            4 Catatan
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Perlu pendampingan/Izin</div>
        </div>
      </div>

      {/* Toolbar: Navigation Month + Filters */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          {/* Month Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handlePrevBulan}
              disabled={listBulan.findIndex((b) => b.key === selectedBulanKey) === 0}
              style={{ fontWeight: 800 }}
            >
              &larr; Bulan Sebelumnya
            </button>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "var(--color-primary)",
                padding: "4px 14px",
                background: "var(--color-bg)",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
              }}
            >
              {currentBulanObj.label}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleNextBulan}
              disabled={
                listBulan.findIndex((b) => b.key === selectedBulanKey) === listBulan.length - 1
              }
              style={{ fontWeight: 800 }}
            >
              Bulan Berikutnya &rarr;
            </button>
          </div>

          {/* Quick Month Pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {listBulan.map((b) => (
              <button
                key={b.key}
                onClick={() => setSelectedBulanKey(b.key)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  background: selectedBulanKey === b.key ? "var(--color-primary)" : "transparent",
                  color: selectedBulanKey === b.key ? "#fff" : "var(--color-text-muted)",
                  borderColor: selectedBulanKey === b.key ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Search & Filter Kelas */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260, justifyContent: "flex-end" }}>
            <input
              className="search-input"
              style={{ maxWidth: 240, fontSize: 13 }}
              placeholder="Cari materi atau catatan..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="Semua">Semua Kelas</option>
              <option value="KLS-A">KLS-A — Calistung L1</option>
              <option value="KLS-D">KLS-D — Phonics Starter</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEWMODE 1: KALENDER GRID INTERAKTIF */}
      {viewMode === "kalender" && (
        <div className="card" style={{ padding: 22, overflowX: "auto" }}>
          {/* Header 7 Hari */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 10,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((h, i) => (
              <div
                key={h}
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: i >= 5 ? "#dc2626" : "var(--color-text-muted)",
                  textTransform: "uppercase",
                  padding: 6,
                  background: "var(--color-bg)",
                  borderRadius: 8,
                  letterSpacing: "0.05em",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {/* Empty Offsets */}
            {emptyOffsets.map((_, idx) => (
              <div
                key={`offset-${idx}`}
                className="cal-tile"
                style={{ opacity: 0.35, background: "#f8fafc", cursor: "default" }}
              >
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>–</span>
              </div>
            ))}

            {/* Days of Month */}
            {calendarDays.map((dayNum) => {
              const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
              const found = logbookList.find(
                (l) => l.tanggal === dateStr && (filterKelas === "Semua" || l.kelas === filterKelas)
              );

              const isHighlightedDate = [1, 5, 2, 4, 8, 10, 15, 23, 28, 30].includes(dayNum);

              return (
                <div
                  key={dayNum}
                  className={`cal-tile ${found ? "has-logbook" : ""}`}
                  onClick={() => handleDayClick(dayNum)}
                  style={{
                    borderColor: found
                      ? found.warna
                      : isHighlightedDate
                      ? "var(--color-primary)"
                      : "var(--color-border-light)",
                    background: found
                      ? `${found.warna}0d`
                      : "#ffffff",
                  }}
                >
                  {/* Top Bar inside Tile */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: found ? "var(--color-text-primary)" : "#64748b",
                        background: found ? "#fff" : "transparent",
                        padding: found ? "2px 8px" : 0,
                        borderRadius: 6,
                        boxShadow: found ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      Tgl {dayNum}
                    </span>

                    {found && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 999,
                          background: found.warna,
                          color: "#fff",
                        }}
                      >
                        {found.kelas}
                      </span>
                    )}
                  </div>

                  {/* Content inside Tile */}
                  {found ? (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: "var(--color-text-primary)",
                          lineHeight: 1.25,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {found.materi}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#059669",
                            background: "#d1fae5",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {found.hadir} Hadir
                        </span>
                        {found.izin > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#b45309",
                              background: "#fef3c7",
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {found.izin} Izin
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 10.5,
                          color: "var(--color-primary)",
                          fontWeight: 800,
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        Detail History Logbook &rarr;
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#cbd5e1",
                        marginTop: 18,
                        fontStyle: "italic",
                      }}
                    >
                      Klik untuk info
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEWMODE 2: TABEL HISTORY LOGBOOK */}
      {viewMode === "tabel" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="card-title">Daftar History Logbook ({terfilter.length} Sesi)</h2>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Periode: {currentBulanObj.label}</span>
          </div>

          {terfilter.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Tanggal & Waktu", "Kelas & Program", "Materi Pembelajaran", "Kehadiran Siswa", "Catatan Guru", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          fontWeight: 800,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {terfilter.map((l, idx) => (
                  <tr
                    key={l.id}
                    style={{
                      borderBottom: idx < terfilter.length - 1 ? "1px solid var(--color-border-light)" : "none",
                      transition: "background .15s",
                    }}
                  >
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 800, color: "var(--color-text-primary)" }}>{l.tglDisplay}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{l.jam} · {l.ruang}</div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: l.warna }}>{l.kelas}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{l.program}</div>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--color-text-primary)", maxWidth: 260 }}>
                      {l.materi}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          {l.hadir} Hadir
                        </span>
                        {l.izin > 0 && (
                          <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                            {l.izin} Izin
                          </span>
                        )}
                        {l.sakit > 0 && (
                          <span style={{ background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                            {l.sakit} Sakit
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-secondary)", fontStyle: "italic", maxWidth: 280 }}>
                      "{l.catatanGuru}"
                    </td>

                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          setSelectedLogbook(l);
                          setEditMateri(l.materi);
                          setEditCatatan(l.catatanGuru);
                          setIsEditing(false);
                        }}
                      >
                        Buka Logbook
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>
                Tidak ada logbook ditemukan untuk filter ini.
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
                Coba ganti kata kunci pencarian atau pilih bulan lain.
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DETAIL HISTORY LOGBOOK DIKLIK TANGGAL (E.G. TGL 1, 5, DSB) */}
      {selectedLogbook && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(5px)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              maxWidth: 640,
              width: "100%",
              padding: 28,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              animation: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
                borderBottom: "1px solid var(--color-border-light)",
                paddingBottom: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      background: selectedLogbook.warna,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {selectedLogbook.kelas}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)" }}>
                    ID Logbook: {selectedLogbook.id}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)", margin: 0 }}>
                  History Logbook: {selectedLogbook.tglDisplay}
                </h2>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {selectedLogbook.program} · Pertemuan Ke-{selectedLogbook.pertemuan} dari {selectedLogbook.totalPertemuan} · {selectedLogbook.jam} · {selectedLogbook.ruang}
                </div>
              </div>

              <button
                onClick={() => setSelectedLogbook(null)}
                style={{
                  background: "var(--color-bg)",
                  border: "none",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            {!isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Topic / Materi Pembelajaran Box */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                    border: "1.5px solid #bae6fd",
                    borderRadius: 14,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#0369a1",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Topik & Rangkuman Materi Pembelajaran
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", lineHeight: 1.4 }}>
                    {selectedLogbook.materi}
                  </div>
                </div>

                {/* Presensi Breakdown */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-primary)", textTransform: "uppercase" }}>
                      Rekap Kehadiran Siswa
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                        {selectedLogbook.hadir} Hadir
                      </span>
                      {selectedLogbook.izin > 0 && (
                        <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          {selectedLogbook.izin} Izin
                        </span>
                      )}
                      {selectedLogbook.sakit > 0 && (
                        <span style={{ background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                          {selectedLogbook.sakit} Sakit
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {selectedLogbook.siswaAbsensi.map((s, i) => {
                      const bgStatus =
                        s.status === "Hadir"
                          ? "#d1fae5"
                          : s.status === "Izin"
                          ? "#fef3c7"
                          : s.status === "Sakit"
                          ? "#fce7f3"
                          : "#fee2e2";
                      const colorStatus =
                        s.status === "Hadir"
                          ? "#059669"
                          : s.status === "Izin"
                          ? "#b45309"
                          : s.status === "Sakit"
                          ? "#be185d"
                          : "#dc2626";

                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "var(--color-bg)",
                            borderRadius: 10,
                            border: "1px solid var(--color-border-light)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: bgStatus,
                                color: colorStatus,
                                fontWeight: 800,
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {s.nama[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                                {s.nama}
                              </div>
                              {s.catatan && (
                                <div style={{ fontSize: 11, color: colorStatus, fontWeight: 600 }}>
                                  {s.catatan}
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            style={{
                              background: bgStatus,
                              color: colorStatus,
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: 999,
                            }}
                          >
                            {s.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Guru / Perilaku */}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Catatan Guru & Refleksi Mengajar
                  </div>
                  <div
                    style={{
                      background: "var(--color-bg)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      fontSize: 13.5,
                      color: "var(--color-text-primary)",
                      lineHeight: 1.6,
                      border: "1px solid var(--color-border-light)",
                      fontStyle: "italic",
                    }}
                  >
                    "{selectedLogbook.catatanGuru}"
                  </div>
                </div>

                {/* Modal Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsEditing(true)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Edit Logbook
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => showToast("Format Laporan Logbook PDF telah diunduh!")}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Unduh PDF
                  </button>
                  <button
                    className="btn btn-accent"
                    onClick={() => showToast("Ringkasan logbook berhasil dikirim ke aplikasi Orang Tua!")}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Kirim ke Ortu
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT MODE INSIDE MODAL */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>
                  Mode Edit Logbook ({selectedLogbook.tglDisplay})
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
                    Materi Pembelajaran
                  </label>
                  <textarea
                    value={editMateri}
                    onChange={(e) => setEditMateri(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 80,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1.5px solid var(--color-border)",
                      fontSize: 13.5,
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
                    Catatan Refleksi Guru
                  </label>
                  <textarea
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 100,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1.5px solid var(--color-border)",
                      fontSize: 13.5,
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                    Batal
                  </button>
                  <button className="btn btn-accent" onClick={handleSaveEdit} style={{ flex: 1, justifyContent: "center" }}>
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: TANGGAL KOSONG DIKLIK */}
      {selectedEmptyDay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              maxWidth: 460,
              width: "100%",
              padding: 26,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              animation: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: 0 }}>
                Tanggal {selectedEmptyDay.dayNum} ({currentBulanObj.label})
              </h3>
              <button
                onClick={() => setSelectedEmptyDay(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>
              Belum ada logbook yang diisi untuk tanggal {selectedEmptyDay.dayNum} {currentBulanObj.label}. Apakah Anda ingin membuka jadwal mengajar atau membuat logbook kelas susulan?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/guru/jadwal"
                className="btn btn-accent"
                style={{ textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Buka Jadwal Mengajar Sesi Ini
              </Link>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedEmptyDay(null);
                  showToast(`Draft Logbook untuk Tanggal ${selectedEmptyDay.dayNum} disiapkan.`);
                }}
              >
                Tambah Logbook Susulan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
