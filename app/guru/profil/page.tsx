import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Profil Guru — BSD After School Club",
  description: "Pengaturan Akun & Profil Guru BSD After School Club",
};

export default function GuruProfilePage() {
  return (
    <ProfileView
      role="guru"
      roleTitle="Guru Pengajar"
      roleBadgeColor="linear-gradient(135deg, #1a5c8a, #3AABE3)"
      branch="BSD City Utama"
    />
  );
}
