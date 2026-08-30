import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Profil Orang Tua — BSD After School Club",
  description: "Pengaturan Akun & Profil Orang Tua BSD After School Club",
};

export default function OrangTuaProfilePage() {
  return (
    <ProfileView
      role="orang-tua"
      initialName="Bpk. Hendra Gunawan"
      initialEmail="hendra.gunawan@gmail.com"
      initialPhone="0812-9988-1122"
      roleTitle="Wali / Orang Tua Murid"
      roleBadgeColor="linear-gradient(135deg, #f59e0b, #d97706)"
      initials="H"
      userId="PRT-2023-044"
      branch="BSD City Utama"
      joinDate="20 Agustus 2023"
      specialFields={[
        { label: "ANAK TERDAFTAR", value: "Budi (Phonics L2) & Annisa (Calistung L1)" },
        { label: "STATUS PEMBAYARAN", value: "Semua Tagihan Lunas" },
        { label: "NO. DARURAT", value: "0812-9988-1123 (Ibu Rina)" },
      ]}
    />
  );
}
