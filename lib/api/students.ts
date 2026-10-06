/* ============================================================
   BSD After School Club — Students API Service
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { PaginatedResponse, ApiResponse } from "./types";
import type { AuthUser } from "./auth";

export interface ParentRelation {
  id: string;
  parent_code: string;
  relationship: string;
  address: string | null;
  user?: AuthUser;
}

export interface StudentRaw {
  id: string;
  student_code: string;
  full_name: string;
  birth_date: string | null;
  school_name: string | null;
  school_grade: string | null;
  address: string | null;
  status: string;
  parents?: ParentRelation[];
  nis?: string;
  program?: { id?: string; name?: string; [key: string]: any };
  enrollments?: Array<{
    id: string;
    program_level_id?: string;
    classroom?: any;
    [key: string]: any;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  birthDate: string | null;
  schoolName: string | null;
  schoolGrade: string | null;
  address: string | null;
  status: string;
  parents: { id: string; name: string; relationship: string; phone: string }[];
  nis?: string;
  program?: { id?: string; name?: string; [key: string]: any };
  enrollments?: Array<{
    id: string;
    program_level_id?: string;
    classroom?: any;
    [key: string]: any;
  }>;
}

export function mapStudent(raw: StudentRaw): Student {
  const parents = raw.parents?.map(p => ({
    id: p.id,
    name: p.user?.name || "Unknown",
    relationship: p.relationship || "Orang Tua",
    phone: p.user?.phone || "-",
  })) || [];

  return {
    id: raw.id,
    studentCode: raw.student_code,
    name: raw.full_name,
    birthDate: raw.birth_date,
    schoolName: raw.school_name,
    schoolGrade: raw.school_grade,
    address: raw.address,
    status: raw.status,
    parents,
    nis: raw.nis || raw.student_code,
    program: raw.program,
    enrollments: raw.enrollments,
  };
}

export async function getStudents(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  } = {}
) {
  const res = await axiosInstance.get<PaginatedResponse<StudentRaw>>("/students", { params });
  const page = res.data.data;
  return {
    data: page.data.map(mapStudent),
    total: page.total,
    currentPage: page.current_page,
    lastPage: page.last_page,
    perPage: page.per_page,
  };
}

export async function getStudent(id: string) {
  const res = await axiosInstance.get<ApiResponse<StudentRaw>>(`/students/${id}`);
  return mapStudent(res.data.data);
}

export async function createStudent(data: Partial<StudentRaw>) {
  const res = await axiosInstance.post<ApiResponse<StudentRaw>>("/students", data);
  return mapStudent(res.data.data);
}

export async function updateStudent(id: string, data: Partial<StudentRaw>) {
  const res = await axiosInstance.put<ApiResponse<StudentRaw>>(`/students/${id}`, data);
  return mapStudent(res.data.data);
}

export async function deleteStudent(id: string) {
  const res = await axiosInstance.delete<ApiResponse<any>>(`/students/${id}`);
  return res.data;
}
