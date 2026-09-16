/* ============================================================
   BSD After School Club — API Functions (Students & Parents)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { Student, Parent, Enrollment } from "../types";

// ── Types untuk response paginasi Laravel ──────────────────
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STUDENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /students */
export async function getStudents(
  params?: { page?: number; per_page?: number; search?: string; status?: string }
): Promise<PaginatedResponse<Student>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Student>>("/students", { params });
  return data;
}

/** GET /students/:id */
export async function getStudent(id: string): Promise<Student> {
  const { data } = await axiosInstance.get<ApiResponse<Student>>(`/students/${id}`);
  return data.data;
}

/** POST /students */
export async function createStudent(payload: Omit<Student, "id">): Promise<Student> {
  const { data } = await axiosInstance.post<ApiResponse<Student>>("/students", payload);
  return data.data;
}

/** PUT /students/:id */
export async function updateStudent(id: string, payload: Partial<Student>): Promise<Student> {
  const { data } = await axiosInstance.put<ApiResponse<Student>>(`/students/${id}`, payload);
  return data.data;
}

/** DELETE /students/:id */
export async function deleteStudent(id: string): Promise<void> {
  await axiosInstance.delete(`/students/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PARENTS (ORANG TUA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /parents */
export async function getParents(
  params?: { page?: number; per_page?: number; search?: string }
): Promise<PaginatedResponse<Parent>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Parent>>("/parents", { params });
  return data;
}

/** GET /parents/:id */
export async function getParent(id: string): Promise<Parent> {
  const { data } = await axiosInstance.get<ApiResponse<Parent>>(`/parents/${id}`);
  return data.data;
}

/** POST /parents */
export async function createParent(payload: Omit<Parent, "id">): Promise<Parent> {
  const { data } = await axiosInstance.post<ApiResponse<Parent>>("/parents", payload);
  return data.data;
}

/** PUT /parents/:id */
export async function updateParent(id: string, payload: Partial<Parent>): Promise<Parent> {
  const { data } = await axiosInstance.put<ApiResponse<Parent>>(`/parents/${id}`, payload);
  return data.data;
}

/** DELETE /parents/:id */
export async function deleteParent(id: string): Promise<void> {
  await axiosInstance.delete(`/parents/${id}`);
}

// ── Relasi Parent ↔ Student ─────────────────────────────────
// Backend: POST   /parents/{parent}/students/{student}
//          DELETE /parents/{parent}/students/{student}

/** POST /parents/:parentId/students/:studentId — kaitkan anak ke orang tua */
export async function linkStudentToParent(parentId: string, studentId: string): Promise<void> {
  await axiosInstance.post(`/parents/${parentId}/students/${studentId}`);
}

/** DELETE /parents/:parentId/students/:studentId — lepas kaitan anak dari orang tua */
export async function unlinkStudentFromParent(parentId: string, studentId: string): Promise<void> {
  await axiosInstance.delete(`/parents/${parentId}/students/${studentId}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ENROLLMENT (PENDAFTARAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /enrollments */
export async function getEnrollments(
  params?: { page?: number; status?: string; per_page?: number; search?: string }
): Promise<PaginatedResponse<Enrollment>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>("/enrollments", { params });
  return data;
}

/** POST /enrollments */
export async function createEnrollment(payload: Omit<Enrollment, "id" | "submittedAt">): Promise<Enrollment> {
  const { data } = await axiosInstance.post<ApiResponse<Enrollment>>("/enrollments", payload);
  return data.data;
}

/** PATCH /enrollments/:id/approve */
export async function approveEnrollment(id: string, reviewedBy: string): Promise<Enrollment> {
  const { data } = await axiosInstance.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/approve`, { reviewed_by: reviewedBy });
  return data.data;
}

/** PATCH /enrollments/:id/reject */
export async function rejectEnrollment(id: string, notes: string): Promise<Enrollment> {
  const { data } = await axiosInstance.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/reject`, { notes });
  return data.data;
}
