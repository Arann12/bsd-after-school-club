/* ============================================================
   BSD After School Club — Constants & Color Maps
   ============================================================ */

import type {
  StudentStatus, PaymentStatus, HonorStatus, AttendanceStatus,
  CashStatus, EnrollmentStatus, AnnouncementStatus, InventoryCondition,
} from "./types";

/* ---- ID Prefixes ---- */
export const ID_PREFIX = {
  OWNER: "OWN",
  ADMIN: "ADM",
  TEACHER: "GUR",
  PARENT: "PAR",
  STUDENT: "STD",
  PROGRAM: "PRG",
  CLASS: "KLS",
  INVOICE: "INV",
  PAYMENT: "PAY",
  CASH: "CASH",
  ATTENDANCE: "ATT",
  CERTIFICATE: "CERT",
} as const;

/* ---- Status Color Maps ---- */
export const STUDENT_STATUS_COLOR: Record<StudentStatus, { bg: string; color: string }> = {
  Trial:      { bg: "#fef9c3", color: "#ca8a04" },
  Aktif:      { bg: "#d1fae5", color: "#059669" },
  "On Leave": { bg: "#fef3c7", color: "#b45309" },
  Nonaktif:   { bg: "#f1f5f9", color: "#64748b" },
  Graduated:  { bg: "#dbeafe", color: "#1d4ed8" },
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, { bg: string; color: string }> = {
  Lunas:                 { bg: "#d1fae5", color: "#059669" },
  "Belum Bayar":         { bg: "#fee2e2", color: "#dc2626" },
  Overdue:               { bg: "#fce7f3", color: "#be185d" },
  "Menunggu Konfirmasi": { bg: "#fef3c7", color: "#b45309" },
  "Partially Paid":      { bg: "#e0f2fe", color: "#0369a1" },
};

export const HONOR_STATUS_COLOR: Record<HonorStatus, { bg: string; color: string }> = {
  "Belum Dibayar": { bg: "#fee2e2", color: "#dc2626" },
  "Sudah Dibayar": { bg: "#d1fae5", color: "#059669" },
  "Sebagian":      { bg: "#fef3c7", color: "#b45309" },
};

export const ATTENDANCE_STATUS_COLOR: Record<AttendanceStatus, { bg: string; color: string }> = {
  Hadir:  { bg: "#d1fae5", color: "#059669" },
  Alpha:  { bg: "#fee2e2", color: "#dc2626" },
  Sakit:  { bg: "#fef3c7", color: "#b45309" },
  Izin:   { bg: "#e0f2fe", color: "#0369a1" },
  Libur:  { bg: "#f1f5f9", color: "#64748b" },
};

export const CASH_STATUS_COLOR: Record<CashStatus, { bg: string; color: string }> = {
  "Menunggu Konfirmasi": { bg: "#fef3c7", color: "#b45309" },
  Dikonfirmasi:          { bg: "#d1fae5", color: "#059669" },
  Ditolak:               { bg: "#fee2e2", color: "#dc2626" },
};

export const ENROLLMENT_STATUS_COLOR: Record<EnrollmentStatus, { bg: string; color: string }> = {
  Pending:  { bg: "#fef3c7", color: "#b45309" },
  Approved: { bg: "#d1fae5", color: "#059669" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};

export const ANNOUNCEMENT_STATUS_COLOR: Record<AnnouncementStatus, { bg: string; color: string }> = {
  Draft:     { bg: "#f1f5f9", color: "#64748b" },
  Published: { bg: "#d1fae5", color: "#059669" },
  Archived:  { bg: "#e0f2fe", color: "#0369a1" },
};

export const INVENTORY_CONDITION_COLOR: Record<InventoryCondition, { bg: string; color: string }> = {
  Good:         { bg: "#d1fae5", color: "#059669" },
  Damaged:      { bg: "#fee2e2", color: "#dc2626" },
  Lost:         { bg: "#f1f5f9", color: "#64748b" },
  "Under Repair": { bg: "#fef3c7", color: "#b45309" },
};

/* ---- Utility: format Rupiah ---- */
export function formatRupiah(n: number | string | undefined | null): string {
  if (n === undefined || n === null || n === "") return "Rp 0";
  const num = typeof n === "number" ? n : parseFloat(String(n).replace(/Rp\s*/gi, "").replace(/\./g, "").replace(/,/g, ".")) || 0;
  return `Rp ${Math.round(num).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

/* ---- Utility: format date ---- */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}
