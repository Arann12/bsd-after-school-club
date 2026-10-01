/* ============================================================
   BSD After School Club — Teachers API Service
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { PaginatedResponse, ApiResponse } from "./types";
import type { AuthUser } from "./auth";

export interface TeacherRaw {
  id: string;
  teacher_code: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  is_active: boolean;
  user_id: string;
  user?: AuthUser;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  teacherCode: string;
  name: string;
  email: string;
  phone: string;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  isActive: boolean;
}

export function mapTeacher(raw: TeacherRaw): Teacher {
  return {
    id: raw.id,
    teacherCode: raw.teacher_code,
    name: raw.user?.name || "-",
    email: raw.user?.email || "-",
    phone: raw.user?.phone || "-",
    bankName: raw.bank_name,
    bankAccountName: raw.bank_account_name,
    bankAccountNumber: raw.bank_account_number,
    isActive: raw.is_active,
  };
}

export async function getTeachers(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
  } = {}
) {
  const res = await axiosInstance.get<PaginatedResponse<TeacherRaw>>("/teachers", { params });
  const page = res.data.data;
  return {
    data: page.data.map(mapTeacher),
    total: page.total,
    currentPage: page.current_page,
    lastPage: page.last_page,
    perPage: page.per_page,
  };
}

export async function getTeacher(id: string) {
  const res = await axiosInstance.get<ApiResponse<TeacherRaw>>(`/teachers/${id}`);
  return mapTeacher(res.data.data);
}

export async function getMyTeacherProfile() {
  const res = await axiosInstance.get<ApiResponse<TeacherRaw>>("/teachers/my-profile");
  return mapTeacher(res.data.data);
}

export async function createTeacher(data: Record<string, any>) {
  const res = await axiosInstance.post<ApiResponse<TeacherRaw>>("/teachers", data);
  return mapTeacher(res.data.data);
}

export async function updateTeacher(id: string, data: Record<string, any>) {
  const res = await axiosInstance.put<ApiResponse<TeacherRaw>>(`/teachers/${id}`, data);
  return mapTeacher(res.data.data);
}

export async function deleteTeacher(id: string) {
  const res = await axiosInstance.delete<ApiResponse<any>>(`/teachers/${id}`);
  return res.data;
}
