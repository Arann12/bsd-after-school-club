/* ============================================================
   BSD After School Club — Centralized TypeScript Types
   ============================================================ */

/* ---- Status Enums ---- */
export type StudentStatus = "Trial" | "Aktif" | "On Leave" | "Nonaktif" | "Graduated";
export type PaymentStatus = "Lunas" | "Belum Bayar" | "Overdue" | "Menunggu Konfirmasi" | "Partially Paid";
export type HonorStatus = "Belum Dibayar" | "Sudah Dibayar" | "Sebagian";
export type AttendanceStatus = "Hadir" | "Alpha" | "Sakit" | "Izin" | "Libur";
export type CashStatus = "Menunggu Konfirmasi" | "Dikonfirmasi" | "Ditolak";
export type EnrollmentStatus = "Pending" | "Approved" | "Rejected";
export type AnnouncementStatus = "Draft" | "Published" | "Archived";
export type InventoryCondition = "Good" | "Damaged" | "Lost" | "Under Repair";
export type PackageType = "8 Pertemuan" | "12 Pertemuan" | string;
export type PaymentMethod = "Virtual Account" | "E-Wallet" | "QRIS" | "Cash";

/* ---- Core Entities ---- */
export interface Student {
  id: string;
  name: string;
  parent: string;
  parentPhone: string;
  program: string;
  kelas: string;
  guru: string;
  pertemuan: string;
  status: StudentStatus;
  tagihan: PaymentStatus;
  level: string;
  dateOfBirth?: string;
  school?: string;
  schoolGrade?: string;
  joinDate?: string;
  notes?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
  address?: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  activeClasses: number;
  totalStudents: number;
  hourlyRate: number;
  status: "Aktif" | "Nonaktif";
  joinDate?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  levels: string[];
  activeStudents: number;
  activeClasses: number;
  status: "Aktif" | "Nonaktif";
}

export interface Level {
  id: string;
  programId: string;
  programName: string;
  name: string;
  order: number;
  activeStudents: number;
}

export interface ClassRoom {
  id: string;
  name: string;
  program: string;
  level: string;
  teacher: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  capacity: number;
  enrolled: number;
  status: "Aktif" | "Nonaktif";
}

export interface Schedule {
  id: string;
  classId: string;
  className: string;
  program: string;
  level: string;
  teacher: string;
  day: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  status: "Selesai" | "Berlangsung" | "Terjadwal" | "Dibatalkan";
}

/* ---- Finance ---- */
export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  program: string;
  package: PackageType;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  status: "Paid" | "Pending" | "Failed";
  transactionDate: string;
  transactionRef?: string;
}

export interface CashVerification {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  status: CashStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface HonorRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  specialization: string;
  sessionsCompleted: number;
  totalHours: number;
  hourlyRate: number;
  subtotal: number;
  bonus: { amount: number; note: string; date: string }[];
  total: number;
  status: HonorStatus;
  period: string;
}

/* ---- Academic ---- */
export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Logbook {
  id: string;
  classId: string;
  className: string;
  teacherName: string;
  date: string;
  topic: string;
  notes: string;
  attendanceSummary: { present: number; absent: number; sick: number; permission: number };
}

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  level: string;
  finalScore: number;
  status: "Lulus" | "Tidak Lulus" | "Pending";
  certificateId?: string;
  assessmentDate?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  level: string;
  finalScore: number;
  issueDate: string;
}

export interface Enrollment {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  program: string;
  preferredLevel?: string;
  status: EnrollmentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

/* ---- Operational ---- */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: "Semua" | "Guru" | "Orang Tua" | "Kelas Tertentu";
  targetDetail?: string;
  status: AnnouncementStatus;
  publishedAt?: string;
  author: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  condition: InventoryCondition;
  location: string;
  responsible: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  href?: string;
}
