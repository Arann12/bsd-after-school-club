"use client";
import { useState } from "react";
import Link from "next/link";

/* ============================================================
   DATA
   ============================================================ */
const bulanOpsi = ["September 2026", "Agustus 2026", "Juli 2026"];

interface BulanKehadiran {
  totalPertemuan: number;
  rataKehadiran: number;
  siswaAlphaTop: string;
  kelasRendah: string;
  grafikHarian: { hari: string; hadir: number; total: number }[];
  perKelas: { kelas: string; program: string; guru: string; siswa: number; pertemuan: number; hadirPct: number; alphaPct: number; sakit: number; izin: number }[];
  perSiswa: { id: string; nama: string; kelas: string; program: string; hadir: number; alpha: number; sakit: number; izin: number; total: number }[];
  perGuru: { nama: string; program: string; sesi: number; rataKehadiran: number }[];
  alertSiswa: { nama: string; kelas: string; program: string; kehadiran: number; alphaBerturut: number }[];
}

const dataBulanan: Record<string, BulanKehadiran> = {
  "September 2026": {
    totalPertemuan: 48, rataKehadiran: 87, siswaAlphaTop: "Dian Pratama", kelasRendah: "KLS-D",
    grafikHarian: [
      { hari: "Senin", hadir: 38, total: 42 },
      { hari: "Selasa", hadir: 36, total: 40 },
      { hari: "Rabu", hadir: 40, total: 44 },
      { hari: "Kamis", hadir: 35, total: 41 },
      { hari: "Jumat", hadir: 30, total: 35 },
      { hari: "Sabtu", hadir: 28, total: 32 },
    ],
    perKelas: [
      { kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", siswa: 7, pertemuan: 8, hadirPct: 92, alphaPct: 4, sakit: 3, izin: 2 },
      { kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", siswa: 6, pertemuan: 8, hadirPct: 89, alphaPct: 6, sakit: 2, izin: 3 },
      { kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", siswa: 7, pertemuan: 8, hadirPct: 85, alphaPct: 8, sakit: 4, izin: 2 },
      { kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", siswa: 6, pertemuan: 8, hadirPct: 78, alphaPct: 14, sakit: 3, izin: 4 },
      { kelas: "KLS-E", program: "Calistung L2", guru: "Mr. Budi", siswa: 5, pertemuan: 8, hadirPct: 91, alphaPct: 5, sakit: 2, izin: 1 },
    ],
    perSiswa: [
      { id: "STD-2026-0001", nama: "Andi Setiawan", kelas: "KLS-A", program: "Calistung L1", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0002", nama: "Budi Santoso", kelas: "KLS-B", program: "English B1", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0003", nama: "Citra Kirana", kelas: "KLS-C", program: "Math Advance", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0004", nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", hadir: 4, alpha: 3, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0005", nama: "Eko Wijaya", kelas: "KLS-E", program: "Calistung L2", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0006", nama: "Fitri Handayani", kelas: "KLS-B", program: "English B1", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0007", nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", hadir: 5, alpha: 2, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0008", nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0009", nama: "Ivan Kurnia", kelas: "KLS-A", program: "Calistung L1", hadir: 6, alpha: 1, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0010", nama: "Juni Susanti", kelas: "KLS-C", program: "Math Advance", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    ],
    perGuru: [
      { nama: "Ms. Sarah", program: "Calistung L1 & Phonics", sesi: 16, rataKehadiran: 88 },
      { nama: "Mr. Andi", program: "English B1", sesi: 8, rataKehadiran: 89 },
      { nama: "Ms. Nina", program: "Math Advance", sesi: 8, rataKehadiran: 85 },
      { nama: "Mr. Budi", program: "Calistung L2", sesi: 8, rataKehadiran: 91 },
    ],
    alertSiswa: [
      { nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 50, alphaBerturut: 3 },
      { nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", kehadiran: 63, alphaBerturut: 2 },
      { nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 63, alphaBerturut: 2 },
    ],
  },
  "Agustus 2026": {
    totalPertemuan: 44, rataKehadiran: 84, siswaAlphaTop: "Gilang Ramadan", kelasRendah: "KLS-D",
    grafikHarian: [
      { hari: "Senin", hadir: 34, total: 40 },
      { hari: "Selasa", hadir: 32, total: 38 },
      { hari: "Rabu", hadir: 36, total: 42 },
      { hari: "Kamis", hadir: 31, total: 38 },
      { hari: "Jumat", hadir: 28, total: 33 },
      { hari: "Sabtu", hadir: 25, total: 30 },
    ],
    perKelas: [
      { kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", siswa: 7, pertemuan: 8, hadirPct: 88, alphaPct: 7, sakit: 3, izin: 2 },
      { kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", siswa: 6, pertemuan: 8, hadirPct: 86, alphaPct: 8, sakit: 2, izin: 2 },
      { kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", siswa: 7, pertemuan: 8, hadirPct: 82, alphaPct: 10, sakit: 3, izin: 3 },
      { kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", siswa: 5, pertemuan: 8, hadirPct: 74, alphaPct: 18, sakit: 2, izin: 4 },
      { kelas: "KLS-E", program: "Calistung L2", guru: "Mr. Budi", siswa: 5, pertemuan: 8, hadirPct: 90, alphaPct: 5, sakit: 2, izin: 1 },
    ],
    perSiswa: [
      { id: "STD-2026-0001", nama: "Andi Setiawan", kelas: "KLS-A", program: "Calistung L1", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0002", nama: "Budi Santoso", kelas: "KLS-B", program: "English B1", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0003", nama: "Citra Kirana", kelas: "KLS-C", program: "Math Advance", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0004", nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", hadir: 4, alpha: 3, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0005", nama: "Eko Wijaya", kelas: "KLS-E", program: "Calistung L2", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0006", nama: "Fitri Handayani", kelas: "KLS-B", program: "English B1", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0007", nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", hadir: 4, alpha: 3, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0008", nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0009", nama: "Ivan Kurnia", kelas: "KLS-A", program: "Calistung L1", hadir: 6, alpha: 2, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0010", nama: "Juni Susanti", kelas: "KLS-C", program: "Math Advance", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    ],
    perGuru: [
      { nama: "Ms. Sarah", program: "Calistung L1 & Phonics", sesi: 16, rataKehadiran: 84 },
      { nama: "Mr. Andi", program: "English B1", sesi: 8, rataKehadiran: 86 },
      { nama: "Ms. Nina", program: "Math Advance", sesi: 8, rataKehadiran: 82 },
      { nama: "Mr. Budi", program: "Calistung L2", sesi: 8, rataKehadiran: 90 },
    ],
    alertSiswa: [
      { nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 50, alphaBerturut: 3 },
      { nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", kehadiran: 50, alphaBerturut: 3 },
      { nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 63, alphaBerturut: 2 },
    ],
  },
  "Juli 2026": {
    totalPertemuan: 40, rataKehadiran: 82, siswaAlphaTop: "Dian Pratama", kelasRendah: "KLS-D",
    grafikHarian: [
      { hari: "Senin", hadir: 30, total: 38 },
      { hari: "Selasa", hadir: 28, total: 35 },
      { hari: "Rabu", hadir: 32, total: 40 },
      { hari: "Kamis", hadir: 27, total: 34 },
      { hari: "Jumat", hadir: 25, total: 32 },
      { hari: "Sabtu", hadir: 22, total: 28 },
    ],
    perKelas: [
      { kelas: "KLS-A", program: "Calistung L1", guru: "Ms. Sarah", siswa: 6, pertemuan: 8, hadirPct: 86, alphaPct: 8, sakit: 3, izin: 2 },
      { kelas: "KLS-B", program: "English B1", guru: "Mr. Andi", siswa: 5, pertemuan: 8, hadirPct: 84, alphaPct: 10, sakit: 2, izin: 2 },
      { kelas: "KLS-C", program: "Math Advance", guru: "Ms. Nina", siswa: 6, pertemuan: 8, hadirPct: 80, alphaPct: 12, sakit: 2, izin: 3 },
      { kelas: "KLS-D", program: "Phonics Starter", guru: "Ms. Sarah", siswa: 5, pertemuan: 8, hadirPct: 72, alphaPct: 20, sakit: 1, izin: 4 },
      { kelas: "KLS-E", program: "Calistung L2", guru: "Mr. Budi", siswa: 4, pertemuan: 8, hadirPct: 88, alphaPct: 6, sakit: 2, izin: 0 },
    ],
    perSiswa: [
      { id: "STD-2026-0001", nama: "Andi Setiawan", kelas: "KLS-A", program: "Calistung L1", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
      { id: "STD-2026-0002", nama: "Budi Santoso", kelas: "KLS-B", program: "English B1", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0003", nama: "Citra Kirana", kelas: "KLS-C", program: "Math Advance", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0004", nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", hadir: 3, alpha: 4, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0005", nama: "Eko Wijaya", kelas: "KLS-E", program: "Calistung L2", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0006", nama: "Fitri Handayani", kelas: "KLS-B", program: "English B1", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
      { id: "STD-2026-0007", nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0008", nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0009", nama: "Ivan Kurnia", kelas: "KLS-A", program: "Calistung L1", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8 },
      { id: "STD-2026-0010", nama: "Juni Susanti", kelas: "KLS-C", program: "Math Advance", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    ],
    perGuru: [
      { nama: "Ms. Sarah", program: "Calistung L1 & Phonics", sesi: 16, rataKehadiran: 82 },
      { nama: "Mr. Andi", program: "English B1", sesi: 8, rataKehadiran: 84 },
      { nama: "Ms. Nina", program: "Math Advance", sesi: 8, rataKehadiran: 80 },
      { nama: "Mr. Budi", program: "Calistung L2", sesi: 8, rataKehadiran: 88 },
    ],
    alertSiswa: [
      { nama: "Dian Pratama", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 38, alphaBerturut: 4 },
      { nama: "Gilang Ramadan", kelas: "KLS-C", program: "Math Advance", kehadiran: 63, alphaBerturut: 2 },
      { nama: "Hana Pertiwi", kelas: "KLS-D", program: "Phonics Starter", kehadiran: 63, alphaBerturut: 2 },
    ],
  },
};

const badgeKehadiran = (pct: number) => {
  if (pct >= 80) return { bg: "#d1fae5", color: "#059669", label: `${pct}%` };
  if (pct >= 60) return { bg: "#fef3c7", color: "#b45309", label: `${pct}%` };
  return { bg: "#fee2e2", color: "#dc2626", label: `${pct}%` };
};

/* ============================================================
   COMPONENT
   ============================================================ */
/* Detail data per kelas — siswa-siswa dalam kelas tsb */
const detailKelasData: Record<string, { nama: string; hadir: number; alpha: number; sakit: number; izin: number; total: number; catatan?: string }[]> = {
  "KLS-A": [
    { nama: "Andi Setiawan", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Ivan Kurnia", hadir: 6, alpha: 1, sakit: 0, izin: 1, total: 8, catatan: "Izin 1 hari (sakit)" },
    { nama: "Lestari Putri", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
    { nama: "Maya Sari", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Nanda Prasetyo", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
    { nama: "Omar Hadi", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Putri Amelia", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
  ],
  "KLS-B": [
    { nama: "Budi Santoso", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
    { nama: "Fitri Handayani", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
    { nama: "Rizky Aditya", hadir: 6, alpha: 1, sakit: 0, izin: 1, total: 8 },
    { nama: "Sari Melati", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    { nama: "Tono Sugiarto", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Ulya Nuraini", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
  ],
  "KLS-C": [
    { nama: "Citra Kirana", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
    { nama: "Gilang Ramadan", hadir: 5, alpha: 2, sakit: 1, izin: 0, total: 8, catatan: "Alpha 2x berturut-turut" },
    { nama: "Juni Susanti", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    { nama: "Winda Oktavia", hadir: 6, alpha: 1, sakit: 0, izin: 1, total: 8 },
    { nama: "Yoga Pratama", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
    { nama: "Zahra Aulia", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Arief Budiman", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
  ],
  "KLS-D": [
    { nama: "Dian Pratama", hadir: 4, alpha: 3, sakit: 1, izin: 0, total: 8, catatan: "⚠ Alpha 3x berturut-turut" },
    { nama: "Hana Pertiwi", hadir: 5, alpha: 2, sakit: 0, izin: 1, total: 8, catatan: "Alpha 2x berturut-turut" },
    { nama: "Bagas Pratama", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    { nama: "Citra Dewi", hadir: 6, alpha: 1, sakit: 1, izin: 0, total: 8 },
    { nama: "Dani Kurniawan", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
    { nama: "Eka Saputri", hadir: 6, alpha: 1, sakit: 0, izin: 1, total: 8 },
  ],
  "KLS-E": [
    { nama: "Eko Wijaya", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Fajar Nugroho", hadir: 7, alpha: 0, sakit: 1, izin: 0, total: 8 },
    { nama: "Gita Sari", hadir: 7, alpha: 1, sakit: 0, izin: 0, total: 8 },
    { nama: "Hendra Wijaya", hadir: 8, alpha: 0, sakit: 0, izin: 0, total: 8 },
    { nama: "Indah Lestari", hadir: 7, alpha: 0, sakit: 0, izin: 1, total: 8 },
  ],
};

/* Detail data per siswa — riwayat harian */
const detailSiswaData: Record<string, { tanggal: string; hari: string; status: "Hadir" | "Alpha" | "Sakit" | "Izin"; catatan?: string }[]> = {
  "STD-2026-0001": [
    { tanggal: "1 Sep 2026", hari: "Senin", status: "Hadir" },
    { tanggal: "3 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "8 Sep 2026", hari: "Senin", status: "Hadir" },
    { tanggal: "10 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "15 Sep 2026", hari: "Senin", status: "Hadir" },
    { tanggal: "17 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "22 Sep 2026", hari: "Senin", status: "Hadir" },
    { tanggal: "24 Sep 2026", hari: "Rabu", status: "Hadir" },
  ],
  "STD-2026-0002": [
    { tanggal: "2 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "4 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "9 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "11 Sep 2026", hari: "Kamis", status: "Alpha", catatan: "Tanpa keterangan" },
    { tanggal: "16 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "18 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "23 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "25 Sep 2026", hari: "Kamis", status: "Hadir" },
  ],
  "STD-2026-0003": [
    { tanggal: "1 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "3 Sep 2026", hari: "Jumat", status: "Hadir" },
    { tanggal: "8 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "10 Sep 2026", hari: "Jumat", status: "Sakit", catatan: "Demam" },
    { tanggal: "15 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "17 Sep 2026", hari: "Jumat", status: "Hadir" },
    { tanggal: "22 Sep 2026", hari: "Rabu", status: "Hadir" },
    { tanggal: "24 Sep 2026", hari: "Jumat", status: "Hadir" },
  ],
  "STD-2026-0004": [
    { tanggal: "1 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "6 Sep 2026", hari: "Sabtu", status: "Hadir" },
    { tanggal: "8 Sep 2026", hari: "Kamis", status: "Alpha", catatan: "Tanpa keterangan" },
    { tanggal: "13 Sep 2026", hari: "Sabtu", status: "Hadir" },
    { tanggal: "15 Sep 2026", hari: "Kamis", status: "Alpha", catatan: "Tanpa keterangan" },
    { tanggal: "20 Sep 2026", hari: "Sabtu", status: "Sakit", catatan: "Sakit perut" },
    { tanggal: "22 Sep 2026", hari: "Kamis", status: "Alpha", catatan: "Tanpa keterangan" },
    { tanggal: "27 Sep 2026", hari: "Sabtu", status: "Hadir" },
  ],
  "STD-2026-0005": [
    { tanggal: "2 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "4 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "9 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "11 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "16 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "18 Sep 2026", hari: "Kamis", status: "Hadir" },
    { tanggal: "23 Sep 2026", hari: "Selasa", status: "Hadir" },
    { tanggal: "25 Sep 2026", hari: "Kamis", status: "Hadir" },
  ],
};

/* Detail data per guru — breakdown per kelas */
const detailGuruData: Record<string, { kelas: string; program: string; siswa: number; sesi: number; rataHadir: number; siswaAlert: string[] }[]> = {
  "Ms. Sarah": [
    { kelas: "KLS-A", program: "Calistung L1", siswa: 7, sesi: 8, rataHadir: 92, siswaAlert: [] },
    { kelas: "KLS-D", program: "Phonics Starter", siswa: 6, sesi: 8, rataHadir: 78, siswaAlert: ["Dian Pratama (50%)", "Hana Pertiwi (63%)"] },
  ],
  "Mr. Andi": [
    { kelas: "KLS-B", program: "English B1", siswa: 6, sesi: 8, rataHadir: 89, siswaAlert: [] },
  ],
  "Ms. Nina": [
    { kelas: "KLS-C", program: "Math Advance", siswa: 7, sesi: 8, rataHadir: 85, siswaAlert: ["Gilang Ramadan (63%)"] },
  ],
  "Mr. Budi": [
    { kelas: "KLS-E", program: "Calistung L2", siswa: 5, sesi: 8, rataHadir: 91, siswaAlert: [] },
  ],
};

const fmtStatus = (s: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Hadir: { bg: "#d1fae5", color: "#059669" },
    Alpha: { bg: "#fee2e2", color: "#dc2626" },
    Sakit: { bg: "#fef3c7", color: "#b45309" },
    Izin: { bg: "#dbeafe", color: "#1d4ed8" },
  };
  return map[s] || { bg: "#f1f5f9", color: "#64748b" };
};

export default function LaporanKehadiranPage() {
  const [bulan, setBulan] = useState("September 2026");
  const [searchSiswa, setSearchSiswa] = useState("");
  const [detailKelas, setDetailKelas] = useState<string | null>(null);
  const [detailSiswa, setDetailSiswa] = useState<string | null>(null);
  const [detailGuru, setDetailGuru] = useState<string | null>(null);
  const d = dataBulanan[bulan];

  const siswaFiltered = d.perSiswa.filter(s =>
    s.nama.toLowerCase().includes(searchSiswa.toLowerCase()) || s.id.toLowerCase().includes(searchSiswa.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link href="/owner/laporan" style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Laporan</Link>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>/</span>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>Kehadiran</span>
          </div>
          <h1 className="page-title">Laporan Kehadiran</h1>
          <p className="page-subtitle">Rekap kehadiran siswa dan guru per bulan, per kelas, beserta alert siswa bermasalah.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select value={bulan} onChange={e => setBulan(e.target.value)}
            style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "9px 14px", fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)", background: "white", cursor: "pointer" }}>
            {bulanOpsi.map(b => <option key={b}>{b}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => window.print()}>Cetak PDF</button>
        </div>
      </div>

      {/* Section A: KPI Utama */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Pertemuan", val: `${d.totalPertemuan} Sesi`, color: "#1d4ed8", sub: "Sepanjang bulan" },
          { label: "Rata-rata Kehadiran", val: `${d.rataKehadiran}%`, color: d.rataKehadiran >= 80 ? "#059669" : "#b45309", sub: d.rataKehadiran >= 80 ? "Target ≥80% tercapai" : "Di bawah target 80%" },
          { label: "Siswa Alpha Terbanyak", val: d.siswaAlphaTop, color: "#dc2626", sub: "Perlu tindak lanjut" },
          { label: "Kelas Kehadiran Terendah", val: d.kelasRendah, color: "#b45309", sub: "Di bawah rata-rata" },
        ].map(k => (
          <div key={k.label} className="stat-card" style={{ gap: 6 }}>
            <span className="stat-card-label">{k.label}</span>
            <div className="stat-card-value" style={{ fontSize: k.val.length > 10 ? 16 : 22, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Section B: Grafik Kehadiran Harian */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 20px" }}>
          Grafik Kehadiran Harian — {bulan}
        </h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 200, padding: "8px 0" }}>
          {d.grafikHarian.map(h => {
            const hadirPct = Math.round((h.hadir / h.total) * 100);
            const tidakHadir = h.total - h.hadir;
            return (
              <div key={h.hari} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", flex: 1, width: "100%", justifyContent: "center" }}>
                  <div style={{ width: "40%", height: `${(h.hadir / 45) * 100}%`, background: "#059669", borderRadius: "4px 4px 0 0", transition: "height 0.4s ease", minHeight: 4 }} title={`Hadir: ${h.hadir}`} />
                  <div style={{ width: "40%", height: `${(tidakHadir / 45) * 100}%`, background: "#e2e8f0", borderRadius: "4px 4px 0 0", transition: "height 0.4s ease", minHeight: tidakHadir > 0 ? 4 : 0 }} title={`Tidak hadir: ${tidakHadir}`} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>{hadirPct}%</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>{h.hari}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 24, paddingTop: 14, borderTop: "1px solid var(--color-border-light)", marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#059669" }} /> Hadir
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#e2e8f0" }} /> Tidak Hadir (Alpha/Sakit/Izin)
          </div>
        </div>
      </div>

      {/* Section C: Rekap Kehadiran per Kelas */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Rekap Kehadiran per Kelas</h2>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{bulan}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["Kelas", "Program", "Guru", "Siswa", "Pertemuan", "Hadir", "Alpha", "Sakit", "Izin", "Status", "Detail"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.perKelas.map((c, i) => {
              const badge = badgeKehadiran(c.hadirPct);
              return (
                <tr key={i} style={{ borderBottom: i < d.perKelas.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{c.kelas}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{c.program}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{c.guru}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{c.siswa}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{c.pertemuan}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{c.hadirPct}%</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{c.alphaPct}%</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{c.sakit}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{c.izin}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{badge.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setDetailKelas(c.kelas)}>Lihat Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section D: Rekap Kehadiran per Siswa */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Rekap Kehadiran per Siswa</h2>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Cari nama / ID siswa..."
              value={searchSiswa}
              onChange={e => setSearchSiswa(e.target.value)}
              style={{ padding: "7px 14px 7px 32px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-full)", fontSize: 12.5, width: 220, background: "var(--color-bg)", outline: "none" }}
            />
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {["ID", "Nama Siswa", "Kelas", "Program", "Hadir", "Alpha", "Sakit", "Izin", "% Kehadiran", "Detail"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siswaFiltered.map((s, i) => {
              const hadirPct = Math.round((s.hadir / s.total) * 100);
              const badge = badgeKehadiran(hadirPct);
              return (
                <tr key={s.id} style={{ borderBottom: i < siswaFiltered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{s.id}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)" }}>{s.nama}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.kelas}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.program}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{s.hadir}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: s.alpha > 0 ? "#dc2626" : "var(--color-text-muted)" }}>{s.alpha}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.sakit}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{s.izin}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{badge.label}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setDetailSiswa(s.id)}>Lihat Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section E: Rekap Kehadiran per Guru */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <h2 className="card-title">Rekap Kehadiran per Guru</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, padding: 20 }}>
          {d.perGuru.map((g, i) => {
            const badge = badgeKehadiran(g.rataKehadiran);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "var(--color-bg)", borderRadius: 12, border: "1px solid var(--color-border-light)" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--color-primary)", color: "white", fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {g.nama[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{g.nama}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{g.program} · {g.sesi} sesi</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: "var(--radius-sm)" }}>{g.rataKehadiran}%</span>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>rata-rata siswa hadir</div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, marginLeft: 8 }} onClick={() => setDetailGuru(g.nama)}>Detail</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section F: Siswa Perlu Perhatian */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", marginBottom: 12 }}>
          Siswa Perlu Perhatian — Kehadiran &lt; 70%
        </h2>
        {d.alertSiswa.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--color-success)", fontWeight: 700 }}>Semua siswa memiliki kehadiran di atas 70%</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.alertSiswa.map((s, i) => (
              <div key={i} style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#dc2626", flexShrink: 0 }}>
                    {s.nama[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#991b1b" }}>{s.nama}</div>
                    <div style={{ fontSize: 12, color: "#dc2626", marginTop: 1 }}>{s.kelas} · {s.program}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Alpha {s.alphaBerturut}x berturut-turut</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>{s.kehadiran}%</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Kehadiran</div>
                  </div>
                  <div style={{ width: 80, height: 6, background: "#fee2e2", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#dc2626", width: `${s.kehadiran}%`, borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          MODAL: Detail Per Kelas
          ============================================================ */}
      {detailKelas && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setDetailKelas(null)}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>Detail Kehadiran {detailKelas}</h3>
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>Rekap per siswa dalam kelas ini — {bulan}</p>
              </div>
              <button onClick={() => setDetailKelas(null)} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--color-text-muted)" }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              {(() => {
                const info = d.perKelas.find(c => c.kelas === detailKelas);
                const siswa = detailKelasData[detailKelas] || [];
                if (!info) return null;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                      {[
                        { label: "Program", val: info.program, color: "#1d4ed8" },
                        { label: "Guru", val: info.guru, color: "#7c3aed" },
                        { label: "Total Siswa", val: `${info.siswa} orang`, color: "#059669" },
                      ].map(m => (
                        <div key={m.label} style={{ flex: 1, background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border-light)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: m.color, marginTop: 2 }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                          {["Nama Siswa", "Hadir", "Alpha", "Sakit", "Izin", "%", "Catatan"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {siswa.map((s, i) => {
                          const pct = Math.round((s.hadir / s.total) * 100);
                          const badge = badgeKehadiran(pct);
                          return (
                            <tr key={i} style={{ borderBottom: i < siswa.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                              <td style={{ padding: "11px 14px", fontWeight: 700, fontSize: 13 }}>{s.nama}</td>
                              <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#059669" }}>{s.hadir}</td>
                              <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: s.alpha > 0 ? "#dc2626" : "var(--color-text-muted)" }}>{s.alpha}</td>
                              <td style={{ padding: "11px 14px", fontSize: 13, color: s.sakit > 0 ? "#b45309" : "var(--color-text-muted)" }}>{s.sakit}</td>
                              <td style={{ padding: "11px 14px", fontSize: 13, color: s.izin > 0 ? "#1d4ed8" : "var(--color-text-muted)" }}>{s.izin}</td>
                              <td style={{ padding: "11px 14px" }}>
                                <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>{badge.label}</span>
                              </td>
                              <td style={{ padding: "11px 14px", fontSize: 11.5, color: s.catatan?.startsWith("⚠") ? "#dc2626" : "var(--color-text-muted)", fontWeight: s.catatan ? 600 : 400 }}>{s.catatan || "–"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: Detail Per Siswa
          ============================================================ */}
      {detailSiswa && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setDetailSiswa(null)}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", maxWidth: 520, width: "100%", maxHeight: "80vh", overflow: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {(() => {
                const siswa = d.perSiswa.find(s => s.id === detailSiswa);
                return (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>Riwayat Kehadiran {siswa?.nama || ""}</h3>
                    <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>{detailSiswa} · {siswa?.kelas} · {siswa?.program} — {bulan}</p>
                  </div>
                );
              })()}
              <button onClick={() => setDetailSiswa(null)} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--color-text-muted)" }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              {(() => {
                const riwayat = detailSiswaData[detailSiswa] || [];
                const siswa = d.perSiswa.find(s => s.id === detailSiswa);
                if (!siswa) return null;
                const hadirPct = Math.round((siswa.hadir / siswa.total) * 100);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                      {[
                        { label: "Hadir", val: siswa.hadir, color: "#059669" },
                        { label: "Alpha", val: siswa.alpha, color: "#dc2626" },
                        { label: "Sakit", val: siswa.sakit, color: "#b45309" },
                        { label: "Izin", val: siswa.izin, color: "#1d4ed8" },
                      ].map(s => (
                        <div key={s.label} style={{ background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", textAlign: "center", border: "1px solid var(--color-border-light)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{s.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "var(--color-bg)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Total Kehadiran: </span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: hadirPct >= 80 ? "#059669" : hadirPct >= 60 ? "#b45309" : "#dc2626" }}>{hadirPct}%</span>
                    </div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)", margin: 0 }}>Riwayat per Pertemuan</h4>
                    {riwayat.length === 0 ? (
                      <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>Belum ada data riwayat untuk siswa ini.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {riwayat.map((r, i) => {
                          const st = fmtStatus(r.status);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border-light)" }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: st.color, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{r.tanggal}</div>
                                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{r.hari}{r.catatan ? ` · ${r.catatan}` : ""}</div>
                              </div>
                              <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-sm)" }}>{r.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: Detail Per Guru
          ============================================================ */}
      {detailGuru && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setDetailGuru(null)}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>Detail Kehadiran {detailGuru}</h3>
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>Rekap per kelas yang diajar — {bulan}</p>
              </div>
              <button onClick={() => setDetailGuru(null)} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--color-text-muted)" }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              {(() => {
                const kelasList = detailGuruData[detailGuru] || [];
                const info = d.perGuru.find(g => g.nama === detailGuru);
                if (!info) return null;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                      {[
                        { label: "Program", val: info.program, color: "#1d4ed8" },
                        { label: "Total Sesi", val: `${info.sesi} sesi`, color: "#7c3aed" },
                        { label: "Rata-rata Kehadiran", val: `${info.rataKehadiran}%`, color: info.rataKehadiran >= 80 ? "#059669" : "#b45309" },
                      ].map(m => (
                        <div key={m.label} style={{ flex: 1, background: "var(--color-bg)", borderRadius: 10, padding: "10px 14px", border: "1px solid var(--color-border-light)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: m.color, marginTop: 2 }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                    {kelasList.map((k, i) => {
                      const badge = badgeKehadiran(k.rataHadir);
                      return (
                        <div key={i} style={{ background: "var(--color-bg)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--color-border-light)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)" }}>{k.kelas} — {k.program}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{k.siswa} siswa · {k.sesi} sesi</div>
                            </div>
                            <span style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: "var(--radius-sm)" }}>{k.rataHadir}%</span>
                          </div>
                          {k.siswaAlert.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {k.siswaAlert.map((a, j) => (
                                <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626" }}>
                                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                  <span>{a}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
