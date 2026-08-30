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
      initialName="Ibu Sarah Amanda, S.Pd."
      initialEmail="sarah@bsdafterschool.com"
      initialPhone="0812-7766-5544"
      roleTitle="Guru Pengajar Utama"
      roleBadgeColor="linear-gradient(135deg, #1a5c8a, #3AABE3)"
      initials="S"
      userId="TCH-2023-018"
      branch="BSD City Utama"
      joinDate="15 Juli 2023"
      specialFields={[
        { label: "MATA PELAJARAN DIAMPUS", value: "Phonics & Calistung Dasar" },
        { label: "TOTAL KELAS AKTIF", value: "3 Kelas (42 Siswa)" },
        { label: "TOTAL JAM MENGAJAR", value: "14 Jam / Minggu" },
      ]}
    />
  );
}
