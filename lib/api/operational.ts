/* ============================================================
   BSD After School Club — API Functions (Operational)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { Announcement, InventoryItem, Notification } from "../types";
import type { PaginatedResponse, ApiResponse } from "./types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ANNOUNCEMENTS (PENGUMUMAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /announcements */
export async function getAnnouncements(
  params?: { page?: number; status?: string; target?: string }
): Promise<PaginatedResponse<Announcement>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Announcement>>("/announcements", { params });
  return data;
}

/** GET /announcements/:id */
export async function getAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.get<ApiResponse<Announcement>>(`/announcements/${id}`);
  return data.data;
}

/** POST /announcements */
export async function createAnnouncement(payload: Omit<Announcement, "id" | "publishedAt">): Promise<Announcement> {
  const { data } = await axiosInstance.post<ApiResponse<Announcement>>("/announcements", payload);
  return data.data;
}

/** PUT /announcements/:id */
export async function updateAnnouncement(id: string, payload: Partial<Announcement>): Promise<Announcement> {
  const { data } = await axiosInstance.put<ApiResponse<Announcement>>(`/announcements/${id}`, payload);
  return data.data;
}

/** PATCH /announcements/:id/publish — ubah status ke Published */
export async function publishAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch<ApiResponse<Announcement>>(`/announcements/${id}/publish`);
  return data.data;
}

/** DELETE /announcements/:id */
export async function deleteAnnouncement(id: string): Promise<void> {
  await axiosInstance.delete(`/announcements/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INVENTORY (INVENTARIS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /inventory */
export async function getInventory(
  params?: { page?: number; category?: string; condition?: string; search?: string }
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
