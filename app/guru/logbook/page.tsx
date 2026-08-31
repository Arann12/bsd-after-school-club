"use client";
import { useState } from "react";

const riwayatLogbook = [
  { id: "LOG-001", tgl: "Senin, 30 Agt 2026", kelas: "KLS-A", program: "Calistung Level 1", materi: "Mengenal Suku Kata & Dikte Singkat", hadir: 6, izin: 0, alpha: 0, catatan: "Siswa sangat antusias, semua dapat membaca suku kata Ba-Bi-Bu-Be-Bo." },
  { id: "LOG-002", tgl: "Rabu, 28 Agt 2026", kelas: "KLS-D", program: "Phonics Starter", materi: "Letter Sounds: /s/, /a/, /t/", hadir: 4, izin: 1, alpha: 0, catatan: "Dian Pratama izin karena sakit." },
  { id: "LOG-003", tgl: "Senin, 23 Agt 2026", kelas: "KLS-A", program: "Calistung Level 1", materi: "Latihan Menulis Angka 1-20", hadir: 5, izin: 1, alpha: 0, catatan: "Andi Setiawan perlu pendampingan cara memegang pensil." },
];

export default function GuruLogbookPage() {
  const [cari, setCari] = useState("");
  const terfilter = riwayatLogbook.filter(l => l.materi.toLowerCase().includes(cari.toLowerCase()) || l.kelas.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Logbook Mengajar</h1>
          <p className="page-subtitle">Rekap materi pelajaran dan presensi sesi yang telah selesai.</p>
        </div>
      </div>

      <div className="card"><div className="card-body" style={{ padding: "12px 20px" }}>
        <input className="search-input" style={{ width: "100%" }} placeholder="Cari materi atau kelas..." value={cari} onChange={e => setCari(e.target.value)} />
      </div></div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {terfilter.map(l => (
          <div key={l.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{l.kelas} — {l.program}</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{l.tgl} · ID Logbook: {l.id}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{l.hadir} Hadir</span>
                {l.izin > 0 && <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{l.izin} Izin</span>}
              </div>
            </div>

            <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--color-border)", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Materi yang Diajarkan</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{l.materi}</div>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
              Catatan Guru: "{l.catatan}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
