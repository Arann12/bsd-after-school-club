"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getInventory } from "@/lib/api/operational";
import { formatRupiah } from "@/lib/constants";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function OwnerLaporanInventarisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventory({ per_page: 200 });
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setItems(raw);
    } catch (err) {
      console.warn("Gagal memuat data inventaris:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryReport();
  }, [fetchInventoryReport]);

  const totalUnits = items.reduce((acc, i) => acc + Number(i.quantity || 1), 0);
  const goodUnits = items
    .filter((i) => {
      const cond = (i.condition || "").toLowerCase();
      return cond === "baik" || cond === "good";
    })
    .reduce((acc, i) => acc + Number(i.quantity || 1), 0);
  const repairUnits = items
    .filter((i) => {
      const cond = (i.condition || "").toLowerCase();
      return cond !== "baik" && cond !== "good";
    })
    .reduce((acc, i) => acc + Number(i.quantity || 1), 0);
  const totalAssetValue = items.reduce(
    (acc, i) => acc + Number(i.purchase_price || 0) * Number(i.quantity || 1),
    0
  );

  const goodPercent = totalUnits > 0 ? Math.round((goodUnits / totalUnits) * 100) : 0;
  const repairPercent = totalUnits > 0 ? Math.round((repairUnits / totalUnits) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Inventaris &amp; Aset (Owner)</h1>
          <p className="page-subtitle">
            Laporan kondisi fasilitas, alat peraga, dan aset BSD After School Club langsung dari database.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => window.print()}>
            Cetak PDF Laporan
          </button>
          <Link href="/owner/inventaris" className="btn btn-accent">
            Ke Daftar Inventaris &rarr;
          </Link>
        </div>
      </div>

      {/* Grid Stats Summary */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Nilai Aset Terdata", value: formatRupiah(totalAssetValue), color: "#1d4ed8" },
            { label: "Total Item Barang", value: `${totalUnits} Unit`, color: "#0f172a" },
            { label: "Barang Kondisi Baik", value: `${goodUnits} Unit (${goodPercent}%)`, color: "#059669" },
            { label: "Perlu Perbaikan / Rusak", value: `${repairUnits} Unit (${repairPercent}%)`, color: "#b45309" },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ gap: 8 }}>
              <span className="stat-card-label">{s.label}</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabel Rekap Inventaris */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
            Rincian Aset &amp; Fasilitas Pembelajaran
          </h3>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Total {items.length} item terdata
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : items.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada data barang inventaris yang tersimpan.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {["Kode", "Nama Barang", "Kategori", "Jumlah", "Kondisi", "Lokasi", "Harga Satuan", "Total Nilai"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const qty = Number(row.quantity || 1);
                  const price = Number(row.purchase_price || 0);
                  const subtotal = qty * price;
                  const cond = (row.condition || "").toLowerCase();
                  const isGood = cond === "baik" || cond === "good";

                  return (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: idx < items.length - 1 ? "1px solid var(--color-border-light)" : "none",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
                        {row.inventory_code || "-"}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>
                        {row.name || "-"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {row.category || "-"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700 }}>
                        {qty} Unit
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: isGood ? "#d1fae5" : "#fef3c7",
                            color: isGood ? "#059669" : "#b45309",
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          {row.condition || "Baik"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12.5, color: "var(--color-text-muted)" }}>
                        {row.location || "-"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {formatRupiah(price)}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1d4ed8", fontSize: 13 }}>
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
