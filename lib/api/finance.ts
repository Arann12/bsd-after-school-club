/* ============================================================
   BSD After School Club — API Functions (Finance)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { Invoice, Payment, CashVerification, HonorRecord } from "../types";
import type { PaginatedResponse, ApiResponse } from "./students";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INVOICES (TAGIHAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /invoices */
export async function getInvoices(
  params?: { page?: number; student_id?: string; status?: string; search?: string }
): Promise<PaginatedResponse<Invoice>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Invoice>>("/invoices", { params });
  return data;
}

/** GET /invoices/:id */
export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await axiosInstance.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  return data.data;
}

/** POST /invoices */
export async function createInvoice(payload: Omit<Invoice, "id" | "createdAt">): Promise<Invoice> {
  const { data } = await axiosInstance.post<ApiResponse<Invoice>>("/invoices", payload);
  return data.data;
}

/** PATCH /invoices/:id — update status atau partial update */
export async function updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
  const { data } = await axiosInstance.patch<ApiResponse<Invoice>>(`/invoices/${id}`, payload);
  return data.data;
}

/** DELETE /invoices/:id */
export async function deleteInvoice(id: string): Promise<void> {
  await axiosInstance.delete(`/invoices/${id}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PAYMENTS (PEMBAYARAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /payments/methods — mengambil daftar metode pembayaran aktif dari gateway (auto-cached 2 menit di backend) */
export async function getPaymentMethods(panduan: boolean = true): Promise<any> {
  const { data } = await axiosInstance.get("/payments/methods", {
    params: { panduan },
  });
  return data;
}

/** GET /payments */
export async function getPayments(
  params?: { page?: number; invoice_id?: string; status?: string }
): Promise<PaginatedResponse<Payment>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Payment>>("/payments", { params });
  return data;
}

/** GET /payments/:id */
export async function getPayment(id: string): Promise<Payment> {
  const { data } = await axiosInstance.get<ApiResponse<Payment>>(`/payments/${id}`);
  return data.data;
}

/** POST /payments/charge — inisiasi transaksi via Payment Gateway (QRIS, VA, E-Wallet) */
export async function chargePayment(payload: {
  payment_plan_id: string;
  payment_method: "va" | "qris" | "ewallet";
  payment_channel?: string;
  expired_time?: string;
  type_fee?: "user" | "merchant";
  notes?: string;
}): Promise<any> {
  const { data } = await axiosInstance.post("/payments/charge", payload);
  return data;
}

/** GET /payments/:id/status — periksa status real-time pembayaran */
export async function checkPaymentStatus(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/payments/${id}/status`);
  return data;
}

/** POST /payments — buat catatan pembayaran baru */
export async function createPayment(payload: Omit<Payment, "id">): Promise<Payment> {
  const { data } = await axiosInstance.post<ApiResponse<Payment>>("/payments", payload);
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CASH VERIFICATION (VERIFIKASI CASH)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /cash-verifications */
export async function getCashVerifications(
  params?: { page?: number; status?: string }
): Promise<PaginatedResponse<CashVerification>> {
  const { data } = await axiosInstance.get<PaginatedResponse<CashVerification>>("/cash-verifications", { params });
  return data;
}

/** POST /cash-verifications — orang tua mengajukan pembayaran cash */
export async function submitCashVerification(
  payload: Omit<CashVerification, "id" | "submittedAt" | "verifiedAt" | "verifiedBy">
): Promise<CashVerification> {
  const { data } = await axiosInstance.post<ApiResponse<CashVerification>>("/cash-verifications", payload);
  return data.data;
}

/** PATCH /cash-verifications/:id/confirm — admin konfirmasi */
export async function confirmCash(id: string, verifiedBy: string): Promise<CashVerification> {
  const { data } = await axiosInstance.patch<ApiResponse<CashVerification>>(
    `/cash-verifications/${id}/confirm`,
    { verified_by: verifiedBy }
  );
  return data.data;
}

/** PATCH /cash-verifications/:id/reject — admin tolak */
export async function rejectCash(id: string, notes: string): Promise<CashVerification> {
  const { data } = await axiosInstance.patch<ApiResponse<CashVerification>>(
    `/cash-verifications/${id}/reject`,
    { notes }
  );
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HONOR (HONORARIUM GURU)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /honors */
export async function getHonors(
  params?: { page?: number; teacher_id?: string; period?: string; status?: string }
): Promise<PaginatedResponse<HonorRecord>> {
  const { data } = await axiosInstance.get<PaginatedResponse<HonorRecord>>("/honors", { params });
  return data;
}

/** GET /honors/:id */
export async function getHonor(id: string): Promise<HonorRecord> {
  const { data } = await axiosInstance.get<ApiResponse<HonorRecord>>(`/honors/${id}`);
  return data.data;
}

/** POST /honors — generate honor record */
export async function generateHonor(payload: { teacher_id: string; period: string }): Promise<HonorRecord> {
  const { data } = await axiosInstance.post<ApiResponse<HonorRecord>>("/honors/generate", payload);
  return data.data;
}

/** PATCH /honors/:id/pay — tandai sudah dibayar */
export async function markHonorPaid(id: string): Promise<HonorRecord> {
  const { data } = await axiosInstance.patch<ApiResponse<HonorRecord>>(`/honors/${id}/pay`);
  return data.data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  REPORTS / LAPORAN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FinanceSummary {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  totalHonor: number;
  monthlyRevenue: { month: string; amount: number }[];
}

/** GET /reports/finance?period=YYYY-MM */
export async function getFinanceSummary(period?: string): Promise<FinanceSummary> {
  const { data } = await axiosInstance.get<ApiResponse<FinanceSummary>>("/reports/finance", {
    params: period ? { period } : undefined,
  });
  return data.data;
}
