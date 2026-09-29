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
      roleTitle="Wali / Orang Tua Murid"
      roleBadgeColor="linear-gradient(135deg, #f59e0b, #d97706)"
      branch="BSD City Utama"
    />
  );
}
