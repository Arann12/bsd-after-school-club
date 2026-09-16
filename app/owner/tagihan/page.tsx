"use client";
import { useState } from "react";
import { invoices, revenueSummary } from "@/lib/data";
import { PAYMENT_STATUS_COLOR, formatRupiah } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function OwnerTagihanPage() {
  const loading = useLoadingState(400);
  const [selected, setSelected] = useState<typeof invoices[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const getStatus = (inv: typeof invoices[0]) => confirmed.includes(inv.id) ? "Lunas" : inv.status;

  const lunas = invoices.filter(i => i.status === "Lunas" || confirmed.includes(i.id)).length;
  const overdue = invoices.filter(i => i.status === "Overdue" && !confirmed.includes(i.id)).length;
  const pending = invoices.filter(i => i.status === "Menunggu Konfirmasi" && !confirmed.includes(i.id)).length;
  const totalTagihan = invoices.reduce((sum, i) => sum + i.jumlah, 0);
  const totalLunas = invoices.filter(i => i.status === "Lunas" || confirmed.includes(i.id)).reduce((sum, i) => sum + i.jumlah, 0);

  const countLunas = useCountUp(lunas);
  const countOverdue = useCountUp(overdue);
  const countPending = useCountUp(pending);

  const columns: Column<typeof invoices[0]>[] = [
    { key: "id", label: "ID Invoice", searchable: true, render: r => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{r.id}</span> },
    { key: "siswa", label: "Siswa", searchable: true, flex: 2 },
    { key: "program", label: "Program", searchable: true },
    { key: "pertemuan", label: "Pertemuan" },
    { key: "jumlah", label: "Jumlah", render: r => <span style={{ fontWeight: 700 }}>{formatRupiah(r.jumlah)}</span> },
    { key: "metode", label: "Metode" },
    { key: "tanggal", label: "Tanggal" },
    { key: "status", label: "Status", render: r => <StatusBadge status={getStatus(r)} variant="payment" /> },
    { key: "jalur", label: "Jalur", hideOnMobile: true },
    { key: "id", label: "", render: r => (
      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>Detail</button>
    )},
  ];

  if (loading) return <SkeletonTable rows={6} cols={7} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && (
        <div style={{ background: "var(--color-success-bg)", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}

      <PageHeader title="Tagihan" subtitle="Overview tagihan dan status pembayaran siswa." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Total Tagihan" value={formatRupiah(totalTagihan)} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Sudah Lunas" value={countLunas} detail={`${formatRupiah(totalLunas)}`} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Overdue" value={countOverdue} detail="Perlu follow up" color="var(--color-danger)" bg="var(--color-danger-bg)" />
        <StatCard label="Menunggu Konfirmasi" value={countPending} detail="Cash dari Orang Tua" color="#b45309" bg="var(--color-warning-bg)" />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        rowKey={r => r.id}
        searchPlaceholder="Cari siswa, invoice, atau program..."
        filters={[{ label: "Status", values: ["Semua", "Lunas", "Menunggu Konfirmasi", "Partially Paid", "Belum Bayar", "Overdue"] }]}
        onRowClick={r => setSelected(r)}
      />

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Tagihan — ${selected?.siswa || ""}`} maxWidth={480}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ k: "ID Invoice", v: selected.id }, { k: "Siswa", v: selected.siswa }, { k: "Program", v: selected.program }, { k: "Pertemuan", v: selected.pertemuan }, { k: "Jumlah", v: formatRupiah(selected.jumlah) }, { k: "Metode", v: selected.metode }, { k: "Tanggal", v: selected.tanggal }, { k: "Status", v: getStatus(selected) }].map(row => (
              <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{row.k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{row.v}</span>
              </div>
            ))}
            {selected.status === "Menunggu Konfirmasi" && !confirmed.includes(selected.id) && (
              <button className="btn btn-accent" onClick={() => {
                setConfirmed(prev => [...prev, selected.id]);
                setToast(`Tagihan ${selected.id} berhasil dikonfirmasi!`);
                setSelected(null);
              }}>Konfirmasi Pembayaran</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
