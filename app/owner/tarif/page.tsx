import { redirect } from "next/navigation";

export default function OwnerTarifRedirectPage() {
  redirect("/owner/honor?tab=tarif");
}
