/* ============================================================
   BSD After School Club — API Functions (Academic)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type {
  Teacher, Program, Level, ClassRoom, Schedule,
  Attendance, Logbook, Assessment, Certificate,
} from "../types";
import type { PaginatedResponse, ApiResponse } from "./students";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TEACHERS (GURU)
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
//  PROGRAMS & LEVELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /programs */
export async function getPrograms(): Promise<Program[]> {
  const { data } = await axiosInstance.get<ApiResponse<Program[]>>("/programs");
  return data.data;
}

/** GET /programs/:id */
export async function getProgram(id: string): Promise<Program> {
  const { data } = await axiosInstance.get<ApiResponse<Program>>(`/programs/${id}`);
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

/** GET /levels?program_id=... */
export async function getLevels(programId?: string): Promise<Level[]> {
  const { data } = await axiosInstance.get<ApiResponse<Level[]>>("/levels", {
    params: programId ? { program_id: programId } : undefined,
  });
  return data.data;
}

/** POST /levels */
export async function createLevel(payload: Omit<Level, "id">): Promise<Level> {
  const { data } = await axiosInstance.post<ApiResponse<Level>>("/levels", payload);
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CLASSES & SCHEDULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /classes */
export async function getClasses(
  params?: { page?: number; program?: string; teacher?: string; status?: string }
): Promise<PaginatedResponse<ClassRoom>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ClassRoom>>("/classes", { params });
  return data;
}

/** GET /classes/:id */
export async function getClass(id: string): Promise<ClassRoom> {
  const { data } = await axiosInstance.get<ApiResponse<ClassRoom>>(`/classes/${id}`);
  return data.data;
}

/** POST /classes */
export async function createClass(payload: Omit<ClassRoom, "id">): Promise<ClassRoom> {
  const { data } = await axiosInstance.post<ApiResponse<ClassRoom>>("/classes", payload);
  return data.data;
}

/** PUT /classes/:id */
export async function updateClass(id: string, payload: Partial<ClassRoom>): Promise<ClassRoom> {
  const { data } = await axiosInstance.put<ApiResponse<ClassRoom>>(`/classes/${id}`, payload);
  return data.data;
}

/** GET /schedules */
export async function getSchedules(
  params?: { class_id?: string; teacher_id?: string; date?: string }
): Promise<Schedule[]> {
  const { data } = await axiosInstance.get<ApiResponse<Schedule[]>>("/schedules", { params });
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ATTENDANCE (ABSENSI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /attendances */
export async function getAttendances(
  params?: { class_id?: string; student_id?: string; date?: string; page?: number }
): Promise<PaginatedResponse<Attendance>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Attendance>>("/attendances", { params });
  return data;
}

/** POST /attendances — buat absensi satu sesi (bulk array) */
export async function createAttendances(records: Omit<Attendance, "id">[]): Promise<Attendance[]> {
  const { data } = await axiosInstance.post<ApiResponse<Attendance[]>>("/attendances", { records });
  return data.data;
}

/** PATCH /attendances/:id */
export async function updateAttendance(
  id: string,
  payload: Pick<Attendance, "status" | "note">
): Promise<Attendance> {
  const { data } = await axiosInstance.patch<ApiResponse<Attendance>>(`/attendances/${id}`, payload);
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LOGBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /logbooks */
export async function getLogbooks(
  params?: { class_id?: string; page?: number }
): Promise<PaginatedResponse<Logbook>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Logbook>>("/logbooks", { params });
  return data;
}

/** POST /logbooks */
export async function createLogbook(payload: Omit<Logbook, "id">): Promise<Logbook> {
  const { data } = await axiosInstance.post<ApiResponse<Logbook>>("/logbooks", payload);
  return data.data;
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

/** POST /certificates — generate sertifikat */
export async function issueCertificate(assessmentId: string): Promise<Certificate> {
  const { data } = await axiosInstance.post<ApiResponse<Certificate>>("/certificates", { assessment_id: assessmentId });
  return data.data;
}
