/* ============================================================
   BSD After School Club — API Functions (Operational)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { Announcement, InventoryItem, Notification } from "../types";
import type { PaginatedResponse, ApiResponse } from "./types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ANNOUNCEMENTS (PENGUMUMAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/api\/v1\/?$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
}

export interface BackendAnnouncement {
  id: string;
  title: string;
  description: string;
  poster_url?: string | null;
  status: "draft" | "published" | "archived" | string;
  published_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  targets?: { id: string; announcement_id: string; target_role: string }[];
  author?: { id: string; name: string; email: string; role: string };
}

/** GET /announcements */
export async function getAnnouncements(
  params?: { page?: number; per_page?: number; status?: string; search?: string; active_only?: boolean }
): Promise<any> {
  const { data } = await axiosInstance.get("/announcements", { params });
  return data;
}

/** GET /announcements/:id */
export async function getAnnouncement(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/announcements/${id}`);
  return data.data;
}

/** POST /announcements */
export async function createAnnouncement(payload: {
  title: string;
  description: string;
  status?: "draft" | "published" | "archived";
  target_roles?: string[];
  poster?: File | null;
  expires_at?: string | null;
} | FormData): Promise<any> {
  let body: any = payload;
  let headers: Record<string, string> = {};

  if (!(payload instanceof FormData) && payload.poster) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (payload.status) formData.append("status", payload.status);
    if (payload.expires_at) formData.append("expires_at", payload.expires_at);
    if (payload.target_roles) {
      payload.target_roles.forEach((r, idx) => formData.append(`target_roles[${idx}]`, r));
    }
    formData.append("poster", payload.poster);
    body = formData;
    headers["Content-Type"] = "multipart/form-data";
  }

  const { data } = await axiosInstance.post("/announcements", body, { headers });
  return data;
}

/** PUT /announcements/:id */
export async function updateAnnouncement(id: string, payload: any): Promise<any> {
  const { data } = await axiosInstance.put(`/announcements/${id}`, payload);
  return data;
}

/** PATCH /announcements/:id/publish — ubah status ke Published */
export async function publishAnnouncement(id: string): Promise<any> {
  const { data } = await axiosInstance.patch(`/announcements/${id}/publish`);
  return data;
}

/** DELETE /announcements/:id */
export async function deleteAnnouncement(id: string): Promise<any> {
  const { data } = await axiosInstance.delete(`/announcements/${id}`);
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INVENTORY (INVENTARIS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /inventory */
export async function getInventory(
  params?: { page?: number; category?: string; condition?: string; search?: string; per_page?: number }
): Promise<PaginatedResponse<InventoryItem>> {
  const { data } = await axiosInstance.get<PaginatedResponse<InventoryItem>>("/inventory", { params });
  return data;
}

/** GET /inventory/:id */
export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const { data } = await axiosInstance.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
  return data.data;
}

/** POST /inventory */
export async function createInventoryItem(payload: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  const { data } = await axiosInstance.post<ApiResponse<InventoryItem>>("/inventory", payload);
  return data.data;
}

/** PUT /inventory/:id */
export async function updateInventoryItem(id: string, payload: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data } = await axiosInstance.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, payload);
  return data.data;
}

/** DELETE /inventory/:id */
export async function deleteInventoryItem(id: string): Promise<void> {
  await axiosInstance.delete(`/inventory/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  NOTIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /notifications */
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await axiosInstance.get<ApiResponse<Notification[]>>("/notifications");
  return data.data;
}

/** PATCH /notifications/:id/read */
export async function markNotificationRead(id: string): Promise<void> {
  await axiosInstance.patch(`/notifications/${id}/read`);
}

/** PATCH /notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await axiosInstance.patch("/notifications/read-all");
}
