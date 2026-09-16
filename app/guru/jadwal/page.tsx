"use client";
import { useState } from "react";
import Link from "next/link";

interface SesiJadwal {
  id: string;
  tanggal: string;
  hari: string;
  dateKey: string;
  jam: string;
  jamEnd: string;
  kelas: string;
  program: string;
  ruang: string;
  siswa: number;
  pertemuan: number;
  total: number;
  status: "Hari Ini" | "Mendatang" | "Selesai";
  warna: string;
}

const daftarJadwal: SesiJadwal[] = [
  // Hari Ini
  { id: "SES-001", tanggal: "8 Sep 2026", hari: "Senin", dateKey: "2026-09-08", jam: "14:00", jamEnd: "15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 9, total: 12, status: "Hari Ini", warna: "#059669" },
  { id: "SES-002", tanggal: "8 Sep 2026", hari: "Senin", dateKey: "2026-09-08", jam: "16:00", jamEnd: "17:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 3", siswa: 5, pertemuan: 3, total: 8, status: "Hari Ini", warna: "#d97706" },
  // Besok
  { id: "SES-003", tanggal: "9 Sep 2026", hari: "Selasa", dateKey: "2026-09-09", jam: "15:00", jamEnd: "16:00", kelas: "KLS-B", program: "English B1", ruang: "Ruang 2", siswa: 5, pertemuan: 6, total: 12, status: "Mendatang", warna: "#1d4ed8" },
  // Rabu
  { id: "SES-004", tanggal: "10 Sep 2026", hari: "Rabu", dateKey: "2026-09-10", jam: "14:00", jamEnd: "15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 10, total: 12, status: "Mendatang", warna: "#059669" },
  // Kamis
  { id: "SES-005", tanggal: "11 Sep 2026", hari: "Kamis", dateKey: "2026-09-11", jam: "13:00", jamEnd: "14:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 3", siswa: 5, pertemuan: 4, total: 8, status: "Mendatang", warna: "#d97706" },
  { id: "SES-011", tanggal: "11 Sep 2026", hari: "Kamis", dateKey: "2026-09-11", jam: "15:00", jamEnd: "16:00", kelas: "KLS-B", program: "English B1", ruang: "Ruang 2", siswa: 5, pertemuan: 7, total: 12, status: "Mendatang", warna: "#1d4ed8" },
  // Jumat
  { id: "SES-006", tanggal: "12 Sep 2026", hari: "Jumat", dateKey: "2026-09-12", jam: "14:00", jamEnd: "15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 11, total: 12, status: "Mendatang", warna: "#059669" },
  // Selesai - minggu lalu
  { id: "SES-010", tanggal: "5 Sep 2026", hari: "Jumat", dateKey: "2026-09-05", jam: "14:00", jamEnd: "15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 8, total: 12, status: "Selesai", warna: "#64748b" },
  { id: "SES-009", tanggal: "3 Sep 2026", hari: "Kamis", dateKey: "2026-09-03", jam: "13:00", jamEnd: "14:00", kelas: "KLS-D", program: "Phonics Starter", ruang: "Ruang 3", siswa: 5, pertemuan: 2, total: 8, status: "Selesai", warna: "#64748b" },
  { id: "SES-008", tanggal: "1 Sep 2026", hari: "Senin", dateKey: "2026-09-01", jam: "14:00", jamEnd: "15:00", kelas: "KLS-A", program: "Calistung Level 1", ruang: "Ruang 1", siswa: 6, pertemuan: 7, total: 12, status: "Selesai", warna: "#64748b" },
];

export default function GuruJadwalPage() {
  const [filter, setFilter] = useState<"Semua" | "Hari Ini" | "Mendatang" | "Selesai">("Semua");

  const hariIni = daftarJadwal.filter(j => j.status === "Hari Ini");
  const terfilter = daftarJadwal.filter(j => filter === "Semua" || j.status === filter);

  // Group by date for "Semua" view
  const groupedByDate = terfilter.reduce<Record<string, SesiJadwal[]>>((acc, sesi) => {
    if (!acc[sesi.dateKey]) acc[sesi.dateKey] = [];
    acc[sesi.dateKey].push(sesi);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (filter === "Selesai") return b.localeCompare(a);
    return a.localeCompare(b);
  });

  const formatHariLabel = (dateKey: string, sesi: SesiJadwal) => {
    if (sesi.status === "Hari Ini") return "Hari Ini";
    if (dateKey === "2026-09-09") return "Besok";
    return `${sesi.hari}, ${sesi.tanggal}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
        .sesi-card { transition: all 0.2s ease; }
        .sesi-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .time-slot { min-width: 72px; text-align: center; padding: 10px 8px; border-radius: 12px; flex-shrink: 0; }
        .today-badge { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Mengajar</h1>
          <p className="page-subtitle">Jadwal sesi mengajar minggu ini. Klik kelas untuk mulai absensi atau lihat logbook.</p>
        </div>
      </div>

      {/* Highlight: Hari Ini */}
      {hariIni.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          borderRadius: 16, padding: "22px 26px", color: "#fff",
          boxShadow: "0 8px 24px rgba(5,150,105,0.25)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="today-badge" style={{ width: 10, height: 10, borderRadius: "50%", background: "#bbf7d0", flexShrink: 0 }} />
              <span style={{ fontSize: 17, fontWeight: 900 }}>Jadwal Hari Ini</span>
              <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>Senin, 8 September 2026</span>
            </div>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}>
              {hariIni.length} Sesi
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hariIni.map(sesi => (
              <div key={sesi.id} style={{
                background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16, backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                {/* Time */}
                <div style={{ minWidth: 80, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{sesi.jam}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{sesi.jamEnd}</div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{sesi.kelas} — {sesi.program}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>{sesi.ruang} · {sesi.siswa} siswa · Pertemuan {sesi.pertemuan}/{sesi.total}</div>
                </div>

                {/* Aksi */}
                <Link href={`/guru/kelas/${sesi.id}`} style={{
                  background: "#fff", color: "#047857", padding: "10px 20px", borderRadius: 10,
                  fontWeight: 800, fontSize: 13.5, textDecoration: "none", display: "inline-flex",
                  alignItems: "center", gap: 6, whiteSpace: "nowrap",
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Mulai Kelas
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {(["Semua", "Mendatang", "Selesai"] as const).map(f => {
          const count = f === "Semua" ? daftarJadwal.length : daftarJadwal.filter(j => j.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 18px", borderRadius: 999, border: "1.5px solid", fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 6,
              background: filter === f ? "var(--color-primary)" : "white",
              color: filter === f ? "white" : "var(--color-text-secondary)",
              borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
            }}>
              {f}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 999,
                background: filter === f ? "rgba(255,255,255,0.25)" : "var(--color-bg)",
                color: filter === f ? "#fff" : "var(--color-text-muted)",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Jadwal Grouped by Date */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sortedDates.map(dateKey => {
          const sesiHari = groupedByDate[dateKey];
          const labelSesi = sesiHari[0];
          const isHariIni = labelSesi.status === "Hari Ini";

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                paddingBottom: 8, borderBottom: "2px solid var(--color-border-light)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isHariIni ? "var(--color-primary)" : "var(--color-bg)",
                  color: isHariIni ? "#fff" : "var(--color-text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 14, flexShrink: 0,
                }}>
                  {labelSesi.hari.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    {formatHariLabel(dateKey, labelSesi)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {labelSesi.tanggal} · {sesiHari.length} sesi
                  </div>
                </div>
              </div>

              {/* Cards for this date */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sesiHari.map(sesi => (
                  <div key={sesi.id} className="sesi-card" style={{
                    background: "#fff", borderRadius: 14, border: "1.5px solid var(--color-border-light)",
                    padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                    borderLeft: `4px solid ${sesi.warna}`,
                  }}>
                    {/* Time Block */}
                    <div className="time-slot" style={{
                      background: sesi.status === "Hari Ini" ? `${sesi.warna}12` : "var(--color-bg)",
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: sesi.warna, lineHeight: 1.1 }}>{sesi.jam}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{sesi.jamEnd}</div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{sesi.kelas}</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>—</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{sesi.program}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>
                          {sesi.ruang}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          {sesi.siswa} siswa
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                          {sesi.pertemuan}/{sesi.total} pertemuan
                        </span>
                      </div>
                    </div>

                    {/* Progress Ring */}
                    <div style={{ textAlign: "center", minWidth: 56 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        border: `3px solid ${sesi.status === "Selesai" ? "var(--color-border)" : sesi.warna}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto",
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: sesi.status === "Selesai" ? "var(--color-text-muted)" : sesi.warna }}>
                          {Math.round((sesi.pertemuan / sesi.total) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Aksi */}
                    <div style={{ flexShrink: 0 }}>
                      {sesi.status === "Hari Ini" ? (
                        <Link href={`/guru/kelas/${sesi.id}`} style={{
                          background: "var(--color-primary)", color: "#fff", padding: "9px 18px",
                          borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: 6,
                        }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          Mulai
                        </Link>
                      ) : sesi.status === "Mendatang" ? (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, padding: "6px 12px", background: "var(--color-bg)", borderRadius: 8, display: "inline-block" }}>
                          {sesi.jam}
                        </span>
                      ) : (
                        <Link href="/guru/logbook" style={{
                          color: "var(--color-primary)", fontWeight: 600, fontSize: 13, textDecoration: "none",
                        }}>
                          Lihat Logbook →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Tidak ada jadwal</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Tidak ada sesi mengajar untuk filter ini.</div>
          </div>
        )}
      </div>
    </div>
  );
}
