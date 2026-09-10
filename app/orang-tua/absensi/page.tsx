"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

export interface GuruKursus {
  id: string;
  nama: string;
  spesialisasi: string;
  programDisertai: string;
  totalPertemuan: number;
  kehadiranPercent: number;
  fotoUrl?: string;
  logbookSesi: {
    tgl: string; // YYYY-MM-DD
    tglDisplay: string;
    jam: string;
    status: "Hadir" | "Izin" | "Alpha";
    materi: string;
    catatanGuru: string;
    fotoAktivitas?: string;
  }[];
}

const daftarGuruPerAnak: GuruKursus[] = [
  {
    id: "GUR-001",
    nama: "Ms. Sarah",
    spesialisasi: "Calistung Level 1 & Phonics",
    programDisertai: "Calistung & Phonics",
    totalPertemuan: 12,
    kehadiranPercent: 100,
    logbookSesi: [
      { tgl: "2026-09-02", tglDisplay: "2 Sept 2026", jam: "14:00 – 15:00", status: "Hadir", materi: "Mengenal Abjad A–G dan Menulis Huruf Kecil", catatanGuru: "Andi sangat aktif membaca abjad A-G. Latihan menulis huruf b dan d perlu diulangi sedikit di rumah." },
      { tgl: "2026-09-04", tglDisplay: "4 Sept 2026", jam: "14:00 – 15:00", status: "Hadir", materi: "Mengenal Abjad H–N dan Membaca Suku Kata BA-BI-BU", catatanGuru: "Mampu melafalkan suku kata dengan lancar tanpa terputus." },
      { tgl: "2026-09-09", tglDisplay: "9 Sept 2026", jam: "14:00 – 15:00", status: "Hadir", materi: "Menulis Angka 1–10 dan Berhitung Gambar", catatanGuru: "Menyelesaikan lembar kerja matematika visual dengan hasil sempurna 100%." },
      { tgl: "2026-09-11", tglDisplay: "11 Sept 2026", jam: "14:00 – 15:00", status: "Izin", materi: "Pelajaran Digantikan Reschedule", catatanGuru: "Orang tua mengajukan izin sakit (flu). Materi digeser ke sesi berikutnya." },
      { tgl: "2026-09-16", tglDisplay: "16 Sept 2026", jam: "14:00 – 15:00", status: "Hadir", materi: "Membaca Kalimat Sederhana 3 Kata", catatanGuru: "Peningkatan fokus luar biasa. Andi sudah mulai bisa membaca buku cerita anak bergambar." },
    ],
  },
  {
    id: "GUR-002",
    nama: "Mr. Andi",
    spesialisasi: "English Starter & Vocabulary",
    programDisertai: "English B1",
    totalPertemuan: 8,
    kehadiranPercent: 88,
    logbookSesi: [
      { tgl: "2026-09-03", tglDisplay: "3 Sept 2026", jam: "15:30 – 16:30", status: "Hadir", materi: "Greetings & Self Introduction in English", catatanGuru: "Andi confident speaking English in front of classmates." },
      { tgl: "2026-09-08", tglDisplay: "8 Sept 2026", jam: "15:30 – 16:30", status: "Hadir", materi: "Animals & Colors Vocabulary Game", catatanGuru: "Won the flashcard quiz game with 15 correct points." },
      { tgl: "2026-09-10", tglDisplay: "10 Sept 2026", jam: "15:30 – 16:30", status: "Hadir", materi: "Singing ABC Song & Spelling Names", catatanGuru: "Good pronunciation on vowels A, E, I, O, U." },
    ],
  },
];

export default function OrangTuaAbsensiKalenderPage() {
  const [selectedGuru, setSelectedGuru] = useState<GuruKursus | null>(null);
  const [bulanTahun, setBulanTahun] = useState("September 2026");
  const [selectedLogbook, setSelectedLogbook] = useState<GuruKursus["logbookSesi"][0] | null>(null);

  // Generasi tanggal kalender September 2026 (30 hari)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, "0")}`;
    return { dayNum, dateStr };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .guru-card { transition: all .2s ease; cursor: pointer; }
        .guru-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08)!important; }
        .cal-day { min-height: 85px; padding: 6px; border-radius: 8px; border: 1px solid var(--color-border-light); background: #fff; transition: all .15s; }
        .cal-day:hover { border-color: var(--color-primary); background: #f0f9ff; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Absensi & Logbook Pembelajaran Guru</h1>
          <p className="page-subtitle">Pilih guru pengajar di bawah untuk melihat rekapan absensi dan logbook harian dalam tampilan kalender per bulan.</p>
        </div>
      </div>

      {/* Card Info Anak */}
      <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
          A
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Siswa: Andi Setiawan</div>
          <div style={{ fontSize: 12.5, opacity: 0.9 }}>Terdaftar di: Calistung Level 1 & English B1 · SD BSD Smart School</div>
        </div>
      </div>

      {/* LIST GURU GURU YANG MENGAJAR DI KURSUS (Requirement #10) */}
      {!selectedGuru ? (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 14 }}>
            Daftar Guru Pengajar Kursus Anak Anda
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {daftarGuruPerAnak.map(g => (
              <div
                key={g.id}
                className="card guru-card"
                onClick={() => setSelectedGuru(g)}
                style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#ede9fe", color: "#6d28d9", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {g.nama[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>{g.nama}</h3>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{g.spesialisasi}</div>
                  </div>
                </div>

                <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Sesi</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.totalPertemuan} Pertemuan</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Tingkat Kehadiran</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>{g.kehadiranPercent}% Hadir</div>
                  </div>
                </div>

                <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
                  Buka Kalender Absensi & Logbook &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAMPILAN KALENDER PERBULAN GURU (Requirement #10) */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header Bar Kalender Guru */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedGuru(null)}>
                  &larr; Kembali ke Daftar Guru
                </button>
                <div style={{ height: 24, width: 1, background: "var(--color-border)" }} />
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    Kalender Logbook — {selectedGuru.nama}
                  </h2>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{selectedGuru.spesialisasi}</span>
                </div>
              </div>

              {/* Month Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-primary)" }}>{bulanTahun}</span>
              </div>
            </div>
          </div>

          {/* KALENDER GRID PERBULAN (7 KOLOM HARI) */}
          <div className="card" style={{ padding: 20, overflowX: "auto" }}>
            {/* Header Nama Hari */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, textAlign: "center", marginBottom: 10 }}>
              {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(h => (
                <div key={h} style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", padding: 4 }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Grid Tanggal Kalender */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {/* Empty offset for Wednesday 1st Sept 2026 */}
              <div className="cal-day" style={{ opacity: 0.3, background: "#f8fafc" }}>–</div>
              <div className="cal-day" style={{ opacity: 0.3, background: "#f8fafc" }}>–</div>

              {daysInMonth.map(d => {
                const sesi = selectedGuru.logbookSesi.find(s => s.tgl === d.dateStr);

                return (
                  <div
                    key={d.dateStr}
                    className="cal-day"
                    onClick={() => sesi && setSelectedLogbook(sesi)}
                    style={{
                      cursor: sesi ? "pointer" : "default",
                      borderColor: sesi ? (sesi.status === "Hadir" ? "#059669" : "#b45309") : "var(--color-border-light)",
                      background: sesi ? (sesi.status === "Hadir" ? "#f0fdf4" : "#fef3c7") : "#fff",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-primary)", display: "flex", justifyContent: "space-between" }}>
                      <span>{d.dayNum}</span>
                      {sesi && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 6px",
                          borderRadius: 999,
                          background: sesi.status === "Hadir" ? "#059669" : "#b45309",
                          color: "#fff",
                        }}>
                          {sesi.status}
                        </span>
                      )}
                    </div>

                    {sesi ? (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {sesi.materi}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-primary)", fontWeight: 700, marginTop: 4 }}>
                          Buka Logbook &rarr;
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 12, fontStyle: "italic" }}>Tidak ada sesi</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table List Alternatif */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <h2 className="card-title">Riwayat Logbook Sesi — {selectedGuru.nama}</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Tanggal", "Jam Sesi", "Status Absensi", "Materi Pembelajaran", "Catatan Guru untuk Ortu & Siswa", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedGuru.logbookSesi.map((s, idx) => (
                  <tr key={s.tgl} style={{ borderBottom: idx < selectedGuru.logbookSesi.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{s.tglDisplay}</td>
                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>{s.jam}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        background: s.status === "Hadir" ? "#d1fae5" : "#fef3c7",
                        color: s.status === "Hadir" ? "#059669" : "#b45309",
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.materi}</td>
                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{s.catatanGuru}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={() => setSelectedLogbook(s)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "6px 12px", borderRadius: 8,
                          background: "#f0f9ff", border: "1px solid #bae6fd",
                          color: "#0284c7", fontSize: 12, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.borderColor = "#7dd3fc"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f9ff"; e.currentTarget.style.borderColor = "#bae6fd"; }}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL LOGBOOK DETAIL POPUP */}
      <Modal open={!!selectedLogbook} onClose={() => setSelectedLogbook(null)} title="Catatan Logbook Pembelajaran" maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0369a1" }}>{selectedLogbook?.tglDisplay} ({selectedLogbook?.jam})</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0c4a6e", marginTop: 4 }}>{selectedLogbook?.materi}</div>
            <span style={{ background: selectedLogbook?.status === "Hadir" ? "#d1fae5" : "#fef3c7", color: selectedLogbook?.status === "Hadir" ? "#059669" : "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, marginTop: 8, display: "inline-block" }}>
              Status: {selectedLogbook?.status}
            </span>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Catatan Perkembangan dari Guru</div>
            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
              "{selectedLogbook?.catatanGuru}"
            </div>
          </div>

          <button className="btn btn-ghost" onClick={() => setSelectedLogbook(null)} style={{ marginTop: 8 }}>
            Tutup Logbook
          </button>
        </div>
      </Modal>
    </div>
  );
}
