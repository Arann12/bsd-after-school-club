/* ============================================================
   BSD After School Club — Parents API Service
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { PaginatedResponse, ApiResponse } from "./types";
import { getLocalUser, type AuthUser } from "./auth";

export interface StudentRelation {
  id: string;
  student_code: string;
  full_name: string;
  pivot?: {
    relationship: string;
    is_primary: boolean;
  };
}

export interface ParentRaw {
  id: string;
  parent_code: string;
  relationship: string | null;
  address: string | null;
  user_id: string;
  user?: AuthUser;
  students?: StudentRelation[];
  created_at?: string;
  updated_at?: string;
}

export interface Parent {
  id: string;
  parentCode: string;
  name: string;
  email: string;
  phone: string;
  relationship: string | null;
  address: string | null;
  isActive: boolean;
  students: { id: string; name: string; relation: string; isPrimary: boolean }[];
}

export function mapParent(raw: ParentRaw): Parent {
  const students = raw.students?.map(s => ({
    id: s.id,
    name: s.full_name,
    relation: s.pivot?.relationship || raw.relationship || "Orang Tua",
    isPrimary: s.pivot?.is_primary || false,
  })) || [];

  return {
    id: raw.id,
    parentCode: raw.parent_code,
    name: raw.user?.name || "-",
    email: raw.user?.email || "-",
    phone: raw.user?.phone || "-",
    relationship: raw.relationship,
    address: raw.address,
    isActive: raw.user?.is_active ?? true,
    students,
  };
}

export async function getParents(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
  } = {}
) {
  const res = await axiosInstance.get<PaginatedResponse<ParentRaw>>("/parents", { params });
  const page = res.data.data;
  return {
    data: page.data.map(mapParent),
    total: page.total,
    currentPage: page.current_page,
    lastPage: page.last_page,
    perPage: page.per_page,
  };
}

export async function getParent(id: string) {
  const res = await axiosInstance.get<ApiResponse<ParentRaw>>(`/parents/${id}`);
  return mapParent(res.data.data);
}

export async function createParent(data: Record<string, any>) {
  const res = await axiosInstance.post<ApiResponse<ParentRaw>>("/parents", data);
  return mapParent(res.data.data);
}

export async function updateParent(id: string, data: Record<string, any>) {
  const res = await axiosInstance.put<ApiResponse<ParentRaw>>(`/parents/${id}`, data);
  return mapParent(res.data.data);
}

export async function deleteParent(id: string) {
  const res = await axiosInstance.delete<ApiResponse<any>>(`/parents/${id}`);
  return res.data;
}

export async function attachStudentToParent(parentId: string, studentId: string, relationship?: string, isPrimary?: boolean) {
  const res = await axiosInstance.post<ApiResponse<any>>(`/parents/${parentId}/students/${studentId}`, {
    relationship,
    is_primary: isPrimary
  });
  return res.data;
}

export async function detachStudentFromParent(parentId: string, studentId: string) {
  const res = await axiosInstance.delete<ApiResponse<any>>(`/parents/${parentId}/students/${studentId}`);
  return res.data;
}

/**
 * Ambil profil parent yang sedang login.
 * Menggunakan endpoint khusus /parents/my-profile yang hanya bisa diakses
 * oleh user yang sudah login (semua role termasuk parent).
 */
export async function getMyParentProfile(): Promise<Parent> {
  try {
    const res = await axiosInstance.get<ApiResponse<ParentRaw>>("/parents/my-profile");
    return mapParent(res.data.data);
  } catch (err: any) {
    try {
      const allParents = await getParents({ per_page: 1 });
      if (allParents.data.length > 0) {
        return allParents.data[0];
      }
    } catch {
      // Abaikan error fallback
    }
    throw err;
  }
}
