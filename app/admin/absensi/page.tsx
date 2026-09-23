"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { 
  getClassSessions, getClassroomById, submitAttendanceAndLogbook,
  type ClassSession, type Classroom, type SubmitAttendancePayload
} from "@/lib/api/academic";

export default function AbsensiPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  
  const [studentsAttendance, setStudentsAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [logbookForm, setLogbookForm] = useState({
    check_in: "",
    check_out: "",
    teaching_minutes: 60,
    material: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClassSessions(); // Backend doesn't filter yet, filter on client
      const filtered = res.filter(s => s.sessionDate === selectedDate);
      // Sort by start time
      filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setSessions(filtered);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat jadwal sesi.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpenForm = async (session: ClassSession) => {
    setActiveSession(session);
    setActiveClassroom(null);
    setStudentsAttendance({});
    setLogbookForm({
      check_in: `${session.sessionDate}T${session.startTime}`,
      check_out: `${session.sessionDate}T${session.endTime}`,
      teaching_minutes: calculateMinutes(session.startTime, session.endTime),
      material: "",
      notes: ""
    });
    setShowModal(true);

    try {
      const classroom = await getClassroomById(session.classroomId);
      setActiveClassroom(classroom);
      
      // Initialize attendance state for all enrolled students
      const initAtt: Record<string, { status: string; notes: string }> = {};
      classroom.students.forEach(s => {
        initAtt[s.id] = { status: "present", notes: "" };
      });
      setStudentsAttendance(initAtt);
    } catch (err) {
      alert("Gagal memuat data siswa untuk kelas ini.");
    }
  };

  const calculateMinutes = (start: string, end: string) => {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : 60;
  };

  const handleAttendanceChange = (studentId: string, field: "status" | "notes", value: string) => {
    setStudentsAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!activeSession) return;
    if (!logbookForm.check_in || !logbookForm.check_out || !logbookForm.material) {
      return alert("Mohon lengkapi logbook: Jam Masuk, Jam Keluar, dan Materi.");
    }

    setSubmitting(true);
    try {
      const payload: SubmitAttendancePayload = {
        students: Object.entries(studentsAttendance).map(([id, data]) => ({
          student_id: id,
          attendance_status: data.status as "present" | "absent" | "late" | "excused",
          notes: data.notes || undefined
        })),
        logbook: {
          check_in: logbookForm.check_in.includes("T") ? logbookForm.check_in.replace("T", " ") : logbookForm.check_in,
          check_out: logbookForm.check_out.includes("T") ? logbookForm.check_out.replace("T", " ") : logbookForm.check_out,
          teaching_minutes: logbookForm.teaching_minutes,
          material: logbookForm.material,
          notes: logbookForm.notes || undefined
        }
      };

      await submitAttendanceAndLogbook(activeSession.id, payload);
      alert("Absensi dan Logbook berhasil disimpan!");
      setShowModal(false);
      fetchSessions();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan data: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Absensi & Logbook</h1>
          <p style={{ color: "var(--color-text-secondary)", margin: "4px 0 0 0", fontSize: 14 }}>Isi kehadiran siswa dan catat jurnal kegiatan belajar.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Tanggal Sesi:</label>
          <input 
            type="date" 
            className="form-input" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={{ width: 150 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>Memuat sesi...</div>
      ) : error ? (
        <div style={{ color: "var(--color-danger)", padding: 20 }}>{error}</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#f8fafc", borderRadius: 12, border: "1px dashed var(--color-border-light)" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>Tidak ada jadwal sesi</div>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
            Pastikan tanggal yang dipilih benar, atau pastikan Admin sudah men-generate sesi pada Jadwal Rutin.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {sessions.map(s => {
            const isCompleted = s.status === "completed";
            return (
              <div key={s.id} style={{ 
                background: "#fff", 
                border: `1px solid ${isCompleted ? "#86efac" : "var(--color-border-light)"}`, 
                borderRadius: 12, 
                padding: 20,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    padding: "4px 8px", 
                    borderRadius: 20, 
                    background: isCompleted ? "#dcfce7" : "#e0e7ff", 
                    color: isCompleted ? "#166534" : "#3730a3" 
                  }}>
                    {isCompleted ? "SELESAI" : "TERJADWAL"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                  </span>
                </div>
                
                <h3 style={{ margin: "0 0 4px 0", fontSize: 16, color: "var(--color-text-primary)" }}>{s.classroom?.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Guru: {s.teacher?.name || "Tidak ada guru"}</p>
                <p style={{ margin: "4px 0 16px 0", fontSize: 12, color: "var(--color-text-muted)" }}>Sesi ke-{s.sessionNumber}</p>
                
                <button 
                  className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}`} 
                  style={{ width: "100%", border: isCompleted ? "1px solid #bbf7d0" : undefined }}
                  onClick={() => handleOpenForm(s)}
                >
                  {isCompleted ? "Lihat/Edit Jurnal" : "Isi Absen & Logbook"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ABSENSI & LOGBOOK */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={`Sesi: ${activeSession?.classroom?.name || ""}`} maxWidth={700}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: "80vh", overflowY: "auto", paddingRight: 8 }}>
          
          {/* Bagian Absensi */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 15, color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-light)", paddingBottom: 8 }}>Daftar Hadir Siswa</h4>
            {!activeClassroom ? (
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Memuat daftar siswa...</div>
            ) : activeClassroom.students.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Tidak ada siswa aktif di kelas ini.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeClassroom.students.map(student => (
                  <div key={student.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 10, alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{student.name}</div>
                    <div>
                      <select 
                        className="form-input" 
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        value={studentsAttendance[student.id]?.status || "present"}
                        onChange={e => handleAttendanceChange(student.id, "status", e.target.value)}
                      >
                        <option value="present">Hadir</option>
                        <option value="absent">Absen (Tanpa Ket)</option>
                        <option value="late">Terlambat</option>
                        <option value="excused">Izin / Sakit</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Catatan nilai/perilaku..." 
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        value={studentsAttendance[student.id]?.notes || ""}
                        onChange={e => handleAttendanceChange(student.id, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian Logbook */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 15, color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-light)", paddingBottom: 8 }}>Logbook Guru (Jurnal)</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Jam Masuk Aktual</label>
                <input type="datetime-local" className="form-input" value={logbookForm.check_in} onChange={e => setLogbookForm({...logbookForm, check_in: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Jam Keluar Aktual</label>
                <input type="datetime-local" className="form-input" value={logbookForm.check_out} onChange={e => setLogbookForm({...logbookForm, check_out: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Total Menit (Untuk Payroll)</label>
                <input type="number" className="form-input" value={logbookForm.teaching_minutes} onChange={e => setLogbookForm({...logbookForm, teaching_minutes: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Materi yang Diajarkan *</label>
              <textarea className="form-input" rows={2} placeholder="Contoh: Phonics Blends, Membaca 2 Suku Kata..." value={logbookForm.material} onChange={e => setLogbookForm({...logbookForm, material: e.target.value})}></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Catatan Kelas (Opsional)</label>
              <textarea className="form-input" rows={2} placeholder="Kondisi kelas secara keseluruhan..." value={logbookForm.notes} onChange={e => setLogbookForm({...logbookForm, notes: e.target.value})}></textarea>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, position: "sticky", bottom: -20, background: "#fff", paddingTop: 10, borderTop: "1px solid var(--color-border-light)" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting || !activeClassroom}>
              {submitting ? "Menyimpan Data..." : "Simpan Absensi & Logbook"}
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
