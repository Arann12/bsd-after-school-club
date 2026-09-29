import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Profil Owner — BSD After School Club",
  description: "Pengaturan Akun & Profil Owner BSD After School Club",
};

export default function OwnerProfilePage() {
  return (
    <ProfileView
      role="owner"
      roleTitle="Owner & Founder"
      roleBadgeColor="linear-gradient(135deg, #1a5c8a, #2a7ab8)"
      branch="Pusat & Seluruh Cabang"
    />
  );
}
