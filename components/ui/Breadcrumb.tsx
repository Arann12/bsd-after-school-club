"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  "owner": "Owner",
  "admin": "Admin",
  "guru": "Guru",
  "orang-tua": "Orang Tua",
  "dashboard": "Dashboard",
  "siswa": "Siswa",
  "guru-page": "Guru & Staff",
  "orang-tua-page": "Orang Tua",
  "pendaftaran": "Pendaftaran",
  "program": "Program",
  "level": "Level",
  "kelas": "Kelas",
  "jadwal": "Jadwal",
  "absensi": "Absensi & Logbook",
  "penilaian": "Penilaian",
  "sertifikat": "Sertifikat",
  "tagihan": "Tagihan & Kasir",
  "pembayaran": "Pembayaran",
  "verifikasi-cash": "Tagihan & Kasir",
  "honor": "Honor Guru",
  "inventaris": "Inventaris",
  "pengumuman": "Pengumuman",
  "laporan": "Laporan",
  "keuangan": "Keuangan",
  "kehadiran": "Kehadiran",
  "kelola-akun": "Kelola Akun",
  "admin-page": "Admin",
  "guru-akun": "Guru",
  "orang-tua-akun": "Orang Tua",
  "tarif": "Pengaturan Honor",
  "profil": "Profil",
  "anak": "Anak Saya",
  "kegiatan": "Kegiatan",
  "progress": "Progress",
  "logbook": "Logbook",
  "students": "Siswa",
  "classes": "Kelas",
  "schedule": "Jadwal",
  "programs": "Program",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 4, flexWrap: "wrap" }}>
      <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Beranda</Link>
      {crumbs.map((c, i) => (
        <span key={c.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--color-border)" }}>/</span>
          {c.isLast ? (
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{c.label}</span>
          ) : (
            <Link href={c.href} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
