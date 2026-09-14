/* ============================================================
   BSD After School Club — API Functions (Academic)
   Disesuaikan dengan endpoint backend: /api/v1
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type {
  Teacher, Program, Level, ClassRoom, Schedule,
  Attendance, Logbook, Assessment, Certificate,
} from "../types";
import type { PaginatedResponse, ApiResponse } from "./students";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TEACHERS (GURU)
//  Backend: GET|POST|PUT|DELETE /teachers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /teachers */
export async function getTeachers(
  params?: { page?: number; search?: string; status?: string }
): Promise<PaginatedResponse<Teacher>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Teacher>>("/teachers", { params });
  return data;
}

/** GET /teachers/:id */
export async function getTeacher(id: string): Promise<Teacher> {
  const { data } = await axiosInstance.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return data.data;
}

/** POST /teachers */
export async function createTeacher(payload: Omit<Teacher, "id">): Promise<Teacher> {
  const { data } = await axiosInstance.post<ApiResponse<Teacher>>("/teachers", payload);
  return data.data;
}

/** PUT /teachers/:id */
export async function updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
  const { data } = await axiosInstance.put<ApiResponse<Teacher>>(`/teachers/${id}`, payload);
  return data.data;
}

/** DELETE /teachers/:id */
export async function deleteTeacher(id: string): Promise<void> {
  await axiosInstance.delete(`/teachers/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PROGRAMS
//  Backend: GET|POST|PUT|DELETE /programs
//  Level nested: POST|PUT|DELETE /programs/{program}/levels
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /programs */
export async function getPrograms(): Promise<Program[]> {
  const { data } = await axiosInstance.get<ApiResponse<Program[]>>("/programs");
  return data.data;
}

/** POST /programs */
export async function createProgram(payload: Omit<Program, "id">): Promise<Program> {
  const { data } = await axiosInstance.post<ApiResponse<Program>>("/programs", payload);
  return data.data;
}

/** PUT /programs/:id */
export async function updateProgram(id: string, payload: Partial<Program>): Promise<Program> {
  const { data } = await axiosInstance.put<ApiResponse<Program>>(`/programs/${id}`, payload);
  return data.data;
}

/** DELETE /programs/:id */
export async function deleteProgram(id: string): Promise<void> {
  await axiosInstance.delete(`/programs/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LEVELS (nested di bawah Program)
//  Backend: POST /programs/{program}/levels
//           PUT  /programs/{program}/levels/{level}
//           DELETE /programs/{program}/levels/{level}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** POST /programs/:programId/levels */
export async function createLevel(programId: string, payload: Omit<Level, "id" | "programId" | "programName">): Promise<Level> {
  const { data } = await axiosInstance.post<ApiResponse<Level>>(`/programs/${programId}/levels`, payload);
  return data.data;
}

/** PUT /programs/:programId/levels/:levelId */
export async function updateLevel(programId: string, levelId: string, payload: Partial<Level>): Promise<Level> {
  const { data } = await axiosInstance.put<ApiResponse<Level>>(`/programs/${programId}/levels/${levelId}`, payload);
  return data.data;
}

/** DELETE /programs/:programId/levels/:levelId */
export async function deleteLevel(programId: string, levelId: string): Promise<void> {
  await axiosInstance.delete(`/programs/${programId}/levels/${levelId}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CLASSROOMS (KELAS)
//  Backend: GET|POST|PUT|DELETE /classrooms
//           POST   /classrooms/{classroom}/teachers     — assign guru ke kelas
//           DELETE /classrooms/{classroom}/teachers/{teacher} — lepas guru
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /classrooms */
export async function getClasses(
  params?: { page?: number; program?: string; teacher?: string; status?: string }
): Promise<PaginatedResponse<ClassRoom>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ClassRoom>>("/classrooms", { params });
  return data;
}

/** GET /classrooms/:id */
export async function getClass(id: string): Promise<ClassRoom> {
  const { data } = await axiosInstance.get<ApiResponse<ClassRoom>>(`/classrooms/${id}`);
  return data.data;
}

/** POST /classrooms */
export async function createClass(payload: Omit<ClassRoom, "id">): Promise<ClassRoom> {
  const { data } = await axiosInstance.post<ApiResponse<ClassRoom>>("/classrooms", payload);
  return data.data;
}

/** PUT /classrooms/:id */
export async function updateClass(id: string, payload: Partial<ClassRoom>): Promise<ClassRoom> {
  const { data } = await axiosInstance.put<ApiResponse<ClassRoom>>(`/classrooms/${id}`, payload);
  return data.data;
}

/** DELETE /classrooms/:id */
export async function deleteClass(id: string): Promise<void> {
  await axiosInstance.delete(`/classrooms/${id}`);
}

/** POST /classrooms/:classroomId/teachers — assign guru ke kelas */
export async function assignTeacherToClass(classroomId: string, teacherId: string): Promise<void> {
  await axiosInstance.post(`/classrooms/${classroomId}/teachers`, { teacher_id: teacherId });
}

/** DELETE /classrooms/:classroomId/teachers/:teacherId — lepas guru dari kelas */
export async function removeTeacherFromClass(classroomId: string, teacherId: string): Promise<void> {
  await axiosInstance.delete(`/classrooms/${classroomId}/teachers/${teacherId}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CLASS SCHEDULES (JADWAL REGULER)
//  Backend: GET|POST|PUT|DELETE /class-schedules
//           POST /class-schedules/{id}/generate-sessions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /class-schedules */
export async function getClassSchedules(
  params?: { classroom_id?: string; teacher_id?: string }
): Promise<Schedule[]> {
  const { data } = await axiosInstance.get<ApiResponse<Schedule[]>>("/class-schedules", { params });
  return data.data;
}

/** POST /class-schedules */
export async function createClassSchedule(payload: Omit<Schedule, "id">): Promise<Schedule> {
  const { data } = await axiosInstance.post<ApiResponse<Schedule>>("/class-schedules", payload);
  return data.data;
}

/** PUT /class-schedules/:id */
export async function updateClassSchedule(id: string, payload: Partial<Schedule>): Promise<Schedule> {
  const { data } = await axiosInstance.put<ApiResponse<Schedule>>(`/class-schedules/${id}`, payload);
  return data.data;
}

/** DELETE /class-schedules/:id */
export async function deleteClassSchedule(id: string): Promise<void> {
  await axiosInstance.delete(`/class-schedules/${id}`);
}

/** POST /class-schedules/:id/generate-sessions — generate sesi pertemuan dari jadwal */
export async function generateSessions(scheduleId: string): Promise<void> {
  await axiosInstance.post(`/class-schedules/${scheduleId}/generate-sessions`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CLASS SESSIONS (SESI / PERTEMUAN)
//  Backend: GET /class-sessions
//           GET|PUT /class-sessions/{id}
//           POST    /class-sessions/{id}/reschedule
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ClassSession {
  id: string;
  classroomId: string;
  scheduleId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: "Terjadwal" | "Berlangsung" | "Selesai" | "Dibatalkan";
  teacherName?: string;
  topic?: string;
}

/** GET /class-sessions */
export async function getClassSessions(
  params?: { classroom_id?: string; teacher_id?: string; date?: string; status?: string; page?: number }
): Promise<PaginatedResponse<ClassSession>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ClassSession>>("/class-sessions", { params });
  return data;
}

/** GET /class-sessions/:id */
export async function getClassSession(id: string): Promise<ClassSession> {
  const { data } = await axiosInstance.get<ApiResponse<ClassSession>>(`/class-sessions/${id}`);
  return data.data;
}

/** PUT /class-sessions/:id */
export async function updateClassSession(id: string, payload: Partial<ClassSession>): Promise<ClassSession> {
  const { data } = await axiosInstance.put<ApiResponse<ClassSession>>(`/class-sessions/${id}`, payload);
  return data.data;
}

/** POST /class-sessions/:id/reschedule */
export async function rescheduleSession(id: string, payload: { date: string; timeStart: string; timeEnd: string; reason?: string }): Promise<ClassSession> {
  const { data } = await axiosInstance.post<ApiResponse<ClassSession>>(`/class-sessions/${id}/reschedule`, payload);
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ATTENDANCE & LOGBOOK (ABSENSI & JURNAL GURU)
//  Backend: POST /class-sessions/{class_session}/submit-attendance
//           GET  /student-attendances
//           GET  /teacher-logbooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SubmitAttendancePayload {
  /** Data absensi tiap siswa */
  students: {
    student_id: string;
    /** present | absent | late | excused */
    attendance_status: "present" | "absent" | "late" | "excused";
    notes?: string;
  }[];
  /** Data logbook guru */
  logbook: {
    /** Format MySQL: "YYYY-MM-DD HH:mm:ss" — gunakan toMySqlDatetime() */
    check_in: string;
    /** Format MySQL: "YYYY-MM-DD HH:mm:ss" — harus >= check_in */
    check_out: string;
    /** Jumlah menit mengajar */
    teaching_minutes: number;
    /** Materi yang diajarkan */
    material: string;
    notes?: string;
  };
}

/**
 * POST /class-sessions/:sessionId/submit-attendance
 * Endpoint utama: submit absensi seluruh siswa + logbook guru dalam 1 request
 */
export async function submitAttendance(
  sessionId: string,
  payload: SubmitAttendancePayload
): Promise<void> {
  await axiosInstance.post(`/class-sessions/${sessionId}/submit-attendance`, payload);
}

/** GET /student-attendances — historis absensi siswa */
export async function getStudentAttendances(
  params?: { student_id?: string; classroom_id?: string; date?: string; page?: number }
): Promise<PaginatedResponse<Attendance>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Attendance>>("/student-attendances", { params });
  return data;
}

/** GET /teacher-logbooks — historis jurnal/logbook guru */
export async function getTeacherLogbooks(
  params?: { teacher_id?: string; classroom_id?: string; page?: number }
): Promise<PaginatedResponse<Logbook>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Logbook>>("/teacher-logbooks", { params });
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TEACHER PAYROLLS (HONOR GURU)
//  Backend: POST   /teacher-payrolls/generate
//           GET    /teacher-payrolls
//           GET    /teacher-payrolls/{id}
//           PUT    /teacher-payrolls/{id}
//           DELETE /teacher-payrolls/{id}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  teacherName: string;
  /** Format: "YYYY-MM-DD" */
  period_start: string;
  /** Format: "YYYY-MM-DD" */
  period_end: string;
  teaching_hours: number;
  base_amount: number;
  bonus_amount: number;
  total_amount: number;
  status: "draft" | "approved" | "paid";
}

/**
 * POST /teacher-payrolls/generate
 * @param teacher_id  UUID guru (dari GET /teachers)
 * @param period_start  "YYYY-MM-DD" — awal periode (mis. "2026-09-01")
 * @param period_end    "YYYY-MM-DD" — akhir periode (mis. "2026-09-30"), harus >= period_start
 */
export async function generatePayroll(payload: {
  teacher_id: string;
  period_start: string;
  period_end: string;
}): Promise<TeacherPayroll> {
  const { data } = await axiosInstance.post<ApiResponse<TeacherPayroll>>("/teacher-payrolls/generate", payload);
  return data.data;
}

/** GET /teacher-payrolls */
export async function getPayrolls(
  params?: { teacher_id?: string; period?: string; status?: string; page?: number }
): Promise<PaginatedResponse<TeacherPayroll>> {
  const { data } = await axiosInstance.get<PaginatedResponse<TeacherPayroll>>("/teacher-payrolls", { params });
  return data;
}

/** GET /teacher-payrolls/:id */
export async function getPayroll(id: string): Promise<TeacherPayroll> {
  const { data } = await axiosInstance.get<ApiResponse<TeacherPayroll>>(`/teacher-payrolls/${id}`);
  return data.data;
}

/** PUT /teacher-payrolls/:id */
export async function updatePayroll(id: string, payload: Partial<TeacherPayroll>): Promise<TeacherPayroll> {
  const { data } = await axiosInstance.put<ApiResponse<TeacherPayroll>>(`/teacher-payrolls/${id}`, payload);
  return data.data;
}

/** DELETE /teacher-payrolls/:id */
export async function deletePayroll(id: string): Promise<void> {
  await axiosInstance.delete(`/teacher-payrolls/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ASSESSMENTS & CERTIFICATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /assessments */
export async function getAssessments(
  params?: { student_id?: string; program?: string; status?: string }
): Promise<PaginatedResponse<Assessment>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Assessment>>("/assessments", { params });
  return data;
}

/** POST /assessments */
export async function createAssessment(payload: Omit<Assessment, "id">): Promise<Assessment> {
  const { data } = await axiosInstance.post<ApiResponse<Assessment>>("/assessments", payload);
  return data.data;
}

/** GET /certificates */
export async function getCertificates(
  params?: { student_id?: string; program?: string }
): Promise<Certificate[]> {
  const { data } = await axiosInstance.get<ApiResponse<Certificate[]>>("/certificates", { params });
  return data.data;
}

/**
 * Helper: konversi Date ke format MySQL datetime "YYYY-MM-DD HH:mm:ss"
 * Gunakan ini sebelum mengirim check_in / check_out ke submitAttendance()
 *
 * @example
 * logbook: {
 *   check_in:  toMySqlDatetime(new Date(Date.now() - 3600000)),
 *   check_out: toMySqlDatetime(new Date()),
 * }
 */
export function toMySqlDatetime(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DASHBOARD HELPERS
//  (tidak ada endpoint dashboard khusus — panggil beberapa endpoint sekaligus)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AcademicDashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  ongoingSessions: ClassSession[];
}

/** Helper: Ambil metrik dashboard akademik secara paralel */
export async function getAcademicDashboard(): Promise<AcademicDashboardSummary> {
  const [studentsRes, teachersRes, sessionsRes] = await Promise.all([
    axiosInstance.get<PaginatedResponse<unknown>>("/students", { params: { per_page: 1 } }),
    axiosInstance.get<PaginatedResponse<unknown>>("/teachers", { params: { per_page: 1 } }),
    axiosInstance.get<PaginatedResponse<ClassSession>>("/class-sessions", { params: { status: "Berlangsung" } }),
  ]);

  return {
    totalStudents: studentsRes.data.total,
    totalTeachers: teachersRes.data.total,
    ongoingSessions: sessionsRes.data.data,
  };
}
