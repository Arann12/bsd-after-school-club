/* ============================================================
   BSD After School Club — API Functions (Finance)
   ============================================================ */

import axiosInstance from "./axiosInstance";
import type { Invoice, Payment, CashVerification, HonorRecord } from "../types";
import type { PaginatedResponse, ApiResponse } from "./types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INVOICES (TAGIHAN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /invoices */
export async function getInvoices(
  params?: { page?: number; student_id?: string; status?: string; search?: string; per_page?: number }
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
//  PAYMENT PLANS (TAGIHAN PER SESI / PAKET)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /payment-plans — mengambil daftar rencana pembayaran (per sesi / paket) */
export async function getPaymentPlans(
  params?: { page?: number; student_id?: string; enrollment_id?: string; status?: string; is_paid?: boolean; per_page?: number }
): Promise<any> {
  const { data } = await axiosInstance.get("/payment-plans", { params });
  return data;
}

/** POST /payment-plans — membuat tagihan baru (manual) untuk enrollment siswa */
export async function createPaymentPlan(payload: {
  enrollment_id: string;
  session_number: number;
  amount: number;
  due_date: string;
  status?: string;
}): Promise<any> {
  const { data } = await axiosInstance.post("/payment-plans", payload);
  return data;
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
  params?: { page?: number; invoice_id?: string; status?: string; per_page?: number; student_id?: string; enrollment_id?: string; payment_plan_id?: string }
): Promise<any> {
  const { data } = await axiosInstance.get("/payments", { params });
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
  payment_type?: "per_pertemuan" | "pelunasan";
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

export interface BackendCashTransaction {
  id: string;
  cash_code: string;
  payment_plan_id: string;
  payment_id?: string;
  enrollment_id: string;
  student_id: string;
  amount: number;
  status: "menunggu_konfirmasi_admin" | "paid" | "rejected" | string;
  submitted_by: string;
  submitted_at: string;
  verified_by?: string | null;
  verified_at?: string | null;
  receipt_number?: string | null;
  proof_image?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  payment_plan?: {
    id: string;
    session_number: number;
    amount: number;
    due_date: string;
    is_paid: boolean;
    status: string;
  };
  payment?: {
    id: string;
    payment_code: string;
    amount: number;
    payment_status: string;
  };
  enrollment?: {
    id: string;
    student?: { id: string; full_name: string; student_code: string };
    program?: { id: string; name: string };
  };
  submitter?: { id: string; name: string; email: string };
  verifier?: { id: string; name: string; email: string };
}

/** GET /cash-transactions — mengambil daftar transaksi cash dari backend */
export async function getCashTransactions(
  params?: { page?: number; status?: string; per_page?: number; student_id?: string; enrollment_id?: string; search?: string }
): Promise<any> {
  const { data } = await axiosInstance.get("/cash-transactions", { params });
  return data;
}

/** GET /cash-transactions/:id */
export async function getCashTransaction(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/cash-transactions/${id}`);
  return data;
}

/** POST /cash-transactions/submit — pengajuan pembayaran cash oleh ortu/siswa */
export async function submitCashTransaction(payload: {
  payment_plan_id: string;
  payment_type?: "per_pertemuan" | "pelunasan";
  receipt_number?: string;
  notes?: string;
  proof_image?: File | null;
}): Promise<any> {
  let body: any = payload;
  let headers: Record<string, string> = {};

  if (payload.proof_image) {
    const formData = new FormData();
    formData.append("payment_plan_id", payload.payment_plan_id);
    if (payload.payment_type) formData.append("payment_type", payload.payment_type);
    if (payload.receipt_number) formData.append("receipt_number", payload.receipt_number);
    if (payload.notes) formData.append("notes", payload.notes);
    formData.append("proof_image", payload.proof_image);
    body = formData;
    headers["Content-Type"] = "multipart/form-data";
  }

  const { data } = await axiosInstance.post("/cash-transactions/submit", body, { headers });
  return data;
}

/** POST /cash-transactions/:id/confirm — konfirmasi dan ACC penerimaan uang tunai fisik oleh Admin/Owner */
export async function confirmCashTransaction(
  id: string,
  payload?: { admin_notes?: string; receipt_number?: string }
): Promise<any> {
  const { data } = await axiosInstance.post(`/cash-transactions/${id}/confirm`, payload || {});
  return data;
}

/** POST /cash-transactions/:id/reject — tolak pembayaran cash oleh Admin/Owner */
export async function rejectCashTransaction(
  id: string,
  payload: { rejection_reason?: string; admin_notes?: string; notes?: string }
): Promise<any> {
  const body = {
    rejection_reason: payload.rejection_reason || payload.admin_notes || payload.notes || "Pengajuan tunai ditolak oleh kasir.",
    admin_notes: payload.admin_notes || payload.rejection_reason || payload.notes,
    ...payload,
  };
  const { data } = await axiosInstance.post(`/cash-transactions/${id}/reject`, body);
  return data;
}

/** GET /cash-verifications (legacy alias) */
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

/** GET /finance/dashboard */
export async function getFinanceDashboard(params?: { year?: number; month?: number }): Promise<any> {
  const { data } = await axiosInstance.get("/finance/dashboard", { params });
  return data.data || data;
}

/** GET /finance/reports/income */
export async function getIncomeReport(params?: { start_date?: string; end_date?: string; payment_method?: string }): Promise<any> {
  const { data } = await axiosInstance.get("/finance/reports/income", { params });
  return data.data || data;
}

/** GET /finance/reports/outstanding */
export async function getOutstandingReport(params?: { status?: string }): Promise<any> {
  const { data } = await axiosInstance.get("/finance/reports/outstanding", { params });
  return data.data || data;
}

/** GET /finance/reports/reconciliation */
export async function getReconciliationReport(params?: { date?: string; month?: string }): Promise<any> {
  const { data } = await axiosInstance.get("/finance/reports/reconciliation", { params });
  return data.data || data;
}
