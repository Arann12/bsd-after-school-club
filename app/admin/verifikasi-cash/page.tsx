"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminVerifikasiCashPage() {
  const router = useRouter();

  useEffect(() => {
    // Sesuai Poin 6 Catatan Meeting: Pembayaran cash tidak diajukan secara online oleh orang tua.
    // Seluruh pembayaran cash fisik dimasukkan langsung oleh Admin/Owner di menu Tagihan (+ Input Cash Manual).
    router.replace("/admin/tagihan");
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
      <p>Mengalihkan ke menu Tagihan & Kasir...</p>
    </div>
  );
}
