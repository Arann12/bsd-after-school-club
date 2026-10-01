/* ============================================================
   BSD After School Club — API Functions (Assessments, Reports & Certificates)
   ============================================================ */

import axiosInstance from "./axiosInstance";

export interface AssessmentItem {
  id: string;
  student_id: string;
  enrollment_id: string;
  program_level_id: string;
  assessment_name: string;
  score: number;
  weight: number;
  assessment_date: string;
  status: "draft" | "final";
  student?: { id: string; name: string; full_name?: string };
  enrollment?: { id: string; classroom?: { id: string; name: string }; programLevel?: { id: string; name: string } };
  programLevel?: { id: string; name: string };
  recordedBy?: { id: string; name: string };
}

export interface FinalReportItem {
  id: string;
  report_code: string;
  student_id: string;
  enrollment_id: string;
  final_score: number;
  graduation_status: "passed" | "failed" | string;
  generated_at: string;
  notes?: string;
  student?: { id: string; name: string; full_name?: string };
  enrollment?: { id: string; programLevel?: { id: string; name: string }; classroom?: { id: string; name: string } };
  verifiedBy?: { id: string; name: string };
}

export interface CertificateItem {
  id: string;
  certificate_code: string;
  student_id: string;
  enrollment_id: string;
  final_report_id?: string;
  issued_date: string;
  file_url?: string | null;
  student?: { id: string; name: string; full_name?: string };
  enrollment?: {
    id: string;
    classroom?: { id: string; name: string };
    programLevel?: { id: string; name: string; program?: { id: string; name: string } };
  };
  finalReport?: FinalReportItem;
  generatedBy?: { id: string; name: string };
}

// ── Assessments API ──────────────────────────────────────────
export async function getAssessments(params?: {
  student_id?: string;
  enrollment_id?: string;
  program_level_id?: string;
  per_page?: number;
  page?: number;
}): Promise<any> {
  const { data } = await axiosInstance.get("/assessments", { params });
  return data;
}

export async function createAssessment(payload: {
  student_id: string;
  enrollment_id: string;
  program_level_id: string;
  assessment_name: string;
  score: number;
  weight?: number;
  assessment_date: string;
  status?: "draft" | "final";
}): Promise<any> {
  const { data } = await axiosInstance.post("/assessments", payload);
  return data;
}

export async function getAssessment(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/assessments/${id}`);
  return data;
}

// ── Final Reports API ────────────────────────────────────────
export async function getFinalReports(params?: {
  student_id?: string;
  graduation_status?: string;
  per_page?: number;
  page?: number;
}): Promise<any> {
  const { data } = await axiosInstance.get("/final-reports", { params });
  return data;
}

export async function generateFinalReport(payload: {
  enrollment_id: string;
  passing_grade?: number;
  notes?: string;
}): Promise<any> {
  const { data } = await axiosInstance.post("/final-reports", payload);
  return data;
}

// ── Certificates API ─────────────────────────────────────────
export async function getCertificates(params?: {
  student_id?: string;
  search?: string;
  per_page?: number;
  page?: number;
}): Promise<any> {
  const { data } = await axiosInstance.get("/certificates", { params });
  return data;
}

export async function createCertificate(payload: {
  student_id: string;
  enrollment_id: string;
  final_report_id?: string;
  issued_date?: string;
  file_url?: string;
}): Promise<any> {
  const { data } = await axiosInstance.post("/certificates", payload);
  return data;
}

export async function getCertificate(id: string): Promise<any> {
  const { data } = await axiosInstance.get(`/certificates/${id}`);
  return data;
}

export async function deleteCertificate(id: string): Promise<any> {
  const { data } = await axiosInstance.delete(`/certificates/${id}`);
  return data;
}
