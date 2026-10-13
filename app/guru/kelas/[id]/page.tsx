"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  getClassroomById, getClassSessions, createClassSession, submitAttendanceAndLogbook,
  type Classroom, type ClassSession, type SubmitAttendancePayload
} from "@/lib/api/academic";
import { SkeletonTable } from "@/components/ui/Skeleton";

type StatusKehadiran = "present" | "absent" | "late" | "excused";

export default function GuruKelasPage() {
  const routeParams = useParams();
  const classId = (routeParams?.id as string) || "";
  const { toast, showToast } = useToast();

  const classroomRef = useRef<Classroom | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [availableSessions, setAvailableSessions] = useState<ClassSession[]>([]);
  const [session, setSession] = useState<ClassSession | null>(null);

  const [kehadiran, setKehadiran] = useState<Record<string, StatusKehadiran>>({});
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sudahSimpan, setSudahSimpan] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [sedangMembuatSesi, setSedangMembuatSesi] = useState(false);

  const selectSession = useCallback((selected: ClassSession, currentClassroom?: Classroom | null) => {
    setSession(selected);
    const isCompleted = selected.status === "completed";
    setSudahSimpan(isCompleted);

    if (selected.teacherLogbook) {
      setMateri(selected.teacherLogbook.material || "");
      setCatatan(selected.teacherLogbook.notes || "");
    } else {
      setMateri("");
      setCatatan("");
    }

    const attMap: Record<string, StatusKehadiran> = {};
    if (selected.studentAttendances && selected.studentAttendances.length > 0) {
      selected.studentAttendances.forEach((a: any) => {
        attMap[a.student_id] = a.attendance_status;
      });
    } else {
      const cls = currentClassroom || classroomRef.current;
      if (cls?.students) {
        cls.students.forEach(st => {
          attMap[st.id] = "present";
        });
      }
    }
    setKehadiran(attMap);
  }, []);

  const fetchData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const [clsRes, sessionsRes] = await Promise.allSettled([
        getClassroomById(classId),
        getClassSessions({ classroom_id: classId })
      ]);

      let loadedClassroom: Classroom | null = null;
      if (clsRes.status === "fulfilled") {
        loadedClassroom = clsRes.value;
        classroomRef.current = loadedClassroom;
        setClassroom(loadedClassroom);
      } else {
        throw new Error("Gagal mengambil data kelas.");
      }

      if (sessionsRes.status === "fulfilled") {
        const allSessions = Array.isArray(sessionsRes.value) ? sessionsRes.value : [];

        // Filter sesi milik kelas ini
        const classSessions = allSessions
          .filter((s: ClassSession) => s.classroomId === classId || !s.classroomId)
          .sort((a: ClassSession, b: ClassSession) => (a.sessionNumber || 0) - (b.sessionNumber || 0));
        setAvailableSessions(classSessions);

        // Gunakan tanggal lokal agar terhindar dari pergeseran zona waktu
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        // Cari sesi untuk kelas ini pada hari ini
        let targetSession = classSessions.find((s: ClassSession) =>
           s.sessionDate?.substring(0, 10) === today
        );

        // Jika tidak ada sesi hari ini, ambil sesi terdekat yang belum selesai
        if (!targetSession) {
           const upcoming = classSessions
             .filter((s: ClassSession) => s.status !== "completed")
             .sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
           if (upcoming.length > 0) {
              targetSession = upcoming[0];
           }
           // Jika semua sudah selesai, ambil sesi terakhir
           if (!targetSession && classSessions.length > 0) {
             targetSession = classSessions[classSessions.length - 1];
           }
        }

        if (targetSession) {
          selectSession(targetSession, loadedClassroom);
        } else {
          setSession(null);
        }
      }
    } catch (e: any) {
      console.error("fetchData error:", e);
      setErrorMsg(e.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [classId, selectSession]);

  useEffect(() => {
    if (classId) {
      fetchData();
    }
  }, [classId, fetchData]);

  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getTodayDateStr();
  const adaSesiHariIni = availableSessions.some(
    s => s.sessionDate?.substring(0, 10) === todayStr
  );

  const now = new Date();
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayDayEn = dayNamesEn[now.getDay()];
  const todayDayId = dayNamesId[now.getDay()];

  const activeSchedules = classroom?.schedules || [];
  const scheduledDaysEn = activeSchedules.map(s => s.dayOfWeek);
  const hariSesuaiJadwal = activeSchedules.length === 0 || scheduledDaysEn.some(
    day => day.toLowerCase() === todayDayEn.toLowerCase()
  );

  const handleStartTodaySession = async () => {
    if (adaSesiHariIni) {
      showToast("Sesi untuk hari ini sudah dibuka.", "warning");
      return;
    }

    if (!hariSesuaiJadwal) {
      showToast(`Hari ini (${todayDayId}) bukan hari jadwal kelas ini. Jadwal reguler: ${scheduledDaysEn.join(", ")}.`, "danger");
      return;
    }

    setSedangMembuatSesi(true);
    try {
      const nextSessionNum = availableSessions.length > 0
        ? Math.max(...availableSessions.map(s => s.sessionNumber || 0)) + 1
        : 1;

      const scheduleForToday = activeSchedules.find(s => s.dayOfWeek.toLowerCase() === todayDayEn.toLowerCase());

      const newSession = await createClassSession({
        classroom_id: classId,
        session_number: nextSessionNum,
        session_date: todayStr,
        start_time: scheduleForToday?.startTime?.substring(0, 5) || "14:00",
        end_time: scheduleForToday?.endTime?.substring(0, 5) || "15:30",
        status: "scheduled"
      });

      setAvailableSessions(prev => [...prev, newSession]);
      selectSession(newSession, classroomRef.current || classroom);
      showToast("Sesi hari ini berhasil dibuka.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal membuka sesi: " + (err.response?.data?.message || err.message), "danger");
    } finally {
      setSedangMembuatSesi(false);
    }
  };

  const dataSiswa = classroom?.students || [];
  const sudahDiabsen = Object.keys(kehadiran).length;
  const totalSiswa = dataSiswa.length;
  const persenAbsen = totalSiswa > 0 ? Math.round((sudahDiabsen / totalSiswa) * 100) : 0;

  const setStatusKehadiran = (idSiswa: string, status: StatusKehadiran) => {
    if (sudahSimpan) return;
    setKehadiran(prev => ({ ...prev, [idSiswa]: status }));
  };

  const simpanLogbook = async () => {
    if (!session) {
      showToast("Pilih sesi terlebih dahulu sebelum menyimpan absensi.", "warning");
      return;
    }
    if (sudahDiabsen < totalSiswa || !materi.trim()) return;

    setSedangSimpan(true);
    try {
      const sessionDate = session.sessionDate ? session.sessionDate.substring(0, 10) : new Date().toISOString().split("T")[0];
      const startTimeStr = session.startTime ? session.startTime.substring(0, 5) : "14:00";
      const endTimeStr = session.endTime ? session.endTime.substring(0, 5) : "15:00";
      const checkIn = `${sessionDate} ${startTimeStr}:00`;
      const checkOut = `${sessionDate} ${endTimeStr}:00`;

      const [sh, sm] = startTimeStr.split(":").map(Number);
      const [eh, em] = endTimeStr.split(":").map(Number);
      const teachingMins = Math.max(1, (eh * 60 + em) - (sh * 60 + sm));

      const payload: SubmitAttendancePayload = {
        students: dataSiswa.map(s => ({
          student_id: s.id,
          attendance_status: kehadiran[s.id] || "absent",
          notes: catatan || undefined
        })),
        logbook: {
          check_in: checkIn,
          check_out: checkOut,
          teaching_minutes: teachingMins,
          material: materi,
          notes: catatan || undefined
        }
      };

      await submitAttendanceAndLogbook(session.id, payload);
      setSudahSimpan(true);
      setSession(prev => prev ? { ...prev, status: "completed" } : null);
      setAvailableSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: "completed" } : s));
      showToast("Absensi dan logbook berhasil disimpan.", "success");
    } catch (e: any) {
      const backendMsg = e?.response?.data?.message
        || e?.response?.data?.errors
        || e?.message
        || "Gagal menyimpan absensi dan logbook.";
      const detail = typeof backendMsg === "object" ? JSON.stringify(backendMsg) : backendMsg;
      showToast("Gagal menyimpan: " + detail, "danger");
      console.error("Submit attendance error:", e?.response?.data || e);
    } finally {
      setSedangSimpan(false);
    }
  };

  const warnaStatus: Record<StatusKehadiran, { bg: string; color: string; label: string }> = {
    present:  { bg: "#d1fae5", color: "#059669", label: "Hadir" },
    absent:  { bg: "#fce7f3", color: "#be185d", label: "Alpha/Sakit" },
    excused:   { bg: "#fef3c7", color: "#b45309", label: "Izin" },
    late:  { bg: "#e0f2fe", color: "#0369a1", label: "Terlambat" },
  };

  if (loading) return <SkeletonTable rows={3} cols={2} />;

  if (errorMsg) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 8 }}>Gagal Memuat Data Kelas</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{errorMsg}</div>
        <button className="btn btn-primary" onClick={fetchData}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Toast toast={toast} />

      <style>{`
        @keyframes munculMasuk { from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .tombol-absen { transition: all .15s ease; border: 2px solid transparent; }
        .tombol-absen:hover { transform: translateY(-1px); }
      `}</style>

      {/* Kepala Halaman */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{classroom?.name} — {classroom?.programLevel?.name || "Program"}</h1>
          <p className="page-subtitle">
            {session ? (
              `Pertemuan ke-${session.sessionNumber} · ${new Date(session.sessionDate || "").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${session.startTime?.substring(0,5)}–${session.endTime?.substring(0,5)}`
            ) : (
              "Belum ada sesi hari ini"
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <span style={{ background: session?.status === "completed" ? "#d1fae5" : "#e0f2fe", color: session?.status === "completed" ? "#059669" : "#0369a1", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 999 }}>
            {session?.status === "completed" ? "Selesai" : (session ? "Berlangsung" : "Belum Ada Sesi")}
          </span>
          {!adaSesiHariIni && (
            hariSesuaiJadwal ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleStartTodaySession}
                disabled={sedangMembuatSesi}
                style={{ fontWeight: 700 }}
              >
                {sedangMembuatSesi ? "Memproses..." : "+ Buka Sesi Hari Ini"}
              </button>
            ) : (
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px dashed #cbd5e1"
                }}
                title={`Hari ini (${todayDayId}) bukan hari jadwal kelas. Jadwal reguler: ${scheduledDaysEn.join(", ")}`}
              >
                Bukan hari jadwal ({todayDayId})
              </span>
            )
          )}
        </div>
      </div>

      {/* Selector Sesi Kelas */}
      {availableSessions.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid var(--color-border-light)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-muted)", flexShrink: 0, letterSpacing: 0.5, textTransform: "uppercase" }}>Daftar Sesi:</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
            {availableSessions.map((s) => {
              const isSelected = session?.id === s.id;
              const isCompleted = s.status === "completed";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSession(s)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isSelected ? "2px solid #0284c7" : "1px solid var(--color-border)",
                    background: isSelected ? "#0284c7" : isCompleted ? "#dcfce7" : "#ffffff",
                    color: isSelected ? "#ffffff" : isCompleted ? "#166534" : "var(--color-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>Sesi {s.sessionNumber}</span>
                  <span style={{ fontSize: 11, opacity: isSelected ? 0.9 : 0.7 }}>
                    ({s.sessionDate?.substring(5, 10)})
                  </span>
                  {isCompleted && <span style={{ fontSize: 12 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jika Belum Ada Sesi yang Dipilih / Dibuat */}
      {!session && (
        <div className="card" style={{ padding: "32px 24px", textAlign: "center", border: "1.5px dashed var(--color-border)", background: "#f8fafc" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
            {adaSesiHariIni ? "Pilih Sesi Kelas" : "Belum Ada Sesi Hari Ini"}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 440, margin: "0 auto 16px auto" }}>
            {adaSesiHariIni
              ? "Sesi untuk hari ini sudah dibuka. Silakan pilih nomor sesi pada daftar di atas untuk mengisi absensi dan logbook."
              : availableSessions.length > 0
              ? "Pilih nomor sesi di atas atau buka sesi baru untuk hari ini."
              : "Belum ada sesi terjadwal di kelas ini. Buka sesi baru untuk mulai absensi siswa."}
          </div>
          {!adaSesiHariIni && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStartTodaySession}
              disabled={sedangMembuatSesi}
              style={{ padding: "10px 22px", fontWeight: 700 }}
            >
              {sedangMembuatSesi ? "Memproses..." : "+ Buka Sesi Hari Ini"}
            </button>
          )}
        </div>
      )}

      {/* Status Kehadiran */}
      <div className="card" style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>Status Kehadiran</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{sudahDiabsen}/{totalSiswa} siswa</span>
        </div>
        <div style={{ height: 8, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "var(--color-primary)", width: `${persenAbsen}%`, transition: "width .3s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
          {totalSiswa > 0 ? `${sudahDiabsen} dari ${totalSiswa} siswa tercatat (${persenAbsen}%)` : "Belum ada siswa terdaftar"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* Panel Absensi */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Daftar Kehadiran</h2></div>
          <div className="card-body" style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 0 }}>
            {dataSiswa.length === 0 ? (
               <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>Belum ada siswa di kelas ini.</div>
            ) : (
              dataSiswa.map((siswa, i) => {
                const st = kehadiran[siswa.id];
                return (
                  <div key={siswa.id} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "12px 0", borderBottom: i < dataSiswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: st ? warnaStatus[st].bg : "var(--color-bg)", color: st ? warnaStatus[st].color : "var(--color-text-muted)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${st ? warnaStatus[st].color : "var(--color-border)"}`, transition: "all .2s ease" }}>
                      {siswa.name[0]?.toUpperCase()}
                    </div>

                    {/* Nama */}
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{siswa.name}</span>

                    {/* Tombol Status Absensi */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map(s => (
                        <button key={s} className="tombol-absen"
                          onClick={() => setStatusKehadiran(siswa.id, s)}
                          style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: sudahSimpan ? "not-allowed" : "pointer",
                            background: st === s ? warnaStatus[s].bg : "transparent",
                            color: st === s ? warnaStatus[s].color : "var(--color-text-muted)",
                            borderColor: st === s ? warnaStatus[s].color : "var(--color-border)",
                            animation: st === s ? "bounce .2s ease" : "none",
                            opacity: sudahSimpan && st !== s ? 0.5 : 1
                          }}>
                          {warnaStatus[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Ringkasan */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)", display: "flex", flexWrap: "wrap", gap: 14 }}>
            {(["present", "excused", "late", "absent"] as StatusKehadiran[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: warnaStatus[s].color }} />
                <span style={{ color: "var(--color-text-secondary)" }}>{warnaStatus[s].label}:</span>
                <span style={{ fontWeight: 700, color: warnaStatus[s].color }}>
                  {Object.values(kehadiran).filter(v => v === s).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Logbook */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><h2 className="card-title">Materi Pembelajaran</h2></div>
            <div className="card-body">
              <textarea
                value={materi} onChange={e => setMateri(e.target.value)}
                placeholder="Topik atau materi yang diajarkan hari ini..."
                readOnly={sudahSimpan}
                style={{ width: "100%", minHeight: 120, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease", backgroundColor: sudahSimpan ? "var(--color-bg)" : "white" }}
                onFocus={e => { if(!sudahSimpan) { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; } }}
                onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">Catatan Guru</h2></div>
            <div className="card-body">
              <textarea
                value={catatan} onChange={e => setCatatan(e.target.value)}
                placeholder="Catatan perkembangan atau kendala belajar siswa (opsional)..."
                readOnly={sudahSimpan}
                style={{ width: "100%", minHeight: 90, padding: "12px 14px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 13.5, color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s ease, box-shadow .2s ease", backgroundColor: sudahSimpan ? "var(--color-bg)" : "white" }}
                onFocus={e => { if(!sudahSimpan) { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,138,0.1)"; } }}
                onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Validasi & Tombol Simpan */}
          {!session && (
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#0369a1" }}>
              Pilih sesi di atas atau buka sesi baru untuk mengisi absensi.
            </div>
          )}
          {session && (sudahDiabsen < totalSiswa || !materi.trim()) && !sudahSimpan && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 12.5, color: "#92400e" }}>
              Lengkapi kehadiran siswa dan materi kelas sebelum menyimpan.
            </div>
          )}

          <button onClick={simpanLogbook}
            disabled={!session || sudahDiabsen < totalSiswa || !materi.trim() || sudahSimpan || sedangSimpan || totalSiswa === 0}
            style={{ width: "100%", padding: "13px", borderRadius: "var(--radius-md)", border: "none", fontWeight: 700, fontSize: 14, cursor: sudahSimpan || sedangSimpan || !session || totalSiswa === 0 ? "not-allowed" : "pointer", transition: "all .2s ease",
              background: sudahSimpan ? "#d1fae5" : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0 ? "var(--color-border)" : "var(--color-primary)",
              color: sudahSimpan ? "#059669" : sudahDiabsen < totalSiswa || !materi.trim() || !session || totalSiswa === 0 ? "var(--color-text-muted)" : "white",
            }}>
            {sedangSimpan ? "Menyimpan..." : sudahSimpan ? "Data Tersimpan" : "Simpan Absensi & Logbook"}
          </button>
        </div>
      </div>
    </div>
  );
}
