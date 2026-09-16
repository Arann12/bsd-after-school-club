"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface Pengumuman {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string;
  ringkasan: string;
  isFlyer: boolean;
  flyerDesc?: string;
  detail: string;
  penting: boolean;
}

const daftarPengumuman: Pengumuman[] = [
  {
    id: "ANN-001",
    judul: "Libur Lebaran & Jadwal Pengganti Kelas",
    kategori: "PENTING",
    tanggal: "28 Sep 2026",
    ringkasan: "Informasi resmi jadwal libur Lebaran dan penggantian kelas selama periode 28 Sep – 6 Okt 2026.",
    isFlyer: true,
    flyerDesc: "Poster/Flyer Pengumuman Resmi BSD After School Club",
    detail: "Kepada seluruh Orang Tua / Wali Murid BSD After School Club,\n\nBersama ini kami informasikan bahwa seluruh kegiatan belajar mengajar akan LIBUR pada periode:\n\n  • Tanggal    : 28 September – 6 Oktober 2026\n  • Keterangan : Libur Maulid Nabi Muhammad SAW & Cuti Bersama\n\nKelas Pengganti akan dijadwalkan pada:\n  • Kelas KLS-A (Calistung)  → Sabtu, 10 Oktober 2026, Pukul 09.00 WIB\n  • Kelas KLS-B (English)    → Sabtu, 10 Oktober 2026, Pukul 11.00 WIB\n  • Kelas KLS-C (Math)       → Minggu, 11 Oktober 2026, Pukul 09.00 WIB\n  • Kelas KLS-D (Phonics)    → Minggu, 11 Oktober 2026, Pukul 11.00 WIB\n\nMohon konfirmasi kehadiran melalui WhatsApp ke Admin BSD at 0812-XXXX-XXXX.\n\nDemikian informasi ini kami sampaikan. Terima kasih atas perhatian dan kerja samanya.\n\nHormat kami,\nManajemen BSD After School Club",
    penting: true,
  },
  {
    id: "ANN-002",
    judul: "Pembayaran SPP September Jatuh Tempo 10 September",
    kategori: "KEUANGAN",
    tanggal: "1 Sep 2026",
    ringkasan: "Batas waktu pembayaran SPP bulan September adalah tanggal 10 September 2026.",
    isFlyer: false,
    detail: "Kepada Yth. Orang Tua / Wali Murid,\n\nKami mengingatkan bahwa batas pembayaran SPP bulan September 2026 adalah:\n\n  TANGGAL 10 SEPTEMBER 2026\n\nPembayaran dapat dilakukan melalui:\n  • Virtual Account BCA / BNI / Mandiri / BRI\n  • QRIS (scan langsung di kantor)\n  • Transfer Bank ke rekening BSD\n  • Cash / Tunai di Kantor BSD (hari operasional)\n\nJika melewati tanggal 10, akan dikenakan denda administrasi Rp 10.000/hari.\n\nUntuk informasi lebih lanjut, hubungi Admin BSD di:\n  WA: 0812-3456-7890 (hari kerja, 08:00–17:00 WIB)\n\nTerima kasih.",
    penting: true,
  },
  {
    id: "ANN-003",
    judul: "Program Baru: English Conversation untuk Level 3",
    kategori: "PROGRAM",
    tanggal: "25 Agt 2026",
    ringkasan: "BSD After School Club membuka program baru English Conversation khusus siswa Level 3 mulai Oktober 2026.",
    isFlyer: false,
    detail: "Dengan bangga kami mengumumkan program baru:\n\nENGLISH CONVERSATION — LEVEL 3\n\nProgram ini dirancang untuk siswa yang telah menyelesaikan English Level 2 (B1) dan ingin meningkatkan kemampuan berbicara (speaking) dalam bahasa Inggris.\n\nDetail Program:\n  • Durasi       : 90 menit per sesi\n  • Jadwal       : Rabu & Jumat, Pukul 15:00 – 16:30 WIB\n  • Mulai        : 1 Oktober 2026\n  • Kapasitas    : Maksimal 6 Siswa per Kelas\n  • Biaya        : Rp 125.000 / sesi\n\nDaftarkan anak Anda segera! Tempat sangat terbatas.\nHubungi Admin BSD untuk informasi pendaftaran.",
    penting: false,
  },
];

const kategoriColor: Record<string, { bg: string; color: string }> = {
  "PENTING": { bg: "#fee2e2", color: "#dc2626" },
  "KEUANGAN": { bg: "#fef3c7", color: "#b45309" },
  "PROGRAM": { bg: "#d1fae5", color: "#059669" },
  "UMUM": { bg: "#e0f2fe", color: "#0369a1" },
};

export default function OrangTuaPengumumanPage() {
  const [selected, setSelected] = useState<Pengumuman | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengumuman BSD After School Club</h1>
          <p className="page-subtitle">Informasi resmi, jadwal, dan pengumuman penting dari manajemen kursus untuk orang tua.</p>
        </div>
      </div>

      {/* Daftar Pengumuman */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {daftarPengumuman.map(p => (
          <div
            key={p.id}
            className="card"
            onClick={() => setSelected(p)}
            style={{ padding: 22, cursor: "pointer", borderLeft: p.penting ? "4px solid #dc2626" : "4px solid var(--color-border)", transition: "box-shadow .15s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ ...kategoriColor[p.kategori], fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                    {p.kategori}
                  </span>
                  {p.isFlyer && (
                    <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                      Ada Flyer / Poster
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.tanggal}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 6px" }}>{p.judul}</h3>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{p.ringkasan}</p>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)", whiteSpace: "nowrap" }}>Baca Selengkapnya →</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL PENGUMUMAN */}
      {selected && (
      <Modal open onClose={() => setSelected(null)} title="Detail Pengumuman" maxWidth={640}>
        {/* Modal Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ ...kategoriColor[selected?.kategori || ""], fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selected?.kategori}</span>
            {selected?.isFlyer && <span style={{ background: "#ede9fe", color: "#7c3aed", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>Flyer Resmi</span>}
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{selected?.tanggal}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.3 }}>{selected?.judul}</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Flyer / Poster Visual (jika ada) */}
              {selected?.isFlyer && (
                <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #e2e8f0", background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 35%, #f97316 100%)", padding: 24, textAlign: "center" }}>
                  {/* Simulated Flyer Design */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, display: "inline-block", padding: "4px 16px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      BSD AFTER SCHOOL CLUB
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Pengumuman Resmi</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", lineHeight: 1.2 }}>LIBUR LEBARAN</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", marginTop: 4 }}>& Jadwal Kelas Pengganti</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>TANGGAL LIBUR</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 2 }}>28 Sep – 6 Okt 2026</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>KELAS PENGGANTI</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>10 & 11 Okt 2026</div>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                    Info lebih lanjut: WA Admin 0812-3456-7890 · Hari kerja 08:00–17:00 WIB
                  </div>

                  <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                    Diterbitkan oleh Manajemen BSD After School Club · {selected?.tanggal}
                  </div>
                </div>
              )}

              {/* Detail Teks Pengumuman */}
              <div style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Informasi Lengkap</div>
                <pre style={{ fontSize: 13, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit", margin: 0 }}>{selected?.detail}</pre>
              </div>

              <button className="btn btn-accent" onClick={() => setSelected(null)}>Tutup Pengumuman</button>
            </div>
      </Modal>
      )}
    </div>
  );
}
