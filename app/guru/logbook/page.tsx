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
  tanggal: string;
  tglDisplay: string;
  dayNum: number;
  bulanKey: string;
  kelas: string;
  program: string;
  jam: string;
  ruang: string;
  pertemuan: number;
  totalPertemuan: number;
  materi: string;
  catatanGuru: string;
  hadir: number;
  totalSiswa: number;
  izin: number;
  sakit: number;
  alpha: number;
  status: "Selesai" | "Hari Ini" | "Mendatang";
  warna: string;
  siswaAbsensi: SiswaAbsenItem[];
}

const initialLogbookData: LogbookEntry[] = [
  {
    id: "LOG-0901", tanggal: "2026-09-01", tglDisplay: "Selasa, 1 September 2026", dayNum: 1, bulanKey: "2026-09",
    kelas: "KLS-A", program: "Calistung Level 1", jam: "14:00–15:00", ruang: "Ruang 1", pertemuan: 7, totalPertemuan: 12,
    materi: "Mengenal Suku Kata Ba-Bi-Bu-Be-Bo & Dikte 5 Kata Sederhana",
    catatanGuru: "Siswa sangat antusias! Semua dapat membaca suku kata Ba-Bi-Bu-Be-Bo tanpa kebingungan.",
    hadir: 6, totalSiswa: 6, izin: 0, sakit: 0, alpha: 0, status: "Selesai", warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" }, { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" }, { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" }, { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0903", tanggal: "2026-09-03", tglDisplay: "Kamis, 3 September 2026", dayNum: 3, bulanKey: "2026-09",
    kelas: "KLS-B", program: "English B1", jam: "15:00–16:00", ruang: "Ruang 2", pertemuan: 5, totalPertemuan: 12,
    materi: "Daily Conversation: Introducing Yourself & Family Members",
    catatanGuru: "4 dari 5 siswa sudah bisa memperkenalkan diri dalam English dengan percaya diri.",
    hadir: 4, totalSiswa: 5, izin: 1, sakit: 0, alpha: 0, status: "Selesai", warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" }, { nama: "Budi Santoso", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" }, { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Gilang Ramadan", status: "Izin", catatan: "Izin Keluarga" },
    ],
  },
  {
    id: "LOG-0907", tanggal: "2026-09-07", tglDisplay: "Senin, 7 September 2026", dayNum: 7, bulanKey: "2026-09",
    kelas: "KLS-A", program: "Calistung Level 1", jam: "14:00–15:00", ruang: "Ruang 1", pertemuan: 8, totalPertemuan: 12,
    materi: "Latihan Menulis Angka 1–20 & Berhitung Visual Gambar",
    catatanGuru: "Andi Setiawan perlu pendampingan cara memegang pensil yang benar.",
    hadir: 6, totalSiswa: 6, izin: 0, sakit: 0, alpha: 0, status: "Selesai", warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" }, { nama: "Citra Kirana", status: "Hadir" },
      { nama: "Dian Pratama", status: "Hadir" }, { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Hana Pertiwi", status: "Hadir" }, { nama: "Ivan Kurnia", status: "Hadir" },
    ],
  },
  {
    id: "LOG-0910", tanggal: "2026-09-10", tglDisplay: "Kamis, 10 September 2026", dayNum: 10, bulanKey: "2026-09",
    kelas: "KLS-B", program: "English B1", jam: "15:00–16:00", ruang: "Ruang 2", pertemuan: 6, totalPertemuan: 12,
    materi: "Reading Comprehension: Short Story with Pictures",
    catatanGuru: "Galih Wibowo memenangkan kuis tebak kata. Semua siswa aktif.",
    hadir: 5, totalSiswa: 5, izin: 0, sakit: 0, alpha: 0, status: "Selesai", warna: "#059669",
    siswaAbsensi: [
      { nama: "Andi Setiawan", status: "Hadir" }, { nama: "Budi Santoso", status: "Hadir" },
      { nama: "Citra Kirana", status: "Hadir" }, { nama: "Fitri Handayani", status: "Hadir" },
      { nama: "Gilang Ramadan", status: "Hadir" },
    ],
  },
];

const listBulan = [
  { key: "2026-08", label: "Agustus 2026", days: 31, offsetStart: 5 },
  { key: "2026-09", label: "September 2026", days: 30, offsetStart: 1 },
  { key: "2026-10", label: "Oktober 2026", days: 31, offsetStart: 3 },
];

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];

export default function GuruKalenderLogbookPage() {
  const [selectedBulanKey, setSelectedBulanKey] = useState("2026-09");
  const [logbookList] = useState<LogbookEntry[]>(initialLogbookData);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<{ dayNum: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentBulan = listBulan.find((b) => b.key === selectedBulanKey) || listBulan[1];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrevBulan = () => {
    const idx = listBulan.findIndex((b) => b.key === selectedBulanKey);
    if (idx > 0) setSelectedBulanKey(listBulan[idx - 1].key);
  };

  const handleNextBulan = () => {
    const idx = listBulan.findIndex((b) => b.key === selectedBulanKey);
    if (idx < listBulan.length - 1) setSelectedBulanKey(listBulan[idx + 1].key);
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
    const found = logbookList.find((l) => l.tanggal === dateStr);
    if (found) {
      setSelectedLogbook(found);
    } else {
      setSelectedEmptyDay({ dayNum });
    }
  };

  const calendarDays = Array.from({ length: currentBulan.days }, (_, i) => i + 1);
  const emptyOffsets = Array.from({ length: currentBulan.offsetStart }, (_, i) => i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .cal-cell {
          min-height: 120px;
          border-radius: 14px;
          border: 1.5px solid #e8ecf1;
          background: #ffffff;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .cal-cell:hover {
          border-color: #c5d0db;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .cal-cell.has-class {
          background: #f0fdf8;
          border-color: #b2e8d8;
        }
        .cal-cell.has-class:hover {
          border-color: #059669;
          box-shadow: 0 4px 16px rgba(5,150,105,0.12);
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "#fff",
          padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13.5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 200, display: "flex", alignItems: "center", gap: 10,
          animation: "toastIn 0.25s ease-out",
        }}>
          <span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> {toastMsg}
        </div>
      )}

      {/* Header: Title + Month Nav + Legend */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          {/* Left: Month Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={handlePrevBulan}
              disabled={listBulan.findIndex((b) => b.key === selectedBulanKey) === 0}
              style={{ padding: "6px 10px", fontSize: 16, lineHeight: 1 }}>
              ‹
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, minWidth: 240, textAlign: "center" }}>
              Kalender Presensi & Logbook — {currentBulan.label}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={handleNextBulan}
              disabled={listBulan.findIndex((b) => b.key === selectedBulanKey) === listBulan.length - 1}
              style={{ padding: "6px 10px", fontSize: 16, lineHeight: 1 }}>
              ›
            </button>
          </div>

          {/* Right: Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12.5, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", flexShrink: 0 }} />
              <span style={{ color: "#059669" }}>Hadir & Logbook Terisi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ea580c", flexShrink: 0 }} />
              <span style={{ color: "#ea580c" }}>Izin / Pending</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
              <span style={{ color: "#94a3b8" }}>Tidak Ada Kelas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: 20, overflowX: "auto" }}>
        {/* Day Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 10 }}>
          {HARI.map((h, i) => (
            <div key={h} style={{
              fontSize: 13, fontWeight: 800, textAlign: "center",
              color: i >= 5 ? "#dc2626" : "#64748b",
              padding: "6px 0",
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {emptyOffsets.map((_, idx) => (
            <div key={`off-${idx}`} style={{ minHeight: 120, borderRadius: 14, background: "#f9fafb", border: "1.5px solid #f1f5f9", opacity: 0.4 }} />
          ))}

          {calendarDays.map((dayNum) => {
            const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
            const found = logbookList.find((l) => l.tanggal === dateStr);

            return (
              <div
                key={dayNum}
                className={`cal-cell ${found ? "has-class" : ""}`}
                onClick={() => handleDayClick(dayNum)}
              >
                {/* Day Number + Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 900,
                    color: found ? "#1a202c" : "#94a3b8",
                  }}>
                    {dayNum}
                  </span>
                  {found && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999,
                      background: "#d1fae5", color: "#059669",
                    }}>
                      Hadir
                    </span>
                  )}
                </div>

                {/* Content */}
                {found ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a202c", lineHeight: 1.3 }}>
                      {found.program.split(" ")[0]} {found.kelas.split("-")[1] || ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                      {found.hadir} / {found.totalSiswa} Siswa
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#c1c9d4", fontStyle: "italic", marginTop: "auto" }}>
                    Libur / Kosong
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Detail Logbook */}
      {selectedLogbook && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
          zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          animation: "fadeIn 0.2s ease-out",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%", padding: 28,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: selectedLogbook.warna, color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                    {selectedLogbook.kelas}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{selectedLogbook.id}</span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a202c", margin: 0 }}>
                  {selectedLogbook.tglDisplay}
                </h2>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                  {selectedLogbook.program} · Pertemuan {selectedLogbook.pertemuan}/{selectedLogbook.totalPertemuan} · {selectedLogbook.jam} · {selectedLogbook.ruang}
                </div>
              </div>
              <button onClick={() => setSelectedLogbook(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 800, fontSize: 14 }}>
                ✕
              </button>
            </div>

            {/* Materi */}
            <div style={{ background: "linear-gradient(135deg, #f0fdf8, #dcfce7)", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Materi Pembelajaran</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#14532d", lineHeight: 1.4 }}>{selectedLogbook.materi}</div>
            </div>

            {/* Kehadiran */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Rekap Kehadiran</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.hadir} Hadir</span>
                  {selectedLogbook.izin > 0 && <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.izin} Izin</span>}
                  {selectedLogbook.sakit > 0 && <span style={{ background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.sakit} Sakit</span>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedLogbook.siswaAbsensi.map((s, i) => {
                  const bg = s.status === "Hadir" ? "#d1fae5" : s.status === "Izin" ? "#fef3c7" : s.status === "Sakit" ? "#fce7f3" : "#fee2e2";
                  const clr = s.status === "Hadir" ? "#059669" : s.status === "Izin" ? "#b45309" : s.status === "Sakit" ? "#be185d" : "#dc2626";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: bg, color: clr, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.nama[0]}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a202c" }}>{s.nama}</div>
                          {s.catatan && <div style={{ fontSize: 11, color: clr, fontWeight: 600 }}>{s.catatan}</div>}
                        </div>
                      </div>
                      <span style={{ background: bg, color: clr, fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{s.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catatan Guru */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Catatan Guru</div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#334155", lineHeight: 1.6, border: "1px solid #e2e8f0", fontStyle: "italic" }}>
                &ldquo;{selectedLogbook.catatanGuru}&rdquo;
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => { setSelectedLogbook(null); showToast("Logbook berhasil diunduh sebagai PDF!"); }} style={{ flex: 1, justifyContent: "center" }}>Unduh PDF</button>
              <button className="btn btn-accent" onClick={() => { setSelectedLogbook(null); showToast("Logbook berhasil dikirim ke Orang Tua!"); }} style={{ flex: 1, justifyContent: "center" }}>Kirim ke Ortu</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hari Kosong */}
      {selectedEmptyDay && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
          zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          animation: "fadeIn 0.2s ease-out",
        }}>
          <div style={{
            background: "#fff", borderRadius: 18, maxWidth: 440, width: "100%", padding: 26,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: "#1a202c", margin: 0 }}>
                Tanggal {selectedEmptyDay.dayNum} {currentBulan.label}
              </h3>
              <button onClick={() => setSelectedEmptyDay(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontWeight: 800, fontSize: 16 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 18 }}>
              Tidak ada kelas atau logbook untuk tanggal ini. Hari libur / kosong.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/guru/jadwal" className="btn btn-accent" style={{ flex: 1, textAlign: "center", textDecoration: "none", justifyContent: "center" }}>Lihat Jadwal</Link>
              <button className="btn btn-ghost" onClick={() => setSelectedEmptyDay(null)} style={{ flex: 1, justifyContent: "center" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
