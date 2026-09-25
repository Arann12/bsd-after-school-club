import axiosInstance from "./axiosInstance";
import type { PaginatedResponse, ApiResponse } from "./types";

export interface Enrollment {
  id: string;
  student_id: string;
  classroom_id: string;
  start_date: string;
  total_sessions: number;
  sessions_per_week: number;
  payment_scheme: string;
  total_amount: number;
  status: string;
}

export interface CreateEnrollmentPayload {
  student_id: string;
  classroom_id: string;
  start_date: string;
  total_sessions: number;
  sessions_per_week?: number;
  payment_scheme: "package" | "per_session" | "monthly";
  total_amount?: number;
  amount_per_session?: number;
  installments?: number;
}

export async function getEnrollments(
  params?: { page?: number; status?: string; per_page?: number; search?: string }
): Promise<PaginatedResponse<Enrollment>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Enrollment>>("/enrollments", { params });
  return data;
}

export async function createEnrollment(payload: CreateEnrollmentPayload | any): Promise<any> {
  const { data } = await axiosInstance.post("/enrollments", payload);
  return data;
}

export async function approveEnrollment(id: string, reviewedBy: string): Promise<Enrollment> {
  const { data } = await axiosInstance.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/approve`, { reviewed_by: reviewedBy });
  return data.data;
}

export async function rejectEnrollment(id: string, notes: string): Promise<Enrollment> {
  const { data } = await axiosInstance.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/reject`, { notes });
  return data.data;
}
