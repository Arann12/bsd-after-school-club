import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Profil Admin — BSD After School Club",
  description: "Pengaturan Akun & Profil Administrator BSD After School Club",
};

export default function AdminProfilePage() {
  return (
    <ProfileView
      role="admin"
      initialName="Siti Rahma, S.Kom"
      initialEmail="admin@bsdafterschool.com"
      initialPhone="0813-8899-7711"
      roleTitle="Staff Administrasi"
      roleBadgeColor="linear-gradient(135deg, #10b981, #059669)"
      initials="A"
      userId="ADM-BSD-001"
      branch="BSD City Utama"
      joinDate="10 Februari 2022"
      specialFields={[
        { label: "STATUS HAK AKSES", value: "Full Admin (Operational & Finance)" },
        { label: "DEPARTEMEN", value: "Operasional & Akademik" },
        { label: "SESI TERAKHIR AKTIF", value: "Hari ini, 08:30 WIB" },
      ]}
    />
  );
}
