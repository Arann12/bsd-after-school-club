"use client";
import { useState } from "react";
import Link from "next/link";

const jadwalGuru = [
  { id: "SES-001", tanggal: "Senin, 2 Sept 2026", jam: "14:00–15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 7, total: 12, status: "Hari Ini", warna: "#1a5c8a" },
  { id: "SES-002", tanggal: "Senin, 2 Sept 2026", jam: "16:00–17:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 1", siswa: 5, pertemuan: 3, total: 8, status: "Hari Ini", warna: "#d97706" },
  { id: "SES-003", tanggal: "Rabu, 4 Sept 2026", jam: "14:00–15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 8, total: 12, status: "Mendatang", warna: "#1a5c8a" },
  { id: "SES-004", tanggal: "Kamis, 5 Sept 2026", jam: "13:00–14:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 1", siswa: 5, pertemuan: 4, total: 8, status: "Mendatang", warna: "#d97706" },
  { id: "SES-005", tanggal: "Jumat, 30 Agt 2026", jam: "14:00–15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 6, total: 12, status: "Selesai", warna: "#64748b" },
  { id: "SES-006", tanggal: "Rabu, 28 Agt 2026", jam: "13:00–14:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 1", siswa: 5, pertemuan: 2, total: 8, status: "Selesai", warna: "#64748b" },
];

const warnaStatus: Record<string, { bg: string; color: string }> = {
  "Hari Ini":  { bg: "#d1fae5", color: "#059669" },
  Mendatang:   { bg: "#dbeafe", color: "#1d4ed8" },
  Selesai:     { bg: "#f1f5f9", color: "#64748b" },
};

export default function GuruJadwalPage() {
  const [filter, setFilter] = useState("Semua");

  const daftarFilter = ["Semua", "Hari Ini", "Mendatang", "Selesai"];
  const terfilter = jadwalGuru.filter(j => filter === "Semua" || j.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Saya</h1>
          <p className="page-subtitle">Daftar sesi mengajar yang dijadwalkan.</p>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Sesi Hari Ini", value: jadwalGuru.filter(j=>j.status==="Hari Ini").length, warna: "#059669", bg: "#d1fae5" },
          { label: "Minggu Ini", value: jadwalGuru.filter(j=>j.status!=="Selesai").length, warna: "#1d4ed8", bg: "#dbeafe" },
          { label: "Sudah Selesai", value: jadwalGuru.filter(j=>j.status==="Selesai").length, warna: "#64748b", bg: "#f1f5f9" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 8 }}>
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: 28, color: k.warna }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Filter */}
      <div style={{ display: "flex", gap: 8 }}>
        {daftarFilter.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 18px", borderRadius: "var(--radius-full)", border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s",
              background: filter === f ? "var(--color-primary)" : "white",
              color: filter === f ? "white" : "var(--color-text-secondary)",
              borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Daftar Sesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {terfilter.map(sesi => (
          <div key={sesi.id} className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {/* Garis Warna Kiri */}
              <div style={{ width: 4, height: 56, borderRadius: 4, background: sesi.warna, flexShrink: 0 }} />

              {/* Info Utama */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)" }}>{sesi.kelas}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>—</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>{sesi.program}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                  {sesi.tanggal} · {sesi.jam} · {sesi.ruang} · {sesi.siswa} Siswa
                </div>
              </div>

              {/* Progress Pertemuan */}
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>Pertemuan</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: sesi.warna }}>{sesi.pertemuan}/{sesi.total}</div>
                <div style={{ height: 4, background: "var(--color-border)", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: sesi.warna, width: `${(sesi.pertemuan/sesi.total)*100}%`, transition: "width .3s ease" }} />
                </div>
              </div>

              {/* Badge Status */}
              <span style={{ ...warnaStatus[sesi.status], fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
                {sesi.status}
              </span>

              {/* Tombol Aksi */}
              {sesi.status === "Hari Ini" ? (
                <Link href={`/guru/kelas/${sesi.id}`}
                  style={{ background: "var(--color-primary)", color: "white", padding: "9px 18px", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: 13.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Mulai Kelas
                </Link>
              ) : sesi.status === "Mendatang" ? (
                <button className="btn btn-ghost btn-sm" disabled style={{ opacity: .5, cursor: "not-allowed" }}>Belum Waktunya</button>
              ) : (
                <Link href={`/guru/kelas/${sesi.id}`}
                  style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                  Lihat Logbook →
                </Link>
              )}
            </div>
          </div>
        ))}

        {terfilter.length === 0 && (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Tidak ada sesi {filter.toLowerCase()}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Sesi akan muncul di sini sesuai jadwal.</div>
          </div>
        )}
      </div>
    </div>
  );
}
