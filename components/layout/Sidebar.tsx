"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

/* ------------------------------------------------------------------ */
/* Icon Components (inline SVG, zero dependency)                       */
/* ------------------------------------------------------------------ */
export const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  ),
  GraduationCap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  BookOpen: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Door: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M10 10h.01" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ClipboardCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Invoice: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  DollarSign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  BarChart2: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  UserCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof Icons;
  locked?: boolean;
};
export type NavSection = { section: string; items: NavItem[] };

/* ------------------------------------------------------------------ */
/* Owner nav config                                                    */
/* ------------------------------------------------------------------ */
export const ownerNav: NavSection[] = [
  {
    section: "MAIN",
    items: [{ label: "Dashboard", href: "/owner/dashboard", icon: "Dashboard" }],
  },
  {
    section: "ACADEMIC",
    items: [
      { label: "Pendaftaran", href: "/owner/pendaftaran", icon: "UserPlus" },
      { label: "Siswa", href: "/owner/siswa", icon: "Users" },
      { label: "Program & Level", href: "/owner/program", icon: "BookOpen" },
      { label: "Kelas", href: "/owner/kelas", icon: "Door" },
      { label: "Jadwal", href: "/owner/jadwal", icon: "Calendar" },
      { label: "Absensi & Logbook", href: "/owner/absensi", icon: "ClipboardCheck" },
      { label: "Penilaian & Sertifikat", href: "/owner/penilaian", icon: "Award" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { label: "Tagihan & Kasir", href: "/owner/tagihan", icon: "Invoice" },
      { label: "Pembayaran", href: "/owner/pembayaran", icon: "CreditCard" },
      { label: "Honor Guru/Staff", href: "/owner/honor", icon: "DollarSign" },
    ],
  },
  {
    section: "OPERATIONAL",
    items: [
      { label: "Pengumuman", href: "/owner/pengumuman", icon: "Bell" },
    ],
  },
  {
    section: "LAPORAN",
    items: [
      { label: "Laporan Keuangan", href: "/owner/laporan/keuangan", icon: "BarChart2" },
      { label: "Laporan Kehadiran", href: "/owner/laporan/kehadiran", icon: "ClipboardCheck" },
      { label: "Inventaris & Laporan", href: "/owner/laporan/inventaris", icon: "Box" },
    ],
  },
  {
    section: "KELOLA AKUN",
    items: [
      { label: "Akun Admin", href: "/owner/kelola-akun/admin", icon: "ShieldCheck" },
      { label: "Guru & Staff", href: "/owner/guru", icon: "GraduationCap" },
      { label: "Orang Tua", href: "/owner/orang-tua", icon: "Users" },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { label: "Pengaturan Honor", href: "/owner/tarif", icon: "Settings" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Admin nav config                                                    */
/* ------------------------------------------------------------------ */
export const adminNav: NavSection[] = [
  {
    section: "MAIN",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "Dashboard" }],
  },
  {
    section: "ACADEMIC",
    items: [
      { label: "Pendaftaran", href: "/admin/pendaftaran", icon: "UserPlus" },
      { label: "Siswa", href: "/admin/students", icon: "Users" },
      { label: "Program & Level", href: "/admin/programs", icon: "BookOpen" },
      { label: "Kelas", href: "/admin/classes", icon: "Door" },
      { label: "Jadwal", href: "/admin/schedule", icon: "Calendar" },
      { label: "Absensi & Logbook", href: "/admin/absensi", icon: "ClipboardCheck" },
      { label: "Sertifikat Kelulusan", href: "/admin/sertifikat", icon: "Award" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { label: "Tagihan & Kasir", href: "/admin/tagihan", icon: "Invoice" },
      { label: "Pembayaran", href: "/admin/pembayaran", icon: "CreditCard" },
      { label: "Laporan", href: "/admin/laporan", icon: "BarChart2" },
    ],
  },
  {
    section: "OPERATIONAL",
    items: [
      { label: "Pengumuman", href: "/admin/pengumuman", icon: "Bell" },
    ],
  },
  {
    section: "KELOLA AKUN",
    items: [
      { label: "Guru & Staff", href: "/admin/guru", icon: "GraduationCap" },
      { label: "Orang Tua", href: "/admin/orang-tua", icon: "Users" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Orang Tua nav config                                                */
/* ------------------------------------------------------------------ */
export const orangTuaNav: NavSection[] = [
  {
    section: "",
    items: [
      { label: "Beranda", href: "/orang-tua/dashboard", icon: "Dashboard" },
      { label: "Anak Saya", href: "/orang-tua/anak", icon: "Users" },
      { label: "Jadwal", href: "/orang-tua/jadwal", icon: "Calendar" },
      { label: "Pembayaran", href: "/orang-tua/pembayaran", icon: "CreditCard" },
      { label: "Pengumuman", href: "/orang-tua/pengumuman", icon: "Bell" },
      { label: "Sertifikat Kelulusan", href: "/orang-tua/sertifikat", icon: "Award" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Guru nav config                                                     */
/* ------------------------------------------------------------------ */
export const guruNav: NavSection[] = [
  {
    section: "MAIN",
    items: [{ label: "Dashboard", href: "/guru/dashboard", icon: "Dashboard" }],
  },
  {
    section: "KELAS SAYA",
    items: [
      { label: "Jadwal Mengajar", href: "/guru/jadwal", icon: "Calendar" },
      { label: "Kelas & Absensi", href: "/guru/kelas", icon: "UserCheck" },
      { label: "Kalender & Logbook", href: "/guru/logbook", icon: "ClipboardCheck" },
      { label: "Pengumuman", href: "/guru/pengumuman", icon: "Bell" },
    ],
  },
  {
    section: "REKAP MENGAJAR",
    items: [
      { label: "Jam Mengajar Saya", href: "/guru/honor", icon: "Clock" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Reusable Sidebar Component                                          */
/* ------------------------------------------------------------------ */
interface SidebarProps {
  nav: NavSection[];
  roleName: string;
  brandName?: string;
}

function SidebarBase({
  nav,
  roleName,
  brandName = "BSD After School Club",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ padding: "16px 14px" }}>
        <Logo subtitle={roleName} size={36} />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {nav.map((section, si) => (
          <div key={si}>
            {section.section && (
              <div className="sidebar-section-label">{section.section}</div>
            )}
            {section.items.map((item) => {
              const IconComp = Icons[item.icon];
              const isActive =
                pathname === item.href ||
                (item.href !== "#" && pathname.startsWith(item.href + "/")) ||
                (item.href === "/orang-tua/dashboard" && pathname.includes("/orang_tua"));

              if (item.locked) {
                return (
                  <div
                    key={item.label}
                    className="sidebar-nav-item"
                    style={{
                      opacity: 0.45,
                      cursor: "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    title="Laporan terbuka setelah kelulusan siswa"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Icons.FileText />
                      <span>{item.label}</span>
                    </div>
                    <Icons.Lock />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`sidebar-nav-item${isActive ? " active" : ""}`}
                  onClick={() => document.querySelector(".sidebar")?.classList.remove("open")}
                >
                  <IconComp />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Role-specific exports                                               */
/* ------------------------------------------------------------------ */
export function OwnerSidebar() {
  return <SidebarBase nav={ownerNav} roleName="Owner Dashboard" />;
}

export function AdminSidebar() {
  return <SidebarBase nav={adminNav} roleName="Admin Dashboard" />;
}

export function GuruSidebar() {
  return <SidebarBase nav={guruNav} roleName="Panel Guru" />;
}

export function OrangTuaSidebar() {
  return (
    <SidebarBase
      nav={orangTuaNav}
      roleName="Panel Orang Tua"
    />
  );
}

// Default export remains owner sidebar for backward compatibility
export default function Sidebar() {
  return <OwnerSidebar />;
}
