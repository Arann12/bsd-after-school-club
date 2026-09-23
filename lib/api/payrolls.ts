import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "./types";

export interface PayrollRaw {
  id: string; 
  payroll_code: string;
  teacher_id: string;
  period_start: string; 
  period_end: string;   
  teaching_hours: string | number; 
  base_amount: string | number;    
  bonus_amount: string | number;   
  total_amount: string | number;   
  status: string; 
  created_at?: string;
  updated_at?: string;
  teacher?: { 
    id: string; 
    teacher_code: string;
    user?: { name: string; full_name?: string } 
  } | null;
}

export interface Payroll {
  id: string;
  payrollCode: string;
  teacherId: string;
  teacherName: string;
  periodStart: string;
  periodEnd: string;
  teachingHours: number;
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  status: string;
}

export function mapPayroll(raw: PayrollRaw): Payroll {
  const tName = raw.teacher?.user?.name || (raw.teacher as any)?.full_name || raw.teacher?.teacher_code || "Unknown";
  return {
    id: raw.id,
    payrollCode: raw.payroll_code,
    teacherId: raw.teacher_id,
    teacherName: tName,
    periodStart: raw.period_start,
    periodEnd: raw.period_end,
    teachingHours: Number(raw.teaching_hours),
    baseAmount: Number(raw.base_amount),
    bonusAmount: Number(raw.bonus_amount),
    totalAmount: Number(raw.total_amount),
    status: raw.status,
  };
}

export async function getPayrolls() {
  const res = await axiosInstance.get<ApiResponse<PayrollRaw[]>>("/teacher-payrolls");
  return res.data.data.map(mapPayroll);
}

export async function getPayroll(id: string) {
  const res = await axiosInstance.get<ApiResponse<PayrollRaw>>(`/teacher-payrolls/${id}`);
  return mapPayroll(res.data.data);
}

export async function generatePayroll(params: { teacher_id: string; period_start: string; period_end: string; }) {
  const res = await axiosInstance.post<ApiResponse<PayrollRaw>>("/teacher-payrolls/generate", params);
  return mapPayroll(res.data.data);
}

export async function deletePayroll(id: string) {
  const res = await axiosInstance.delete<ApiResponse<any>>(`/teacher-payrolls/${id}`);
  return res.data;
}
