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
      initialName="Ahmad Dahlan, M.Pd."
      initialEmail="owner@bsdafterschool.com"
      initialPhone="0811-9988-7766"
      roleTitle="Owner & Founder"
      roleBadgeColor="linear-gradient(135deg, #1a5c8a, #2a7ab8)"
      initials="O"
      userId="OWN-BSD-001"
      branch="Pusat & Seluruh Cabang"
      joinDate="01 Januari 2020"
      specialFields={[
        { label: "STATUS KEPEMILIKAN", value: "Founder / Executive Owner" },
        { label: "OTORISASI KEUANGAN", value: "Full Authorization" },
        { label: "TOTAL CABANG", value: "3 Cabang Aktif" },
      ]}
    />
  );
}
