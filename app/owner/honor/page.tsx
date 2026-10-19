"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import {
  getPayrolls,
  generatePayroll,
  updatePayrollStatus,
  updatePayroll,
  type Payroll,
} from "@/lib/api/payrolls";
import { getTeachers, updateTeacher, type Teacher } from "@/lib/api/teachers";
import { getClassSessions, type ClassSession } from "@/lib/api/academic";
import { formatRupiah } from "@/lib/constants";

// Tarif standar default bimbel per jam (Rp 75.000 / jam)
const TARIF_STANDAR_PER_JAM = 75_000;

interface GuruHonorRow {
  teacher: Teacher;
  jumlahSesi: number;
  totalJam: number;
  tarifPerJam: number;
  isCustomRate: boolean;
  honorDasar: number;
  bonus: number;
  totalHonor: number;
  payroll: Payroll | null;
  status: "Belum Dibayar" | "Sudah Dibayar";
}

function hitungDurasiJam(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 1;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const diffMin = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMin <= 0) return 1;
  return Math.round((diffMin / 60) * 10) / 10;
}

function getPeriodeBulanIni() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    start: `${y}-${m}-01`,
    end: `${y}-${m}-${lastDay}`,
    namaBulan: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
}

export default function OwnerHonorPage() {
  const [activeTab, setActiveTab] = useState<"honor" | "tarif">("honor");

  const [rows, setRows] = useState<GuruHonorRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Standar Tarif Global
  const [tarifStandar, setTarifStandar] = useState<number>(TARIF_STANDAR_PER_JAM);

  // Filter
  const [cari, setCari] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");

  // Modal Slip Rincian
  const [slipTarget, setSlipTarget] = useState<GuruHonorRow | null>(null);

  // Modal Ubah Tarif
  const [tarifModalGuru, setTarifModalGuru] = useState<GuruHonorRow | null>(null);
  const [inputTarifBaru, setInputTarifBaru] = useState<number>(TARIF_STANDAR_PER_JAM);
  const [savingTarif, setSavingTarif] = useState<boolean>(false);

  // Modal Tambah Bonus
  const [showBonusInput, setShowBonusInput] = useState<boolean>(false);
  const [inputBonusNominal, setInputBonusNominal] = useState<number>(50_000);
  const [savingBonus, setSavingBonus] = useState<boolean>(false);

  // Status Action
  const [processingBayar, setProcessingBayar] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "danger" } | null>(null);

  const periode = useMemo(() => getPeriodeBulanIni(), []);

  const showToast = (msg: string, type: "success" | "danger" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cek jika diarahkan dari shortcut ?tab=tarif
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "tarif") {
        setActiveTab("tarif");
      }
    }
  }, []);

  // Muat Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [teachersRes, payrollsRes, sessionsRes] = await Promise.all([
        getTeachers({ per_page: 200 }),
        getPayrolls(),
        getClassSessions({ per_page: 500 }),
      ]);

      const teachers = teachersRes.data;
      const payrolls = payrollsRes;
      const sessions = sessionsRes;

      const mapped: GuruHonorRow[] = teachers.map((guru) => {
        // Sesi yang sudah selesai atau memiliki logbook guru
        const guruSessions = sessions.filter(
          (s) =>
            s.teacherId === guru.id &&
            !s.isHoliday &&
            (s.status === "completed" || s.teacherLogbook != null)
        );

        let totalJam = 0;
        guruSessions.forEach((s) => {
          if (s.teacherLogbook?.teaching_minutes) {
            totalJam += Math.round((Number(s.teacherLogbook.teaching_minutes) / 60) * 10) / 10;
          } else {
            totalJam += hitungDurasiJam(s.startTime, s.endTime);
          }
        });
        totalJam = Math.round(totalJam * 10) / 10;

        const isCustomRate = guru.hourlyRate > 0;
        const tarifPerJam = isCustomRate ? guru.hourlyRate : tarifStandar;

        const honorDasar = Math.round(totalJam * tarifPerJam);

        const guruPayrolls = payrolls.filter((p) => p.teacherId === guru.id);
        const latestPayroll = guruPayrolls.length > 0
          ? guruPayrolls.sort((a, b) => b.periodStart.localeCompare(a.periodStart))[0]
          : null;

        const bonus = latestPayroll?.bonusAmount ?? 0;
        const totalHonor = honorDasar + bonus;
        const status = latestPayroll?.status === "paid" ? "Sudah Dibayar" : "Belum Dibayar";

        return {
          teacher: guru,
          jumlahSesi: guruSessions.length,
          totalJam,
          tarifPerJam,
          isCustomRate,
          honorDasar,
          bonus,
          totalHonor,
          payroll: latestPayroll,
          status,
        };
      });

      setRows(mapped);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data honor guru. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  }, [tarifStandar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Baris
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = cari.toLowerCase();
      const matchSearch =
        r.teacher.name.toLowerCase().includes(q) ||
        r.teacher.teacherCode.toLowerCase().includes(q);

      if (activeTab === "honor") {
        if (filterStatus === "Belum Dibayar" && r.status !== "Belum Dibayar") return false;
        if (filterStatus === "Sudah Dibayar" && r.status !== "Sudah Dibayar") return false;
      }

      return matchSearch;
    });
  }, [rows, cari, filterStatus, activeTab]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const totalHonor = rows.reduce((acc, r) => acc + r.totalHonor, 0);
    const sudahDibayar = rows.filter((r) => r.status === "Sudah Dibayar").reduce((acc, r) => acc + r.totalHonor, 0);
    const belumDibayar = totalHonor - sudahDibayar;
    const totalJam = rows.reduce((acc, r) => acc + r.totalJam, 0);
    const guruAktif = rows.filter((r) => r.jumlahSesi > 0).length;

    return {
      totalHonor,
      sudahDibayar,
      belumDibayar,
      totalJam: Math.round(totalJam * 10) / 10,
      guruAktif,
    };
  }, [rows]);

  // Buka Modal Atur Tarif Guru
  const handleOpenTarifModal = (row: GuruHonorRow) => {
    setTarifModalGuru(row);
    setInputTarifBaru(row.tarifPerJam);
  };

  // Simpan Tarif Guru
  const handleSaveTarifGuru = async () => {
    if (!tarifModalGuru) return;
    setSavingTarif(true);
    try {
      await updateTeacher(tarifModalGuru.teacher.id, {
        hourly_rate: inputTarifBaru,
      });
      showToast(`Tarif ${tarifModalGuru.teacher.name} diubah menjadi ${formatRupiah(inputTarifBaru)} / jam.`);
      setTarifModalGuru(null);
      fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Gagal menyimpan tarif guru.", "danger");
    } finally {
      setSavingTarif(false);
    }
  };

  // Reset Guru ke Tarif Standar
  const handleResetTarifGuru = async () => {
    if (!tarifModalGuru) return;
    setSavingTarif(true);
    try {
      await updateTeacher(tarifModalGuru.teacher.id, {
        hourly_rate: 0,
      });
      showToast(`Tarif ${tarifModalGuru.teacher.name} direset ke standar (${formatRupiah(tarifStandar)} / jam).`);
      setTarifModalGuru(null);
      fetchData();
    } catch {
      showToast("Gagal mereset tarif guru.", "danger");
    } finally {
      setSavingTarif(false);
    }
  };

  // Tandai Sudah Ditransfer (Cairkan Honor)
  const handleTandaiSudahTransfer = async (row: GuruHonorRow) => {
    setProcessingBayar(true);
    try {
      let payrollId = row.payroll?.id;

      // Jika belum ada payroll terbuat di database, buat terlebih dahulu otomatis
      if (!payrollId) {
        const generated = await generatePayroll({
          teacher_id: row.teacher.id,
          period_start: periode.start,
          period_end: periode.end,
        });
        payrollId = generated.id;
      }

      await updatePayrollStatus(payrollId, "paid");
      showToast(`Honor ${row.teacher.name} berhasil ditandai Lunas / Sudah Ditransfer.`);
      setSlipTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui status pembayaran honor.", "danger");
    } finally {
      setProcessingBayar(false);
    }
  };

  // Simpan Bonus Guru
  const handleSaveBonus = async () => {
    if (!slipTarget) return;
    setSavingBonus(true);
    try {
      let payrollId = slipTarget.payroll?.id;

      if (!payrollId) {
        const generated = await generatePayroll({
          teacher_id: slipTarget.teacher.id,
          period_start: periode.start,
          period_end: periode.end,
        });
        payrollId = generated.id;
      }

      const totalBonusBaru = (slipTarget.bonus || 0) + inputBonusNominal;
      await updatePayroll(payrollId, { bonus_amount: totalBonusBaru });
      showToast(`Bonus ${formatRupiah(inputBonusNominal)} berhasil ditambahkan.`);
      setShowBonusInput(false);
      setSlipTarget(null);
      fetchData();
    } catch {
      showToast("Gagal menambahkan bonus.", "danger");
    } finally {
      setSavingBonus(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1160, margin: "0 auto", width: "100%" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === "success" ? "#065f46" : "#991b1b",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER UTAMA */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Honor &amp; Tarif Guru</h1>
          <p className="page-subtitle">
            Rekap pembayaran honor mengajar periode <strong>{periode.namaBulan}</strong> dan pengaturan tarif per jam.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => window.print()} style={{ fontSize: 13 }}>
            Cetak Rekap
          </button>
          <button className="btn btn-primary" onClick={fetchData} disabled={loading} style={{ fontSize: 13 }}>
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#991b1b", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 4 KARTU METRIK UTAMA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Total Honor Bulan Ini</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: "#1d4ed8", fontWeight: 800 }}>
            {loading ? "..." : formatRupiah(stats.totalHonor)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            {stats.guruAktif} guru mengajar bulan ini
          </div>
        </div>

        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Sudah Ditransfer</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: "#059669", fontWeight: 800 }}>
            {loading ? "..." : formatRupiah(stats.sudahDibayar)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Honor yang telah dicairkan
          </div>
        </div>

        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Menunggu Pembayaran</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: "#b45309", fontWeight: 800 }}>
            {loading ? "..." : formatRupiah(stats.belumDibayar)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Belum ditransfer ke guru
          </div>
        </div>

        <div className="stat-card" style={{ padding: "14px 18px" }}>
          <span className="stat-card-label" style={{ fontSize: 11.5, fontWeight: 700 }}>Total Jam Mengajar</span>
          <div className="stat-card-value" style={{ fontSize: 22, color: "#7c3aed", fontWeight: 800 }}>
            {loading ? "..." : `${stats.totalJam} Jam`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Berdasarkan logbook kelas
          </div>
        </div>
      </div>

      {/* DUA TAB JELAS & RINGKAS */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border-light)", paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab("honor")}
          className={`btn ${activeTab === "honor" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Rekap Honor Bulan Ini ({rows.length})
        </button>
        <button
          onClick={() => setActiveTab("tarif")}
          className={`btn ${activeTab === "tarif" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}
        >
          Master Tarif Guru ({rows.length})
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div
        className="card"
        style={{
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 240, alignItems: "center" }}>
          <input
            type="text"
            placeholder={activeTab === "honor" ? "Cari nama atau kode guru..." : "Cari guru untuk atur tarif..."}
            className="form-input"
            style={{ padding: "6px 12px", fontSize: 13, minWidth: 240 }}
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />

          {activeTab === "honor" && (
            <select
              className="form-input"
              style={{ width: "auto", minWidth: 150, padding: "6px 10px", fontSize: 13 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Sudah Dibayar">Sudah Dibayar</option>
            </select>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          Menampilkan <strong>{filteredRows.length}</strong> guru
        </div>
      </div>

      {/* TAB 1: REKAP HONOR BULAN INI */}
      {activeTab === "honor" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            <div className="card" style={{ padding: 24 }}>
              <SkeletonTable rows={5} cols={7} />
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                    <tr>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", width: 44, textAlign: "center" }}>
                        No
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Guru
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Sesi
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Total Jam
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                        Tarif / Jam
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                        Honor Mengajar
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                        Bonus
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                        Total Diterima
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>
                          Tidak ada data honor yang sesuai pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r, idx) => {
                        const isPaid = r.status === "Sudah Dibayar";

                        return (
                          <tr
                            key={r.teacher.id}
                            style={{
                              borderBottom: idx < filteredRows.length - 1 ? "1px solid var(--color-border-light)" : "none",
                              background: "#fff",
                            }}
                          >
                            <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 12 }}>
                              {idx + 1}
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{r.teacher.name}</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                                {r.teacher.teacherCode}
                              </div>
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: r.jumlahSesi > 0 ? "#eff6ff" : "#f1f5f9", color: r.jumlahSesi > 0 ? "#1d4ed8" : "#94a3b8" }}>
                                {r.jumlahSesi} sesi
                              </span>
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                              {r.totalJam} Jam
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              <div style={{ fontWeight: 700, color: r.isCustomRate ? "#15803d" : "var(--color-text-secondary)" }}>
                                {formatRupiah(r.tarifPerJam)}
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                {r.isCustomRate ? "Khusus" : "Standar"}
                              </div>
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>
                              {formatRupiah(r.honorDasar)}
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "right", color: r.bonus > 0 ? "#059669" : "var(--color-text-muted)", fontWeight: r.bonus > 0 ? 700 : 400 }}>
                              {r.bonus > 0 ? `+${formatRupiah(r.bonus)}` : "–"}
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#1d4ed8", fontSize: 14 }}>
                              {formatRupiah(r.totalHonor)}
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  background: isPaid ? "#dcfce7" : "#fef3c7",
                                  color: isPaid ? "#166534" : "#92400e",
                                }}
                              >
                                {r.status}
                              </span>
                            </td>

                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: 11.5, padding: "4px 10px" }}
                                  onClick={() => setSlipTarget(r)}
                                >
                                  Lihat Slip
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: 11.5, padding: "4px 8px", color: "var(--color-text-secondary)" }}
                                  onClick={() => handleOpenTarifModal(r)}
                                >
                                  Tarif
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredRows.length > 0 && (
                    <tfoot style={{ background: "#f8fafc", borderTop: "2px solid var(--color-border-light)" }}>
                      <tr>
                        <td colSpan={2} style={{ padding: "12px 14px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                          Total ({filteredRows.length} Guru)
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                          {filteredRows.reduce((a, b) => a + b.jumlahSesi, 0)} sesi
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                          {Math.round(filteredRows.reduce((a, b) => a + b.totalJam, 0) * 10) / 10} Jam
                        </td>
                        <td style={{ padding: "12px 14px" }} />
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>
                          {formatRupiah(filteredRows.reduce((a, b) => a + b.honorDasar, 0))}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#059669" }}>
                          {formatRupiah(filteredRows.reduce((a, b) => a + b.bonus, 0))}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#1d4ed8", fontSize: 14 }}>
                          {formatRupiah(filteredRows.reduce((a, b) => a + b.totalHonor, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER TARIF GURU */}
      {activeTab === "tarif" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Card Pengaturan Tarif Standar Global */}
          <div
            className="card"
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              background: "#fff",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Tarif Standar Bimbel (Default)
              </div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                Diterapkan otomatis untuk guru baru atau guru yang belum memiliki tarif khusus.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Rp</span>
              <input
                type="number"
                className="form-input"
                style={{ width: 140, padding: "6px 10px", fontSize: 13, fontWeight: 700 }}
                value={tarifStandar}
                step={5000}
                min={10000}
                onChange={(e) => setTarifStandar(Number(e.target.value) || TARIF_STANDAR_PER_JAM)}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>/ Jam</span>
            </div>
          </div>

          {/* Tabel Master Tarif */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
                  <tr>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", width: 44, textAlign: "center" }}>
                      No
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      Nama Guru
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                      Kontak
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>
                      Tarif per Jam
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Tipe Tarif
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Jam Bulan Ini
                    </th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "center" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr
                      key={r.teacher.id}
                      style={{
                        borderBottom: idx < filteredRows.length - 1 ? "1px solid var(--color-border-light)" : "none",
                      }}
                    >
                      <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 12 }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{r.teacher.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                          {r.teacher.teacherCode}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", fontSize: 12 }}>
                        <div>{r.teacher.phone || "–"}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{r.teacher.email || "–"}</div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
                        {formatRupiah(r.tarifPerJam)}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: r.isCustomRate ? "#dcfce7" : "#f1f5f9",
                            color: r.isCustomRate ? "#166534" : "#64748b",
                          }}
                        >
                          {r.isCustomRate ? "Tarif Khusus" : "Standar"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 12.5 }}>
                        {r.totalJam > 0 ? (
                          <strong>{r.totalJam} Jam</strong>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)" }}>0 Jam</span>
                        )}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11.5, padding: "4px 12px" }}
                          onClick={() => handleOpenTarifModal(r)}
                        >
                          Ubah Tarif
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SLIP HONOR GURU */}
      <Modal
        open={!!slipTarget}
        onClose={() => setSlipTarget(null)}
        title="Slip Honor Mengajar Guru"
        maxWidth={480}
      >
        {slipTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Header Slip */}
            <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)" }}>
                {slipTarget.teacher.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
                Kode: <strong>{slipTarget.teacher.teacherCode}</strong> • Periode: <strong>{periode.namaBulan}</strong>
              </div>
            </div>

            {/* Rincian Komponen */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Total Sesi Selesai</span>
                <strong>{slipTarget.jumlahSesi} Sesi</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Total Jam Mengajar</span>
                <strong>{slipTarget.totalJam} Jam</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Tarif per Jam</span>
                <strong>{formatRupiah(slipTarget.tarifPerJam)} / jam</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Honor Mengajar ({slipTarget.totalJam} Jam × {formatRupiah(slipTarget.tarifPerJam)})</span>
                <strong>{formatRupiah(slipTarget.honorDasar)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Bonus Tambahan</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "1px 6px", height: "auto" }}
                    onClick={() => setShowBonusInput(true)}
                  >
                    + Tambah
                  </button>
                </div>
                <strong style={{ color: slipTarget.bonus > 0 ? "#059669" : "inherit" }}>
                  {slipTarget.bonus > 0 ? `+${formatRupiah(slipTarget.bonus)}` : "Rp 0"}
                </strong>
              </div>

              {/* Input Bonus Inline */}
              {showBonusInput && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 12px", borderRadius: 6, display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                    placeholder="Nominal bonus..."
                    value={inputBonusNominal}
                    onChange={(e) => setInputBonusNominal(Number(e.target.value) || 0)}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    disabled={savingBonus}
                    onClick={handleSaveBonus}
                  >
                    {savingBonus ? "..." : "Simpan"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                    onClick={() => setShowBonusInput(false)}
                  >
                    Batal
                  </button>
                </div>
              )}

              {/* Total Diterima */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, marginTop: 4 }}>
                <span style={{ fontWeight: 800, color: "#1d4ed8", fontSize: 14 }}>TOTAL DITERIMA</span>
                <strong style={{ color: "#1d4ed8", fontSize: 17 }}>{formatRupiah(slipTarget.totalHonor)}</strong>
              </div>
            </div>

            {/* Rekening Bank */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px", fontSize: 12.5 }}>
              <div style={{ fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 4 }}>Rekening Tujuan Transfer:</div>
              {slipTarget.teacher.bankName ? (
                <div>
                  <strong>{slipTarget.teacher.bankName}</strong> — {slipTarget.teacher.bankAccountNumber}
                  <div style={{ color: "var(--color-text-muted)" }}>a.n. {slipTarget.teacher.bankAccountName || slipTarget.teacher.name}</div>
                </div>
              ) : (
                <div style={{ color: "var(--color-text-muted)" }}>Rekening bank belum diisi di profil guru.</div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSlipTarget(null)}>
                Tutup
              </button>
              {slipTarget.status === "Belum Dibayar" ? (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1.5, background: "#059669" }}
                  disabled={processingBayar}
                  onClick={() => handleTandaiSudahTransfer(slipTarget)}
                >
                  {processingBayar ? "Memproses..." : "Tandai Sudah Ditransfer"}
                </button>
              ) : (
                <div style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", background: "#dcfce7", color: "#166534", borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
                  Sudah Ditransfer
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: UBAH TARIF GURU */}
      <Modal
        open={!!tarifModalGuru}
        onClose={() => setTarifModalGuru(null)}
        title={`Atur Tarif: ${tarifModalGuru?.teacher.name || "Guru"}`}
        maxWidth={440}
      >
        {tarifModalGuru && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 6, fontSize: 12.5 }}>
              Guru: <strong>{tarifModalGuru.teacher.name}</strong> ({tarifModalGuru.teacher.teacherCode})
              <div style={{ marginTop: 2, color: "var(--color-text-muted)" }}>
                Status: {tarifModalGuru.isCustomRate ? "Memiliki Tarif Khusus" : `Menggunakan Tarif Standar (${formatRupiah(tarifStandar)}/jam)`}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Tarif per Jam (Rp)</label>
              <input
                type="number"
                className="form-input"
                step={5000}
                min={10000}
                value={inputTarifBaru}
                onChange={(e) => setInputTarifBaru(Number(e.target.value) || 0)}
              />
              <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 4 }}>
                Honor dihitung dari: Jam Mengajar × Tarif per Jam.
              </span>
            </div>

            {/* Simulasi */}
            {tarifModalGuru.totalJam > 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: "#166534" }}>Estimasi Honor Bulan Ini:</div>
                <div style={{ marginTop: 2 }}>
                  {tarifModalGuru.totalJam} Jam × {formatRupiah(inputTarifBaru)} ={" "}
                  <strong>{formatRupiah(Math.round(tarifModalGuru.totalJam * inputTarifBaru))}</strong>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, fontSize: 12 }}
                disabled={savingTarif}
                onClick={handleResetTarifGuru}
              >
                Pakai Standar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1.2, fontSize: 12 }}
                disabled={savingTarif}
                onClick={handleSaveTarifGuru}
              >
                {savingTarif ? "Menyimpan..." : "Simpan Tarif"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
