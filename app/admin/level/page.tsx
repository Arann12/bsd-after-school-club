"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { getPrograms, addProgramLevel, updateProgramLevel, deleteProgramLevel, Program, ProgramLevel } from "@/lib/api/academic";
import { SkeletonCard } from "@/components/ui/Skeleton";

export interface LevelItemDisplay {
  id: string;
  programId: string;
  programName: string;
  levelName: string;
  levelCode: string;
  order: number;
  isActive: boolean;
}

export default function AdminLevelPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<LevelItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelItemDisplay | null>(null);

  const [formData, setFormData] = useState({
    programId: "",
    name: "",
    level_order: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  const fetchProgramLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPrograms({ per_page: 100 });
      const programList = res.data || [];
      setPrograms(programList);

      const allLevels: LevelItemDisplay[] = [];
      programList.forEach((p) => {
        (p.levels || []).forEach((lvl) => {
          allLevels.push({
            id: lvl.id,
            programId: p.id,
            programName: p.name,
            levelName: lvl.name,
            levelCode: lvl.levelCode || `LVL-${lvl.levelOrder}`,
            order: lvl.levelOrder || 1,
            isActive: lvl.isActive ?? true,
          });
        });
      });

      setLevels(allLevels);
      if (programList.length > 0 && !formData.programId) {
        setFormData((prev) => ({ ...prev, programId: programList[0].id }));
      }
    } catch (err) {
      console.warn("Gagal memuat level program:", err);
    } finally {
      setLoading(false);
    }
  }, [formData.programId]);

  useEffect(() => {
    fetchProgramLevels();
  }, [fetchProgramLevels]);

  const programNames = ["Semua", ...programs.map((p) => p.name)];

  const handleOpenAdd = (progId?: string) => {
    setEditingLevel(null);
    setFormData({
      programId: progId || (programs[0]?.id || ""),
      name: "",
      level_order: (levels.filter((l) => l.programId === (progId || programs[0]?.id)).length + 1),
    });
    setShowModal(true);
  };

  const handleOpenEdit = (lvl: LevelItemDisplay) => {
    setEditingLevel(lvl);
    setFormData({
      programId: lvl.programId,
      name: lvl.levelName,
      level_order: lvl.order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programId) return;
    setSubmitting(true);

    try {
      if (editingLevel) {
        await updateProgramLevel(editingLevel.programId, editingLevel.id, {
          name: formData.name,
          level_order: formData.level_order,
        });
        setNotifToast("Level program berhasil diperbarui!");
      } else {
        await addProgramLevel(formData.programId, {
          name: formData.name,
          level_order: formData.level_order,
        });
        setNotifToast("Level baru berhasil ditambahkan!");
      }

      setTimeout(() => setNotifToast(null), 3500);
      setShowModal(false);
      await fetchProgramLevels();
    } catch (err) {
      console.error("Gagal simpan level:", err);
      alert("Gagal menyimpan tingkatan level.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lvl: LevelItemDisplay) => {
    if (!confirm(`Hapus tingkatan ${lvl.levelName}?`)) return;
    try {
      await deleteProgramLevel(lvl.programId, lvl.id);
      setNotifToast(`Tingkatan ${lvl.levelName} berhasil dihapus.`);
      setTimeout(() => setNotifToast(null), 3500);
      await fetchProgramLevels();
    } catch (err) {
      console.error("Gagal hapus level:", err);
      alert("Gagal menghapus level.");
    }
  };

  const filteredPrograms = programs.filter(
    (p) => selectedProgramFilter === "Semua" || p.name === selectedProgramFilter
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Level & Tingkatan Program</h1>
          <p className="page-subtitle">
            Kelola tingkatan kesulitan (level) untuk setiap program kursus (Calistung, English, Phonics, Math, dll).
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => handleOpenAdd()}>
          + Tambah Level Baru
        </button>
      </div>

      {/* Notification Toast Inline */}
      {notifToast && (
        <div style={{ background: "#d1fae5", border: "1.5px solid #6ee7b7", borderRadius: 12, padding: "12px 18px", color: "#047857", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {notifToast}
        </div>
      )}

      {/* Program Filter Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {programNames.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedProgramFilter(p)}
            className={`filter-chip${selectedProgramFilter === p ? " active" : ""}`}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              border: "1.5px solid",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: selectedProgramFilter === p ? "var(--color-primary)" : "white",
              color: selectedProgramFilter === p ? "white" : "var(--color-text-secondary)",
              borderColor: selectedProgramFilter === p ? "var(--color-primary)" : "var(--color-border)",
            }}
          >
            {p === "Semua" ? "Semua Program" : `Program ${p}`}
          </button>
        ))}
      </div>

      {/* Grouped View by Program */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
          Belum ada program kursus yang terdaftar.
        </div>
      ) : (
        filteredPrograms.map((prog) => {
          const progLevels = levels.filter((l) => l.programId === prog.id);

          return (
            <div key={prog.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    Program {prog.name}
                  </h2>
                  <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                    Total {progLevels.length} Tingkatan Level
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => handleOpenAdd(prog.id)}>
                  + Tambah Level di {prog.name}
                </button>
              </div>

              {progLevels.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13, background: "var(--color-bg)", borderRadius: 8 }}>
                  Belum ada tingkatan level untuk program ini.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                  {progLevels.map((lvl) => (
                    <div
                      key={lvl.id}
                      style={{
                        background: "var(--color-bg)",
                        borderRadius: 12,
                        padding: "16px 18px",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 800 }}>
                            {lvl.levelCode}
                          </span>
                          <span style={{ background: "#d1fae5", color: "#059669", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                            Urutan: {lvl.order}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary)", margin: "8px 0 4px" }}>
                          {lvl.levelName}
                        </h3>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--color-border-light)", paddingTop: 10 }}>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => handleOpenEdit(lvl)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" style={{ fontSize: 12 }} onClick={() => handleDelete(lvl)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal Add/Edit Level */}
      {showModal && (
        <Modal open onClose={() => setShowModal(false)} title={editingLevel ? "Edit Tingkatan Level" : "Tambah Level Baru"} maxWidth={480}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Program Kursus</label>
              <select
                className="select-control"
                required
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                disabled={!!editingLevel}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Nama Level / Tingkatan</label>
              <input
                type="text"
                required
                className="input-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Level 1 (Mengenal Huruf & Angka)"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>Urutan Tingkat (Level Order)</label>
              <input
                type="number"
                min={1}
                required
                className="input-control"
                value={formData.level_order}
                onChange={(e) => setFormData({ ...formData, level_order: Number(e.target.value) })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Menyimpan..." : editingLevel ? "Simpan Perubahan" : "Tambah Level"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
