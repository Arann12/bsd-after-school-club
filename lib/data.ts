/* ============================================================
   BSD After School Club — Centralized Dummy Data
   Single source of truth for all pages.
   ============================================================ */

import type {
  Student, Parent, Teacher, Program, ClassRoom, Schedule,
  Invoice, CashVerification, HonorRecord, Enrollment,
  Announcement, InventoryItem, Logbook, Certificate,
  PaymentStatus,
} from "./types";

/* ======================== STUDENTS ======================== */
export const students: Student[] = [
  { id: "STD-2026-0001", name: "Andi Setiawan", parent: "Budi Setiawan", parentPhone: "081234567890", program: "Calistung", kelas: "KLS-A", guru: "Ms. Sarah", pertemuan: "6/12", status: "Aktif", tagihan: "Lunas", level: "Level 1", joinDate: "2026-06-01" },
  { id: "STD-2026-0002", name: "Budi Santoso", parent: "Hendra Santoso", parentPhone: "081987654321", program: "English", kelas: "KLS-B", guru: "Mr. Andi", pertemuan: "10/12", status: "Aktif", tagihan: "Belum Bayar", level: "Level 2 (B1)", joinDate: "2026-05-15" },
  { id: "STD-2026-0003", name: "Citra Kirana", parent: "Dewi Kirana", parentPhone: "085678901234", program: "Math", kelas: "KLS-C", guru: "Ms. Nina", pertemuan: "3/12", status: "Aktif", tagihan: "Lunas", level: "Level 3 (Advance)", joinDate: "2026-07-01" },
  { id: "STD-2026-0004", name: "Dian Pratama", parent: "Sari Pratama", parentPhone: "082112233445", program: "Phonics", kelas: "KLS-D", guru: "Ms. Sarah", pertemuan: "1/12", status: "Trial", tagihan: "Belum Bayar", level: "Level 1 (Starter)", joinDate: "2026-08-10" },
  { id: "STD-2026-0005", name: "Eko Wijaya", parent: "Joko Wijaya", parentPhone: "081987654322", program: "Calistung", kelas: "KLS-E", guru: "Mr. Budi", pertemuan: "12/12", status: "Graduated", tagihan: "Lunas", level: "Level 2", joinDate: "2026-03-01" },
  { id: "STD-2026-0006", name: "Fitri Handayani", parent: "Rina Handayani", parentPhone: "081399887766", program: "English", kelas: "KLS-B", guru: "Mr. Andi", pertemuan: "8/12", status: "Aktif", tagihan: "Lunas", level: "Level 2 (B1)", joinDate: "2026-06-15" },
  { id: "STD-2026-0007", name: "Gilang Ramadan", parent: "Ahmad Ramadan", parentPhone: "081555443322", program: "Math", kelas: "KLS-C", guru: "Ms. Nina", pertemuan: "5/12", status: "On Leave", tagihan: "Lunas", level: "Level 3 (Advance)", joinDate: "2026-05-01" },
  { id: "STD-2026-0008", name: "Hana Pertiwi", parent: "Siska Pertiwi", parentPhone: "081777889900", program: "Phonics", kelas: "KLS-D", guru: "Ms. Sarah", pertemuan: "2/12", status: "Aktif", tagihan: "Overdue", level: "Level 1 (Starter)", joinDate: "2026-07-20" },
  { id: "STD-2026-0009", name: "Ivan Kurnia", parent: "Lestari Kurnia", parentPhone: "081888990011", program: "Calistung", kelas: "KLS-A", guru: "Ms. Sarah", pertemuan: "0/8", status: "Trial", tagihan: "Belum Bayar", level: "Level 1", joinDate: "2026-08-20" },
  { id: "STD-2026-0010", name: "Maya Sari", parent: "Rahmat Sari", parentPhone: "082144556677", program: "English", kelas: "KLS-F", guru: "Ms. Rina", pertemuan: "10/12", status: "Aktif", tagihan: "Lunas", level: "Level 2 (B2)", joinDate: "2026-04-01" },
  { id: "STD-2026-0011", name: "Raka Pratama", parent: "Dewi Lestari", parentPhone: "081266778899", program: "Phonics", kelas: "KLS-D", guru: "Ms. Sarah", pertemuan: "12/12", status: "Graduated", tagihan: "Lunas", level: "Level 1 (Starter)", joinDate: "2026-02-01" },
  { id: "STD-2026-0012", name: "Siti Nurhaliza", parent: "Ahmad Hidayat", parentPhone: "085311223344", program: "Calistung", kelas: "KLS-E", guru: "Mr. Budi", pertemuan: "7/12", status: "Aktif", tagihan: "Menunggu Konfirmasi", level: "Level 2", joinDate: "2026-06-10" },
];

/* ======================== TEACHERS ======================== */
export const teachers: Teacher[] = [
  { id: "GUR-2026-0001", name: "Ms. Sarah", specialization: "Calistung & Phonics", phone: "081299887766", email: "sarah@bsdclub.com", activeClasses: 2, totalStudents: 14, hourlyRate: 75000, status: "Aktif", joinDate: "2025-01-10" },
  { id: "GUR-2026-0002", name: "Mr. Andi", specialization: "English B1 & B2", phone: "081388776655", email: "andi@bsdclub.com", activeClasses: 1, totalStudents: 6, hourlyRate: 80000, status: "Aktif", joinDate: "2025-03-15" },
  { id: "GUR-2026-0003", name: "Ms. Nina", specialization: "Math Advance", phone: "081477665544", email: "nina@bsdclub.com", activeClasses: 1, totalStudents: 5, hourlyRate: 80000, status: "Aktif", joinDate: "2025-06-01" },
  { id: "GUR-2026-0004", name: "Mr. Budi", specialization: "Calistung Lanjut", phone: "081566554433", email: "budi@bsdclub.com", activeClasses: 1, totalStudents: 6, hourlyRate: 75000, status: "Aktif", joinDate: "2025-02-20" },
  { id: "GUR-2026-0005", name: "Ms. Rina", specialization: "English Advanced & Phonics", phone: "081655443322", email: "rina@bsdclub.com", activeClasses: 1, totalStudents: 4, hourlyRate: 78000, status: "Aktif", joinDate: "2025-04-10" },
  { id: "GUR-2026-0006", name: "Mr. Dimas", specialization: "Calistung & Math Dasar", phone: "081744332211", email: "dimas@bsdclub.com", activeClasses: 1, totalStudents: 5, hourlyRate: 72000, status: "Aktif", joinDate: "2025-07-01" },
  { id: "GUR-2026-0007", name: "Ms. Ani", specialization: "Phonics & English Starter", phone: "081833221100", email: "ani@bsdclub.com", activeClasses: 0, totalStudents: 0, hourlyRate: 70000, status: "Nonaktif", joinDate: "2025-01-15" },
  { id: "GUR-2026-0008", name: "Mr. Yoga", specialization: "Math & Science", phone: "081922110099", email: "yoga@bsdclub.com", activeClasses: 0, totalStudents: 0, hourlyRate: 82000, status: "Nonaktif", joinDate: "2025-08-01" },
];

/* ======================== PARENTS ======================== */
export const parents: Parent[] = [
  { id: "PAR-2026-0001", name: "Budi Setiawan", email: "budi.setiawan@email.com", phone: "081234567890", children: ["STD-2026-0001"] },
  { id: "PAR-2026-0002", name: "Hendra Santoso", email: "hendra.santoso@email.com", phone: "081987654321", children: ["STD-2026-0002"] },
  { id: "PAR-2026-0003", name: "Dewi Kirana", email: "dewi.kirana@email.com", phone: "085678901234", children: ["STD-2026-0003"] },
  { id: "PAR-2026-0004", name: "Sari Pratama", email: "sari.pratama@email.com", phone: "082112233445", children: ["STD-2026-0004"] },
  { id: "PAR-2026-0005", name: "Joko Wijaya", email: "joko.wijaya@email.com", phone: "081987654322", children: ["STD-2026-0005"] },
  { id: "PAR-2026-0006", name: "Rina Handayani", email: "rina.handayani@email.com", phone: "081399887766", children: ["STD-2026-0006"] },
  { id: "PAR-2026-0007", name: "Ahmad Ramadan", email: "ahmad.ramadan@email.com", phone: "081555443322", children: ["STD-2026-0007"] },
  { id: "PAR-2026-0008", name: "Siska Pertiwi", email: "siska.pertiwi@email.com", phone: "081777889900", children: ["STD-2026-0008"] },
  { id: "PAR-2026-0009", name: "Lestari Kurnia", email: "lestari.kurnia@email.com", phone: "081888990011", children: ["STD-2026-0009"] },
  { id: "PAR-2026-0010", name: "Rahmat Sari", email: "rahmat.sari@email.com", phone: "082144556677", children: ["STD-2026-0010"] },
];

/* ======================== PROGRAMS ======================== */
export const programs: Program[] = [
  { id: "PRG-001", name: "Calistung", description: "Membaca, menulis, dan berhitung untuk anak usia dini.", levels: ["Level 1 (Pemula)", "Level 2 (Sedang)", "Level 3 (Mahir)"], activeStudents: 34, activeClasses: 4, status: "Aktif" },
  { id: "PRG-002", name: "English", description: "Kursus bahasa Inggris komunikatif untuk anak.", levels: ["Starter (A1)", "Intermediate (B1)", "Advanced (B2)"], activeStudents: 22, activeClasses: 3, status: "Aktif" },
  { id: "PRG-003", name: "Math", description: "Matematika lanjutan dengan pendekatan visual & praktis.", levels: ["Basic", "Intermediate", "Advance"], activeStudents: 14, activeClasses: 2, status: "Aktif" },
  { id: "PRG-004", name: "Phonics", description: "Fonik dasar untuk anak yang mulai belajar membaca.", levels: ["Starter", "Level 1", "Level 2"], activeStudents: 12, activeClasses: 2, status: "Aktif" },
  { id: "PRG-005", name: "Science", description: "Eksplorasi sains dasar dengan eksperimen menyenangkan.", levels: ["Discovery", "Explorer"], activeStudents: 8, activeClasses: 1, status: "Aktif" },
  { id: "PRG-006", name: "Art & Craft", description: "Kreativitas seni dan kerajinan tangan anak.", levels: ["Basic", "Intermediate"], activeStudents: 6, activeClasses: 1, status: "Aktif" },
  { id: "PRG-007", name: "Coding", description: "Pengenalan logika pemrograman untuk anak.", levels: ["Block Coding", "Python Starter"], activeStudents: 4, activeClasses: 1, status: "Aktif" },
  { id: "PRG-008", name: "Islamic Studies", description: "Pembelajaran dasar agama Islam untuk anak.", levels: ["Tilawah", "Fiqih Anak"], activeStudents: 6, activeClasses: 1, status: "Aktif" },
];

/* ======================== CLASSROOMS ======================== */
export const classes: ClassRoom[] = [
  { id: "KLS-2026-0001", name: "KLS-A", program: "Calistung", level: "Level 1", teacher: "Ms. Sarah", day: "Senin & Rabu", timeStart: "14:00", timeEnd: "15:00", room: "Ruang A (Lantai 1)", capacity: 7, enrolled: 4, status: "Aktif" },
  { id: "KLS-2026-0002", name: "KLS-B", program: "English", level: "Level 2 (B1)", teacher: "Mr. Andi", day: "Selasa & Kamis", timeStart: "15:30", timeEnd: "16:30", room: "Ruang B (Lantai 1)", capacity: 7, enrolled: 3, status: "Aktif" },
  { id: "KLS-2026-0003", name: "KLS-C", program: "Math", level: "Level 3 (Advance)", teacher: "Ms. Nina", day: "Senin & Rabu", timeStart: "16:00", timeEnd: "17:00", room: "Ruang C (Lantai 2)", capacity: 7, enrolled: 2, status: "Aktif" },
  { id: "KLS-2026-0004", name: "KLS-D", program: "Phonics", level: "Level 1 (Starter)", teacher: "Ms. Sarah", day: "Selasa & Kamis", timeStart: "14:00", timeEnd: "15:00", room: "Ruang A (Lantai 1)", capacity: 7, enrolled: 4, status: "Aktif" },
  { id: "KLS-2026-0005", name: "KLS-E", program: "Calistung", level: "Level 2", teacher: "Mr. Budi", day: "Rabu & Jumat", timeStart: "14:00", timeEnd: "15:00", room: "Ruang B (Lantai 1)", capacity: 7, enrolled: 3, status: "Aktif" },
  { id: "KLS-2026-0006", name: "KLS-F", program: "English", level: "Level 2 (B2)", teacher: "Ms. Rina", day: "Kamis & Sabtu", timeStart: "10:00", timeEnd: "11:00", room: "Ruang C (Lantai 2)", capacity: 7, enrolled: 2, status: "Aktif" },
  { id: "KLS-2026-0007", name: "KLS-G", program: "Science", level: "Discovery", teacher: "Mr. Dimas", day: "Jumat", timeStart: "15:00", timeEnd: "16:00", room: "Ruang D (Lantai 2)", capacity: 7, enrolled: 3, status: "Aktif" },
  { id: "KLS-2026-0008", name: "KLS-H", program: "Art & Craft", level: "Basic", teacher: "Ms. Rina", day: "Sabtu", timeStart: "09:00", timeEnd: "10:00", room: "Ruang D (Lantai 2)", capacity: 7, enrolled: 2, status: "Aktif" },
  { id: "KLS-2026-0009", name: "KLS-I", program: "Coding", level: "Block Coding", teacher: "Mr. Dimas", day: "Sabtu", timeStart: "11:00", timeEnd: "12:00", room: "Ruang C (Lantai 2)", capacity: 7, enrolled: 1, status: "Aktif" },
  { id: "KLS-2026-0010", name: "KLS-J", program: "Islamic Studies", level: "Tilawah", teacher: "Ms. Ani", day: "Sabtu", timeStart: "13:00", timeEnd: "14:00", room: "Ruang A (Lantai 1)", capacity: 7, enrolled: 2, status: "Aktif" },
  { id: "KLS-2026-0011", name: "KLS-K", program: "Math", level: "Basic", teacher: "Mr. Dimas", day: "Senin", timeStart: "15:00", timeEnd: "16:00", room: "Ruang D (Lantai 2)", capacity: 7, enrolled: 1, status: "Aktif" },
  { id: "KLS-2026-0012", name: "KLS-L", program: "Calistung", level: "Level 3 (Mahir)", teacher: "Mr. Budi", day: "Selasa", timeStart: "14:00", timeEnd: "15:00", room: "Ruang B (Lantai 1)", capacity: 7, enrolled: 1, status: "Aktif" },
  { id: "KLS-2026-0013", name: "KLS-M", program: "English", level: "Starter (A1)", teacher: "Ms. Rina", day: "Rabu", timeStart: "10:00", timeEnd: "11:00", room: "Ruang C (Lantai 2)", capacity: 7, enrolled: 1, status: "Aktif" },
  { id: "KLS-2026-0014", name: "KLS-N", program: "Phonics", level: "Level 2", teacher: "Ms. Sarah", day: "Jumat", timeStart: "14:00", timeEnd: "15:00", room: "Ruang A (Lantai 1)", capacity: 7, enrolled: 0, status: "Aktif" },
];

/* ======================== SCHEDULES (Hari Ini) ======================== */
export const todaySchedules: Schedule[] = [
  { id: "SCH-001", classId: "KLS-2026-0001", className: "KLS-A", program: "Calistung", level: "Level 1", teacher: "Ms. Sarah", day: "Senin", date: "2026-09-08", timeStart: "14:00", timeEnd: "15:00", room: "Ruang A", status: "Selesai" },
  { id: "SCH-002", classId: "KLS-2026-0002", className: "KLS-B", program: "English", level: "Level 2 (B1)", teacher: "Mr. Andi", day: "Selasa", date: "2026-09-09", timeStart: "15:30", timeEnd: "16:30", room: "Ruang B", status: "Berlangsung" },
  { id: "SCH-003", classId: "KLS-2026-0003", className: "KLS-C", program: "Math", level: "Level 3 (Advance)", teacher: "Ms. Nina", day: "Senin", date: "2026-09-08", timeStart: "16:00", timeEnd: "17:00", room: "Ruang C", status: "Selesai" },
  { id: "SCH-004", classId: "KLS-2026-0004", className: "KLS-D", program: "Phonics", level: "Level 1 (Starter)", teacher: "Ms. Sarah", day: "Selasa", date: "2026-09-09", timeStart: "14:00", timeEnd: "15:00", room: "Ruang A", status: "Berlangsung" },
  { id: "SCH-005", classId: "KLS-2026-0006", className: "KLS-F", program: "English", level: "Level 2 (B2)", teacher: "Ms. Rina", day: "Kamis", date: "2026-09-11", timeStart: "10:00", timeEnd: "11:00", room: "Ruang C", status: "Terjadwal" },
  { id: "SCH-006", classId: "KLS-2026-0011", className: "KLS-K", program: "Math", level: "Basic", teacher: "Mr. Dimas", day: "Senin", date: "2026-09-08", timeStart: "15:00", timeEnd: "16:00", room: "Ruang D", status: "Selesai" },
];

export interface InvoiceItem {
  id: string;
  siswa: string;
  idSiswa: string;
  program: string;
  pertemuan: string;
  jumlah: number;
  metode: string;
  tanggal: string;
  status: PaymentStatus;
  jalur: string;
}

/* ======================== INVOICES ======================== */
export const invoices: InvoiceItem[] = [
  { id: "INV-2026-000001", siswa: "Andi Setiawan", idSiswa: "STD-2026-0001", program: "Calistung Level 1", pertemuan: "Pertemuan 7 & 8", jumlah: 100000, metode: "Cash", tanggal: "2 Sept 2026", status: "Menunggu Konfirmasi", jalur: "via Orang Tua" },
  { id: "INV-2026-000002", siswa: "Budi Santoso", idSiswa: "STD-2026-0002", program: "English B1", pertemuan: "Pertemuan 4", jumlah: 75000, metode: "QRIS", tanggal: "1 Sept 2026", status: "Lunas", jalur: "via Orang Tua" },
  { id: "INV-2026-000003", siswa: "Citra Kirana", idSiswa: "STD-2026-0003", program: "Math Advance", pertemuan: "Pertemuan 9 & 10", jumlah: 120000, metode: "Cash", tanggal: "31 Agt 2026", status: "Menunggu Konfirmasi", jalur: "via Orang Tua" },
  { id: "INV-2026-000004", siswa: "Dian Pratama", idSiswa: "STD-2026-0004", program: "Phonics Starter", pertemuan: "Pertemuan 3", jumlah: 50000, metode: "–", tanggal: "–", status: "Overdue", jalur: "–" },
  { id: "INV-2026-000005", siswa: "Eko Wijaya", idSiswa: "STD-2026-0005", program: "Calistung Level 2", pertemuan: "Pertemuan 11 & 12", jumlah: 100000, metode: "Cash", tanggal: "28 Agt 2026", status: "Lunas", jalur: "via Admin" },
  { id: "INV-2026-000006", siswa: "Fitri Handayani", idSiswa: "STD-2026-0006", program: "English B1", pertemuan: "Pertemuan 8", jumlah: 75000, metode: "Transfer Mandiri", tanggal: "29 Agt 2026", status: "Lunas", jalur: "via Orang Tua" },
  { id: "INV-2026-000007", siswa: "Gilang Ramadan", idSiswa: "STD-2026-0007", program: "Math Advance", pertemuan: "Pertemuan 5", jumlah: 60000, metode: "VA BCA", tanggal: "28 Agt 2026", status: "Partially Paid", jalur: "via Orang Tua" },
  { id: "INV-2026-000008", siswa: "Hana Pertiwi", idSiswa: "STD-2026-0008", program: "Phonics Starter", pertemuan: "Pertemuan 1 & 2", jumlah: 100000, metode: "–", tanggal: "–", status: "Overdue", jalur: "–" },
];

/* ======================== CASH VERIFICATIONS ======================== */
export const cashVerifications: CashVerification[] = [
  { id: "CASH-2026-000001", parentName: "Budi Setiawan", studentName: "Andi Setiawan", amount: 100000, status: "Menunggu Konfirmasi", submittedAt: "2026-09-08T10:30:00" },
  { id: "CASH-2026-000002", parentName: "Dewi Kirana", studentName: "Citra Kirana", amount: 120000, status: "Menunggu Konfirmasi", submittedAt: "2026-09-07T14:15:00" },
  { id: "CASH-2026-000003", parentName: "Joko Wijaya", studentName: "Eko Wijaya", amount: 100000, status: "Dikonfirmasi", submittedAt: "2026-09-05T09:00:00", verifiedAt: "2026-09-05T11:30:00", verifiedBy: "Admin Rina" },
];

/* ======================== HONOR RECORDS ======================== */
export const honorRecords: HonorRecord[] = [
  { id: "HNR-2026-0001", teacherId: "GUR-2026-0001", teacherName: "Ms. Sarah", specialization: "Calistung & Phonics", sessionsCompleted: 18, totalHours: 18.0, hourlyRate: 75000, subtotal: 1350000, bonus: [{ amount: 100000, note: "Bonus Kerajinan & Presensi Sempurna", date: "2026-09-01" }], total: 1450000, status: "Belum Dibayar", period: "September 2026" },
  { id: "HNR-2026-0002", teacherId: "GUR-2026-0002", teacherName: "Mr. Andi", specialization: "English B1 & B2", sessionsCompleted: 14, totalHours: 14.0, hourlyRate: 80000, subtotal: 1120000, bonus: [], total: 1120000, status: "Sudah Dibayar", period: "September 2026" },
  { id: "HNR-2026-0003", teacherId: "GUR-2026-0003", teacherName: "Ms. Nina", specialization: "Math Advance", sessionsCompleted: 10, totalHours: 10.5, hourlyRate: 80000, subtotal: 840000, bonus: [{ amount: 50000, note: "Bonus Pengisian Logbook Cepat", date: "2026-08-28" }], total: 890000, status: "Belum Dibayar", period: "September 2026" },
  { id: "HNR-2026-0004", teacherId: "GUR-2026-0004", teacherName: "Mr. Budi", specialization: "Calistung Lanjut", sessionsCompleted: 12, totalHours: 12.0, hourlyRate: 75000, subtotal: 900000, bonus: [], total: 900000, status: "Sudah Dibayar", period: "September 2026" },
  { id: "HNR-2026-0005", teacherId: "GUR-2026-0005", teacherName: "Ms. Rina", specialization: "English Advanced & Phonics", sessionsCompleted: 8, totalHours: 8.0, hourlyRate: 78000, subtotal: 624000, bonus: [], total: 624000, status: "Belum Dibayar", period: "September 2026" },
  { id: "HNR-2026-0006", teacherId: "GUR-2026-0006", teacherName: "Mr. Dimas", specialization: "Calistung & Math Dasar", sessionsCompleted: 6, totalHours: 6.0, hourlyRate: 72000, subtotal: 432000, bonus: [], total: 432000, status: "Belum Dibayar", period: "September 2026" },
];

/* ======================== ENROLLMENTS ======================== */
export const enrollments: Enrollment[] = [
  { id: "ENR-2026-0001", studentName: "Naura Azzahra", parentName: "Fauzan Azzahra", parentPhone: "082199887766", program: "Calistung", status: "Pending", submittedAt: "2026-09-07T08:00:00" },
  { id: "ENR-2026-0002", studentName: "Zaki Harun", parentName: "Rina Harun", parentPhone: "085611223344", program: "English", preferredLevel: "Starter (A1)", status: "Pending", submittedAt: "2026-09-06T10:30:00" },
  { id: "ENR-2026-0003", studentName: "Ivan Kurnia", parentName: "Lestari Kurnia", parentPhone: "081888990011", program: "Calistung", status: "Approved", submittedAt: "2026-09-01T09:00:00", reviewedAt: "2026-09-02T10:00:00", reviewedBy: "Admin Rina" },
  { id: "ENR-2026-0004", studentName: "Dian Pratama", parentName: "Sari Pratama", parentPhone: "082112233445", program: "Phonics", status: "Approved", submittedAt: "2026-08-20T14:00:00", reviewedAt: "2026-08-21T09:00:00", reviewedBy: "Admin Rina" },
];

/* ======================== ANNOUNCEMENTS ======================== */
export const announcements: Announcement[] = [
  { id: "ANN-001", title: "Jadwal Libur Nasional 17 Agustus 2026", content: "Semua kelas tidak aktif pada tanggal 17 Agustus 2026 dalam rangka HUT RI. Kelas akan dilanjutkan minggu berikutnya sesuai jadwal normal.", target: "Semua", status: "Published", publishedAt: "2026-08-10", author: "Owner" },
  { id: "ANN-002", title: "Pembukaan Kelas Baru Math Advance Level 2", content: "Kami membuka kelas baru Math Advance Level 2 untuk siswa yang telah menyelesaikan Level 1. Kuota terbatas 7 siswa per batch. Hubungi admin untuk pendaftaran.", target: "Semua", status: "Published", publishedAt: "2026-08-15", author: "Admin" },
  { id: "ANN-003", title: "Info Sertifikat Kelulusan Bulan Agustus", content: "Sertifikat kelulusan untuk siswa yang telah Graduate bulan Agustus 2026 sudah bisa diambil di front desk atau akan dikirim via email.", target: "Orang Tua", status: "Published", publishedAt: "2026-08-20", author: "Admin" },
  { id: "ANN-004", title: "Workshop Guru: Metode Pembelajaran Interaktif", content: "Workshop untuk guru dan staff mengenai teknik pembelajaran interaktif akan diadakan pada hari Sabtu, 20 September 2026.", target: "Guru", status: "Draft", author: "Owner" },
];

/* ======================== INVENTORY ======================== */
export const inventory: InventoryItem[] = [
  { id: "INV-ITM-001", name: "Papan Tulis Whiteboard 120x240", category: "Furniture", quantity: 4, unitPrice: 850000, purchaseDate: "2025-01-15", condition: "Good", location: "Ruang A & B", responsible: "Admin Rina" },
  { id: "INV-ITM-002", name: "Meja Anak Kayu Jati", category: "Furniture", quantity: 28, unitPrice: 450000, purchaseDate: "2025-01-15", condition: "Good", location: "Semua Ruang", responsible: "Admin Rina" },
  { id: "INV-ITM-003", name: "Kursi Anak Lipat", category: "Furniture", quantity: 30, unitPrice: 280000, purchaseDate: "2025-02-01", condition: "Good", location: "Semua Ruang", responsible: "Admin Rina" },
  { id: "INV-ITM-004", name: "Laptop Acer Aspire (14 inch)", category: "Elektronik", quantity: 4, unitPrice: 6500000, purchaseDate: "2025-03-10", condition: "Good", location: "Ruang C (Coding)", responsible: "Mr. Dimas" },
  { id: "INV-ITM-005", name: "Proyektor Epson EB-X51", category: "Elektronik", quantity: 2, unitPrice: 8200000, purchaseDate: "2025-03-10", condition: "Good", location: "Ruang A & C", responsible: "Admin Rina" },
  { id: "INV-ITM-006", name: "Speaker Portable JBL Flip 6", category: "Elektronik", quantity: 3, unitPrice: 1650000, purchaseDate: "2025-04-01", condition: "Damaged", location: "Ruang B", responsible: "Mr. Andi" },
  { id: "INV-ITM-007", name: "Lemari Arsip 4 Laci", category: "Furniture", quantity: 2, unitPrice: 1200000, purchaseDate: "2025-01-20", condition: "Good", location: "Ruang Admin", responsible: "Admin Rina" },
  { id: "INV-ITM-008", name: "Printer Canon PIXMA G3010", category: "Elektronik", quantity: 1, unitPrice: 2850000, purchaseDate: "2025-05-01", condition: "Under Repair", location: "Ruang Admin", responsible: "Admin Rina" },
  { id: "INV-ITM-009", name: "Buku Tulis Anak (pack 10)", category: "Alat Tulis", quantity: 50, unitPrice: 35000, purchaseDate: "2026-01-10", condition: "Good", location: "Gudang", responsible: "Admin Rina" },
  { id: "INV-ITM-010", name: "Spidol Whiteboard (set 6 warna)", category: "Alat Tulis", quantity: 12, unitPrice: 45000, purchaseDate: "2026-01-10", condition: "Good", location: "Semua Ruang", responsible: "Admin Rina" },
  { id: "INV-ITM-011", name: "Meja Guru Standing Desk", category: "Furniture", quantity: 1, unitPrice: 2100000, purchaseDate: "2025-06-01", condition: "Damaged", location: "Ruang Guru", responsible: "Admin Rina" },
  { id: "INV-ITM-012", name: "Mainan Edukasi Montessori Set", category: "Mainan", quantity: 3, unitPrice: 350000, purchaseDate: "2026-02-15", condition: "Good", location: "Ruang A", responsible: "Ms. Sarah" },
];

/* ======================== CERTIFICATES ======================== */
export const certificates: Certificate[] = [
  { id: "CERT-2026-0012", studentId: "STD-2026-0001", studentName: "Andi Setiawan", program: "Calistung", level: "Level 1", finalScore: 92, issueDate: "2026-08-05" },
  { id: "CERT-2026-0011", studentId: "STD-2026-0010", studentName: "Maya Sari", program: "English", level: "Level 2 (B1)", finalScore: 88, issueDate: "2026-08-03" },
  { id: "CERT-2026-0010", studentId: "STD-2026-0011", studentName: "Raka Pratama", program: "Phonics", level: "Level 1 (Starter)", finalScore: 85, issueDate: "2026-08-01" },
];

/* ======================== ADMIN ACCOUNTS ======================== */
export const adminAccounts = [
  { id: "ADM-0001", name: "Admin Rina", email: "rina.admin@bsdafterschool.com", role: "Admin", status: "Aktif", joinDate: "2025-01-01" },
  { id: "ADM-0002", name: "Admin Dina", email: "dina.admin@bsdafterschool.com", role: "Admin", status: "Aktif", joinDate: "2025-06-01" },
];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "error" | "success";
  read: boolean;
  createdAt: string;
  href: string;
}

/* ======================== NOTIFICATIONS ======================== */
export const notificationsByRole: Record<string, NotificationItem[]> = {
  owner: [
    { id: "NOT-O01", title: "Cash Verification Pending", message: "2 pembayaran cash menunggu verifikasi Anda", type: "warning", read: false, createdAt: "2026-09-08T10:30:00", href: "/owner/verifikasi-cash" },
    { id: "NOT-O02", title: "New Enrollment", message: "Naura Azzahra mendaftar program Calistung", type: "info", read: false, createdAt: "2026-09-07T08:00:00", href: "/owner/pendaftaran" },
    { id: "NOT-O03", title: "Overdue Payment", message: "Hana Pertiwi — tagihan Rp 100.000 overdue 5 hari", type: "error", read: true, createdAt: "2026-09-05T09:00:00", href: "/owner/tagihan" },
    { id: "NOT-O04", title: "Honor Submitted", message: "Ms. Sarah — honor Rp 1.450.000 belum dibayar", type: "info", read: true, createdAt: "2026-09-04T16:00:00", href: "/owner/honor" },
  ],
  admin: [
    { id: "NOT-A01", title: "Verifikasi Cash Diperlukan", message: "3 pembayaran cash dari orang tua menunggu verifikasi", type: "warning", read: false, createdAt: "2026-09-08T11:00:00", href: "/admin/verifikasi-cash" },
    { id: "NOT-A02", title: "Pendaftaran Baru", message: "Raka Pratama mendaftar program English Starter", type: "info", read: false, createdAt: "2026-09-07T09:30:00", href: "/admin/pendaftaran" },
    { id: "NOT-A03", title: "Inventaris Perlu Diperbaiki", message: "2 meja dan 1 kursi di ruang Phonics perlu perbaikan", type: "warning", read: true, createdAt: "2026-09-06T14:00:00", href: "/admin/inventaris" },
    { id: "NOT-A04", title: "Tagihan Overdue", message: "5 tagihan belum dibayar melewati jatuh tempo", type: "error", read: true, createdAt: "2026-09-05T08:00:00", href: "/admin/tagihan" },
  ],
  guru: [
    { id: "NOT-G01", title: "Jadwal Mengajar Hari Ini", message: "Anda memiliki 3 sesi mengajar hari ini: Phonics A, Calistung B, English C", type: "info", read: false, createdAt: "2026-09-09T07:00:00", href: "/guru/kelas" },
    { id: "NOT-G02", title: "Logbook Belum Diisi", message: "Sesi Calistung Level 1 — 9 Sept 2026 belum ada catatan logbook", type: "warning", read: false, createdAt: "2026-09-09T08:30:00", href: "/guru/logbook" },
    { id: "NOT-G03", title: "Honor Bulanan Siap", message: "Honor September Anda: Rp 1.450.000 — menunggu approval owner", type: "info", read: true, createdAt: "2026-09-08T16:00:00", href: "/guru/honor" },
    { id: "NOT-G04", title: "Progress Siswa Update", message: "Andi Setiawan mencapai 70% progress program Calistung", type: "success", read: true, createdAt: "2026-09-07T15:00:00", href: "/guru/progress" },
  ],
  orangTua: [
    { id: "NOT-P01", title: "Tagihan Pembayaran", message: "Tagihan pertemuan 7 & 8 sebesar Rp 100.000 belum dibayar", type: "warning", read: false, createdAt: "2026-09-08T10:00:00", href: "/orang-tua/pembayaran" },
    { id: "NOT-P02", title: "Pengumuman Baru", message: "Jadwal libur nasional 17 Agustus — sesi digeser", type: "info", read: false, createdAt: "2026-09-07T09:00:00", href: "/orang-tua/pengumuman" },
    { id: "NOT-P03", title: "Pembayaran Berhasil", message: "Pembayaran Virtual Account BCA Rp 250.000 telah terverifikasi", type: "success", read: true, createdAt: "2026-09-06T14:00:00", href: "/orang-tua/pembayaran" },
    { id: "NOT-P04", title: "Logbook Anak", message: "Ms. Sarah menulis catatan untuk sesi Andi — Membaca Kalimat Sederhana", type: "info", read: true, createdAt: "2026-09-05T16:00:00", href: "/orang-tua/absensi" },
  ],
};
export const notifications: NotificationItem[] = notificationsByRole.owner;

/* ======================== REVENUE SUMMARY ======================== */
export const revenueSummary = {
  totalIncome: 24700000,
  lastMonthIncome: 21600000,
  growthPercent: 14.2,
  honorPaid: 8450000,
  netProfit: 16250000,
  byProgram: [
    { name: "Calistung", amount: 9500000 },
    { name: "English", amount: 6800000 },
    { name: "Math", amount: 5200000 },
    { name: "Phonics", amount: 3200000 },
  ],
};

/* ======================== COUNTS (for dashboards) ======================== */
export const dashboardCounts = {
  totalStudents: students.length,
  activeStudents: students.filter(s => s.status === "Aktif").length,
  totalTeachers: teachers.length,
  activeTeachers: teachers.filter(t => t.status === "Aktif").length,
  totalClasses: classes.length,
  activeClasses: classes.filter(c => c.status === "Aktif").length,
  totalParents: parents.length,
  totalPrograms: programs.filter(p => p.status === "Aktif").length,
  totalLevels: programs.reduce((sum, p) => sum + p.levels.length, 0),
  totalInventory: inventory.length,
  goodInventory: inventory.filter(i => i.condition === "Good").length,
  underRepairInventory: inventory.filter(i => i.condition === "Under Repair").length,
  damagedInventory: inventory.filter(i => i.condition === "Damaged").length,
  pendingEnrollments: enrollments.filter(e => e.status === "Pending").length,
  overdueInvoices: invoices.filter(i => i.status === "Overdue").length,
  pendingCashVerifications: cashVerifications.filter(c => c.status === "Menunggu Konfirmasi").length,
  publishedAnnouncements: announcements.filter(a => a.status === "Published").length,
  certificatesIssued: certificates.length,
};
