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
      roleTitle="Staff Administrasi"
      roleBadgeColor="linear-gradient(135deg, #10b981, #059669)"
      branch="BSD City Utama"
    />
  );
}
