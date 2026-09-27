"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getClassSessions, getClassSchedules, type ClassSchedule } from "@/lib/api/academic";

// ─── Helpers ─────────────────────────────────────────────────

type FilterType = "Semua" | "Hari Ini" | "Mendatang" | "Selesai";

function getStatusSesi(sessionDate: string): "Hari Ini" | "Mendatang" | "Selesai" {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(sessionDate); d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Hari Ini";
  if (d > today) return "Mendatang";
  return "Selesai";
}

function formatTgl(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function formatHari(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { weekday: "long" });
  } catch { return ""; }
}

function warnaStatus(s: string) {
  if (s === "Hari Ini") return "#059669";
  if (s === "Mendatang") return "#1d4ed8";
  return "#64748b";
}

// ─── Mapped type untuk tampilan ──────────────────────────────

interface SesiTampil {
  id: string;
  dateKey: string;       // YYYY-MM-DD
  tanggal: string;       // "8 Sep 2026"
  hari: string;          // "Senin"
  jam: string;           // "14:00"
  jamEnd: string;        // "15:00"
  kelas: string;
  program: string;
  sessionNumber: number;
  totalSessions: number;
  status: "Hari Ini" | "Mendatang" | "Selesai";
  warna: string;
  classroomId: string;
}

function mapSession(s: ClassSession): SesiTampil {
  const dateKey = s.sessionDate?.split("T")[0] ?? "";
  const status = getStatusSesi(dateKey);

  return {
    id: s.id,
    dateKey,
    tanggal: formatTgl(dateKey),
    hari: formatHari(dateKey),
    jam: s.startTime ? s.startTime.substring(0, 5) : "--:--",
    jamEnd: s.endTime ? s.endTime.substring(0, 5) : "--",
    kelas: s.classroom?.name ?? "Kelas",
    program: s.classroom?.programLevel?.name ?? s.classSchedule?.classroom?.programLevel?.name ?? "Program",
    sessionNumber: s.sessionNumber ?? 0,
    totalSessions: 0,
    status,
    warna: warnaStatus(status),
    classroomId: s.classroomId || s.classroom?.id || "",
  };
}

function mapSchedule(sc: ClassSchedule): SesiTampil {
  // Schedule tidak punya tanggal spesifik, gunakan hari berikutnya yang sesuai day_of_week
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6
  };
  
  const targetDay = dayMap[(sc.dayOfWeek || "").toLowerCase()] ?? 1;
  const d = new Date();
  const currentDay = d.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;
  // Jika kelas hari ini tapi jam sudah lewat, biarkan tetap hari ini untuk jadwal fallback
  d.setDate(d.getDate() + daysUntil);
  
  // Gunakan local date parts agar terhindar dari pergeseran zona waktu (UTC issue)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  return {
    id: sc.id,
    dateKey,
    tanggal: formatTgl(dateKey),
    hari: formatHari(dateKey) || sc.dayOfWeek || "",
    jam: sc.startTime ? sc.startTime.substring(0, 5) : "--:--",
    jamEnd: sc.endTime ? sc.endTime.substring(0, 5) : "--",
    kelas: sc.classroom?.name ?? "Kelas",
    program: sc.classroom?.programLevel?.name ?? "Program",
    sessionNumber: 0,
    totalSessions: 0,
    status: daysUntil === 0 ? "Hari Ini" : "Mendatang",
    warna: warnaStatus(daysUntil === 0 ? "Hari Ini" : "Mendatang"),
    classroomId: sc.classroomId || sc.classroom?.id || "",
  };
}

// ─── Page ─────────────────────────────────────────────────────

export default function GuruJadwalPage() {
  const [sessions, setSessions] = useState<SesiTampil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("Semua");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend auto-filter by auth token untuk role teacher
      const [sessionsRes, schedulesRes] = await Promise.allSettled([
        getClassSessions({ per_page: 200 }),
        getClassSchedules(),
      ]);

      const allSessions: SesiTampil[] = sessionsRes.status === "fulfilled"
        ? sessionsRes.value.map(mapSession)
        : [];

      // Tampilkan schedules sebagai fallback jika belum ada sesi
      const allSchedules: SesiTampil[] =
        schedulesRes.status === "fulfilled" && allSessions.length === 0
          ? schedulesRes.value.map(mapSchedule)
          : [];

      const combined = [...allSessions, ...allSchedules].sort((a, b) =>
        a.dateKey.localeCompare(b.dateKey)
      );
      setSessions(combined);
    } catch (e) {
      console.error("Gagal memuat jadwal:", e);
      setError("Gagal memuat jadwal. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filter & Group ────────────────────────────────────────

  const hariIni = sessions.filter((s) => s.status === "Hari Ini");
  const terfilter = sessions.filter((s) => filter === "Semua" || s.status === filter);

  const groupedByDate = terfilter.reduce<Record<string, SesiTampil[]>>((acc, s) => {
    if (!acc[s.dateKey]) acc[s.dateKey] = [];
    acc[s.dateKey].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    filter === "Selesai" ? b.localeCompare(a) : a.localeCompare(b)
  );

  const countFilter = (f: FilterType) =>
    f === "Semua" ? sessions.length : sessions.filter((s) => s.status === f).length;

  if (loading) return <SkeletonTable rows={5} cols={4} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
        .sesi-card { transition: all 0.2s ease; }
        .sesi-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .today-badge { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jadwal Mengajar</h1>
          <p className="page-subtitle">Jadwal sesi mengajar berdasarkan database. Klik kelas untuk mulai absensi.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--color-danger-bg)", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-danger)" }}>{error}</div>
            <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={fetchData}>Coba Lagi</button>
          </div>
        </div>
      )}

      {/* Highlight Hari Ini */}
      {hariIni.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", borderRadius: 16, padding: "22px 26px", color: "#fff", boxShadow: "0 8px 24px rgba(5,150,105,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="today-badge" style={{ width: 10, height: 10, borderRadius: "50%", background: "#bbf7d0", flexShrink: 0 }} />
              <span style={{ fontSize: 17, fontWeight: 900 }}>Jadwal Hari Ini</span>
              <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}>
              {hariIni.length} Sesi
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hariIni.map((sesi) => (
              <div key={sesi.id} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ minWidth: 80, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{sesi.jam}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{sesi.jamEnd !== "--" ? sesi.jamEnd : ""}</div>
                </div>
                <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{sesi.kelas} — {sesi.program}</div>
                  {sesi.totalSessions > 0 && (
                    <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>Pertemuan {sesi.sessionNumber}/{sesi.totalSessions}</div>
                  )}
                </div>
                <Link href={`/guru/kelas/${sesi.classroomId || sesi.id}`} style={{ background: "#fff", color: "#047857", padding: "10px 20px", borderRadius: 10, fontWeight: 800, fontSize: 13.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  Mulai Kelas
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {(["Semua", "Mendatang", "Selesai"] as FilterType[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 18px", borderRadius: 999, border: "1.5px solid", fontSize: 13, fontWeight: 700,
            cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 6,
            background: filter === f ? "var(--color-primary)" : "white",
            color: filter === f ? "white" : "var(--color-text-secondary)",
            borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
          }}>
            {f}
            <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 999, background: filter === f ? "rgba(255,255,255,0.25)" : "var(--color-bg)", color: filter === f ? "#fff" : "var(--color-text-muted)" }}>
              {countFilter(f)}
            </span>
          </button>
        ))}
      </div>

      {/* Empty */}
      {sessions.length === 0 && !error && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Belum ada jadwal</div>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {teacherId ? "Tidak ada sesi mengajar yang terdaftar untuk akun ini." : "Akun ini belum terhubung ke data guru di sistem."}
          </div>
        </div>
      )}

      {/* Jadwal grouped by date */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sortedDates.map((dateKey) => {
          const sesiHari = groupedByDate[dateKey];
          const first = sesiHari[0];
          const isHariIni = first.status === "Hari Ini";

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: "2px solid var(--color-border-light)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: isHariIni ? "var(--color-primary)" : "var(--color-bg)", color: isHariIni ? "#fff" : "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                  {first.hari.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>
                    {isHariIni ? "Hari Ini" : `${first.hari}, ${first.tanggal}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {first.tanggal} · {sesiHari.length} sesi
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sesiHari.map((sesi) => (
                  <div key={sesi.id} className="sesi-card" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid var(--color-border-light)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderLeft: `4px solid ${sesi.warna}` }}>
                    {/* Jam */}
                    <div style={{ minWidth: 72, textAlign: "center", padding: "10px 8px", borderRadius: 12, flexShrink: 0, background: sesi.status === "Hari Ini" ? `${sesi.warna}12` : "var(--color-bg)" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: sesi.warna, lineHeight: 1.1 }}>{sesi.jam}</div>
                      {sesi.jamEnd !== "--" && <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{sesi.jamEnd}</div>}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>{sesi.kelas}</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>—</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>{sesi.program}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {sesi.totalSessions > 0 && (
                          <span>Pertemuan {sesi.sessionNumber}/{sesi.totalSessions}</span>
                        )}
                        <span style={{ background: `${sesi.warna}15`, color: sesi.warna, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                          {sesi.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress ring jika ada total sesi */}
                    {sesi.totalSessions > 0 && (
                      <div style={{ textAlign: "center", minWidth: 56 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${sesi.status === "Selesai" ? "var(--color-border)" : sesi.warna}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: sesi.status === "Selesai" ? "var(--color-text-muted)" : sesi.warna }}>
                            {Math.round((sesi.sessionNumber / sesi.totalSessions) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Aksi */}
                    <div style={{ flexShrink: 0 }}>
                      {sesi.status === "Hari Ini" ? (
                        <Link href={`/guru/kelas/${sesi.classroomId || sesi.id}`} style={{ background: "var(--color-primary)", color: "#fff", padding: "9px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          Mulai
                        </Link>
                      ) : sesi.status === "Mendatang" ? (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, padding: "6px 12px", background: "var(--color-bg)", borderRadius: 8, display: "inline-block" }}>
                          {sesi.jam}
                        </span>
                      ) : (
                        <Link href="/guru/logbook" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                          Logbook →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {sortedDates.length === 0 && sessions.length > 0 && (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Tidak ada jadwal</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Tidak ada sesi mengajar untuk filter ini.</div>
          </div>
        )}
      </div>
    </div>
  );
}
