"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getClassSessions, type ClassSession } from "@/lib/api/academic";

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
  bulanKey: string; // YYYY-MM
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
  isLibur: boolean;
  classroomId: string;
}

const listBulan = [
  { key: "2026-08", label: "Agustus 2026", days: 31, offsetStart: 5 },
  { key: "2026-09", label: "September 2026", days: 30, offsetStart: 1 },
  { key: "2026-10", label: "Oktober 2026", days: 31, offsetStart: 3 },
  { key: "2026-11", label: "November 2026", days: 30, offsetStart: 6 },
  { key: "2026-12", label: "Desember 2026", days: 31, offsetStart: 1 },
];

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];

// Helper date
function getStatusSesi(sessionDate: string): "Hari Ini" | "Mendatang" | "Selesai" {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(sessionDate); d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Hari Ini";
  if (d > today) return "Mendatang";
  return "Selesai";
}

function warnaStatus(status: string) {
  if (status === "Hari Ini") return "#059669";
  if (status === "Mendatang") return "#1d4ed8";
  return "#64748b";
}

export default function GuruKalenderLogbookPage() {
  const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g., "2026-09"
  
  // Create current month list item dynamically if not in the list yet
  const dynamicBulanList = [...listBulan];
  if (!dynamicBulanList.find((b) => b.key === currentMonthKey)) {
      const d = new Date();
      d.setDate(1);
      const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      let offset = d.getDay() - 1; // 0 for Monday, -1 for Sunday
      if (offset < 0) offset = 6;
      dynamicBulanList.push({
          key: currentMonthKey,
          label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          days,
          offsetStart: offset,
      });
      dynamicBulanList.sort((a, b) => a.key.localeCompare(b.key));
  }

  const [selectedBulanKey, setSelectedBulanKey] = useState(currentMonthKey);
  const [logbookList, setLogbookList] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<{ dayNum: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchLogbooks = useCallback(async () => {
    setLoading(true);
    try {
      const sessionsRes = await getClassSessions({ per_page: 200 });
      const sessions: ClassSession[] = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes.data || []);
      
      const entries: LogbookEntry[] = sessions.map((s) => {
        const dateKey = s.sessionDate?.split("T")[0] ?? "";
        const bulanKey = dateKey.substring(0, 7);
        const dayNum = parseInt(dateKey.substring(8, 10), 10);
        const tglDisplay = new Date(dateKey).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const status = getStatusSesi(dateKey);
        
        const attendances = s.studentAttendances || [];
        const hadir = attendances.filter((a: any) => a.attendance_status === "present").length;
        const izin = attendances.filter((a: any) => a.attendance_status === "excused").length;
        const sakit = attendances.filter((a: any) => a.attendance_status === "absent" && (a.notes || "").toLowerCase().includes("sakit")).length; // Basic approximation
        const alpha = attendances.filter((a: any) => a.attendance_status === "absent" && !(a.notes || "").toLowerCase().includes("sakit")).length;

        const siswaAbsensi: SiswaAbsenItem[] = attendances.map((a: any) => {
           let sts: "Hadir" | "Izin" | "Sakit" | "Alpha" = "Hadir";
           if (a.attendance_status === "present") sts = "Hadir";
           else if (a.attendance_status === "excused") sts = "Izin";
           else if (a.attendance_status === "absent") sts = (a.notes || "").toLowerCase().includes("sakit") ? "Sakit" : "Alpha";
           
           return {
             nama: a.student?.full_name || a.student?.name || "Unknown Student",
             status: sts,
             catatan: a.notes || undefined,
           };
        });

        return {
          id: s.id,
          tanggal: dateKey,
          tglDisplay,
          dayNum,
          bulanKey,
          kelas: s.classroom?.name || "Kelas",
          program: s.classroom?.programLevel?.name || s.classSchedule?.classroom?.programLevel?.name || "Program",
          jam: `${s.startTime?.substring(0,5) || "--"} - ${s.endTime?.substring(0,5) || "--"}`,
          ruang: "Ruang Kelas",
          pertemuan: s.sessionNumber || 0,
          totalPertemuan: 0, 
          materi: s.teacherLogbook?.material || "Belum diisi",
          catatanGuru: s.teacherLogbook?.notes || "Tidak ada catatan.",
          hadir,
          totalSiswa: attendances.length,
          izin,
          sakit,
          alpha,
          status,
          warna: warnaStatus(status),
          siswaAbsensi,
          isLibur: s.isHoliday,
          classroomId: s.classroomId,
        };
      });

      setLogbookList(entries);
    } catch (e) {
      console.error("Failed to load logbooks", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogbooks();
  }, [fetchLogbooks]);

  const currentBulan = dynamicBulanList.find((b) => b.key === selectedBulanKey) || dynamicBulanList[1];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrevBulan = () => {
    const idx = dynamicBulanList.findIndex((b) => b.key === selectedBulanKey);
    if (idx > 0) setSelectedBulanKey(dynamicBulanList[idx - 1].key);
  };

  const handleNextBulan = () => {
    const idx = dynamicBulanList.findIndex((b) => b.key === selectedBulanKey);
    if (idx < dynamicBulanList.length - 1) setSelectedBulanKey(dynamicBulanList[idx + 1].key);
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
    // Get all sessions for this day
    const foundSessions = logbookList.filter((l) => l.tanggal === dateStr);
    if (foundSessions.length > 0) {
      // If there are multiple sessions, maybe open a list, but for now open the first one
      setSelectedLogbook(foundSessions[0]);
    } else {
      setSelectedEmptyDay({ dayNum });
    }
  };

  const calendarDays = Array.from({ length: currentBulan.days }, (_, i) => i + 1);
  const emptyOffsets = Array.from({ length: currentBulan.offsetStart }, (_, i) => i);

  if (loading) return <SkeletonTable rows={5} cols={7} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
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
        .cal-cell.has-pending {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .cal-cell.has-pending:hover {
          border-color: #ea580c;
          box-shadow: 0 4px 16px rgba(234,88,12,0.12);
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
              disabled={dynamicBulanList.findIndex((b) => b.key === selectedBulanKey) === 0}
              style={{ padding: "6px 10px", fontSize: 16, lineHeight: 1 }}>
              ‹
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)", margin: 0, minWidth: 240, textAlign: "center" }}>
              Kalender Presensi & Logbook — {currentBulan.label}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={handleNextBulan}
              disabled={dynamicBulanList.findIndex((b) => b.key === selectedBulanKey) === dynamicBulanList.length - 1}
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
              <span style={{ color: "#ea580c" }}>Pending (Logbook Kosong)</span>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {emptyOffsets.map((_, idx) => (
            <div key={`off-${idx}`} style={{ minHeight: 120, borderRadius: 14, background: "#f9fafb", border: "1.5px solid #f1f5f9", opacity: 0.4 }} />
          ))}

          {calendarDays.map((dayNum) => {
            const dateStr = `${selectedBulanKey}-${dayNum.toString().padStart(2, "0")}`;
            const sessionsToday = logbookList.filter((l) => l.tanggal === dateStr);
            const found = sessionsToday.length > 0 ? sessionsToday[0] : null;
            
            const isCompleted = found?.materi !== "Belum diisi" && found?.totalSiswa > 0;
            const isPending = found && !isCompleted;

            return (
              <div
                key={dayNum}
                className={`cal-cell ${isCompleted ? "has-class" : isPending ? "has-pending" : ""}`}
                onClick={() => handleDayClick(dayNum)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 900,
                    color: found ? "#1a202c" : "#94a3b8",
                  }}>
                    {dayNum}
                  </span>
                  {isCompleted && (
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: "#d1fae5", color: "#059669" }}>
                      Selesai
                    </span>
                  )}
                  {isPending && (
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: "#fef3c7", color: "#d97706" }}>
                      Pending
                    </span>
                  )}
                </div>

                {found ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "auto" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a202c", lineHeight: 1.3 }}>
                      {found.program.split(" ")[0]} {found.kelas.split("-")[1] || ""}
                    </div>
                    {sessionsToday.length > 1 && (
                      <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700 }}>
                        + {sessionsToday.length - 1} Sesi Lain
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                      {found.hadir} / {found.totalSiswa} Siswa
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#c1c9d4", fontStyle: "italic", marginTop: "auto" }}>
                    Kosong
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Detail Logbook */}
      {selectedLogbook && (
      <Modal open onClose={() => setSelectedLogbook(null)} title="Detail Logbook" maxWidth={600}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ background: selectedLogbook?.warna, color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
              {selectedLogbook?.kelas}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{selectedLogbook?.id}</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a202c", margin: 0 }}>
            {selectedLogbook?.tglDisplay}
          </h2>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
            {selectedLogbook?.program} · Pertemuan {selectedLogbook?.pertemuan} · {selectedLogbook?.jam} · {selectedLogbook?.ruang}
          </div>
        </div>

        {/* Materi */}
        <div style={{ background: "linear-gradient(135deg, #f0fdf8, #dcfce7)", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Materi Pembelajaran</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#14532d", lineHeight: 1.4 }}>{selectedLogbook?.materi}</div>
        </div>

        {/* Kehadiran */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Rekap Kehadiran</span>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook?.hadir} Hadir</span>
              {selectedLogbook && selectedLogbook.izin > 0 && <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.izin} Izin</span>}
              {selectedLogbook && selectedLogbook.sakit > 0 && <span style={{ background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{selectedLogbook.sakit} Sakit</span>}
            </div>
          </div>
          {selectedLogbook?.siswaAbsensi.length === 0 ? (
            <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, textAlign: "center", color: "#94a3b8", fontSize: 13, border: "1px solid #e2e8f0" }}>
              Absensi belum diisi
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedLogbook?.siswaAbsensi.map((s, i) => {
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
          )}
        </div>

        {/* Catatan Guru */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Catatan Guru</div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#334155", lineHeight: 1.6, border: "1px solid #e2e8f0", fontStyle: "italic" }}>
            {selectedLogbook?.catatanGuru === "Tidak ada catatan." || !selectedLogbook?.catatanGuru ? 
               <span style={{ color: "#94a3b8" }}>Tidak ada catatan.</span> : 
               `"${selectedLogbook?.catatanGuru}"`
            }
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { setSelectedLogbook(null); showToast("Logbook berhasil diunduh sebagai PDF!"); }} style={{ flex: 1, justifyContent: "center" }}>Unduh PDF</button>
          
          {selectedLogbook?.materi === "Belum diisi" ? (
             <Link href={`/guru/kelas/${selectedLogbook.classroomId || selectedLogbook.id}`} className="btn btn-primary" style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>
               Isi Logbook Sekarang
             </Link>
          ) : (
            <button className="btn btn-accent" onClick={() => { setSelectedLogbook(null); showToast("Logbook berhasil dikirim ke Orang Tua!"); }} style={{ flex: 1, justifyContent: "center" }}>Kirim ke Ortu</button>
          )}
        </div>
      </Modal>
      )}

      {/* MODAL: Hari Kosong */}
      <Modal open={!!selectedEmptyDay} onClose={() => setSelectedEmptyDay(null)} title={`Tanggal ${selectedEmptyDay?.dayNum} ${currentBulan.label}`} maxWidth={440}>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 18 }}>
          Tidak ada kelas atau logbook untuk tanggal ini. Hari libur / kosong.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/guru/jadwal" className="btn btn-accent" style={{ flex: 1, textAlign: "center", textDecoration: "none", justifyContent: "center" }}>Lihat Jadwal</Link>
          <button className="btn btn-ghost" onClick={() => setSelectedEmptyDay(null)} style={{ flex: 1, justifyContent: "center" }}>Tutup</button>
        </div>
      </Modal>
    </div>
  );
}
