"use client";
import Link from "next/link";
import { students, programs } from "@/lib/data";
import { STUDENT_STATUS_COLOR, PAYMENT_STATUS_COLOR } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useCountUp, useLoadingState } from "@/lib/hooks";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { useState } from "react";

export default function OwnerSiswaPage() {
  const loading = useLoadingState(400);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterProgram, setFilterProgram] = useState("Semua");

  const active = students.filter(s => s.status === "Aktif").length;
  const lunas = students.filter(s => s.tagihan === "Lunas").length;
  const belumBayar = students.filter(s => s.tagihan === "Belum Bayar" || s.tagihan === "Overdue").length;

  const countTotal = useCountUp(students.length);
  const countActive = useCountUp(active);
  const countLunas = useCountUp(lunas);
  const countBelumBayar = useCountUp(belumBayar);

  const filtered = students.filter(s => {
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    const matchProgram = filterProgram === "Semua" || s.program === filterProgram;
    return matchStatus && matchProgram;
  });

  const columns: Column<typeof students[0]>[] = [
    { key: "id", label: "ID", searchable: true, render: r => <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--color-text-muted)" }}>{r.id}</span> },
    { key: "name", label: "Nama Siswa", searchable: true, flex: 2, render: r => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-primary-bg)", color: "var(--color-primary)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{r.name[0]}</div>
        <div>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--color-text-primary)", display: "block" }}>{r.name}</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{r.pertemuan} Sesi</span>
        </div>
      </div>
    )},
    { key: "parent", label: "Orang Tua", searchable: true },
    { key: "program", label: "Program", searchable: true, render: r => <span style={{ fontWeight: 700 }}>{r.program}</span> },
    { key: "level", label: "Level", render: r => <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 12 }}>{r.level}</span> },
    { key: "kelas", label: "Kelas", render: r => <StatusBadge status={r.kelas} /> },
    { key: "guru", label: "Guru", searchable: true },
    { key: "status", label: "Status", render: r => <StatusBadge status={r.status} variant="student" /> },
    { key: "tagihan", label: "Tagihan", render: r => <StatusBadge status={r.tagihan} variant="payment" /> },
  ];

  if (loading) return <SkeletonTable rows={8} cols={7} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Data Siswa"
        subtitle="Ringkasan data siswa aktif di semua program."
        actions={
          <>
            <Link href="/owner/pendaftaran" className="btn btn-accent">+ Pendaftaran Baru</Link>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label="Total Siswa" value={countTotal} color="#1d4ed8" bg="var(--color-info-bg)" />
        <StatCard label="Siswa Aktif" value={countActive} detail={`${Math.round(active/students.length*100)}% dari total`} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Lunas SPP" value={countLunas} color="#059669" bg="var(--color-success-bg)" />
        <StatCard label="Belum Bayar" value={countBelumBayar} detail="Perlu follow up" color="var(--color-danger)" bg="var(--color-danger-bg)" />
      </div>

      {/* Program Distribution */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 14px" }}>Distribusi Siswa per Program</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {programs.filter(p => p.status === "Aktif").map(p => {
            const count = students.filter(s => s.program === p.name).length;
            return (
              <div key={p.id} style={{ padding: "12px 14px", background: "var(--color-bg)", borderRadius: 10, border: "1px solid var(--color-border)", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-primary)" }}>{count}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={r => r.id}
        searchPlaceholder="Cari nama siswa, ortu, guru, atau ID..."
        filters={[
          { label: "Status", values: ["Semua", "Trial", "Aktif", "On Leave", "Nonaktif", "Graduated"] },
          { label: "Program", values: ["Semua", ...new Set(students.map(s => s.program))] },
        ]}
        filterValues={{ Status: filterStatus, Program: filterProgram }}
        onFilterChange={(key, val) => {
          if (key === "Status") setFilterStatus(val);
          if (key === "Program") setFilterProgram(val);
        }}
      />
    </div>
  );
}
