"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerVerifikasiCashPage() {
  const router = useRouter();

  useEffect(() => {
    // Sesuai Poin 6 Catatan Meeting: Pembayaran cash fisik dimasukkan langsung oleh Admin/Owner di menu Tagihan (+ Input Cash Manual).
    router.replace("/owner/tagihan");
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
      <p>Mengalihkan ke menu Tagihan & Kasir...</p>
    </div>
  );
}
