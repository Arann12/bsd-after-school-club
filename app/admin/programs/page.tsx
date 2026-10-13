"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { 
  getPrograms, createProgram, updateProgram, deleteProgram,
  addProgramLevel, updateProgramLevel, deleteProgramLevel,
  type Program, type ProgramLevel
} from "@/lib/api/academic";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Program Form State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState({ name: "", description: "" });
  const [savingProgram, setSavingProgram] = useState(false);

  // Level Management State
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  
  // Level Form State (inside Level Management Modal)
  const [editingLevel, setEditingLevel] = useState<ProgramLevel | null>(null);
  const [levelForm, setLevelForm] = useState({ name: "", level_order: 1 });
  const [savingLevel, setSavingLevel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPrograms({ per_page: 50 });
      setPrograms(res.data);
      
      // Update active program if it's currently open
      if (activeProgram) {
        const updatedActive = res.data.find(p => p.id === activeProgram.id);
        if (updatedActive) setActiveProgram(updatedActive);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data program.");
    } finally {
      setLoading(false);
    }
  }, [activeProgram]);

  useEffect(() => {
    fetchData();
  }, []); // Only fetch on mount, fetchData handles activeProgram internally via refs/deps

  // --- PROGRAM HANDLERS ---
  const handleOpenProgramModal = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({ name: program.name, description: program.description || "" });
    } else {
      setEditingProgram(null);
      setProgramForm({ name: "", description: "" });
    }
    setShowProgramModal(true);
  };

  const handleSaveProgram = async () => {
    if (!programForm.name) return alert("Nama Program wajib diisi!");
    setSavingProgram(true);
    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, programForm);
      } else {
        await createProgram(programForm);
      }
      setShowProgramModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan program: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan program ini?")) return;
    try {
      await deleteProgram(id);
      fetchData();
    } catch (err: any) {
      alert("Gagal menonaktifkan program.");
    }
  };

  // --- LEVEL HANDLERS ---
  const handleManageLevels = (program: Program) => {
    setActiveProgram(program);
    setEditingLevel(null);
    setLevelForm({ name: "", level_order: program.levels.length + 1 });
    setShowLevelModal(true);
  };

  const handleEditLevel = (level: ProgramLevel) => {
    setEditingLevel(level);
    setLevelForm({ name: level.name, level_order: level.levelOrder });
  };

  const handleCancelEditLevel = () => {
    setEditingLevel(null);
    setLevelForm({ name: "", level_order: activeProgram ? activeProgram.levels.length + 1 : 1 });
  };

  const handleSaveLevel = async () => {
    if (!activeProgram) return;
    if (!levelForm.name) return alert("Nama Level wajib diisi!");
    setSavingLevel(true);
    try {
      if (editingLevel) {
        await updateProgramLevel(activeProgram.id, editingLevel.id, levelForm);
      } else {
        await addProgramLevel(activeProgram.id, levelForm);
      }
      handleCancelEditLevel();
      fetchData(); // Will refresh activeProgram as well
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan level: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!activeProgram) return;
    if (!confirm("Yakin ingin menghapus/menonaktifkan level ini?")) return;
    try {
      await deleteProgramLevel(activeProgram.id, levelId);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus level.");
    }
  };

  if (loading && programs.length === 0) return <div style={{ padding: 24 }}>Memuat data program...</div>;
  if (error) return <div style={{ padding: 24, color: "var(--color-danger)" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Program & Level</h1>
          <p className="page-subtitle">Kelola program pembelajaran dan tingkatan levelnya.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => handleOpenProgramModal()}>+ Tambah Program</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border-light)" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Kode Program</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Nama Program</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Deskripsi</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Total Level</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>Tidak ada data program.</td></tr>
              ) : (
                programs.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < programs.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{p.programCode}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--color-text-primary)" }}>{p.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>{p.description || "-"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                        {p.levels.length} Level
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleManageLevels(p)}>Kelola Level</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenProgramModal(p)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDeleteProgram(p.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PROGRAM */}
      <Modal open={showProgramModal} onClose={() => setShowProgramModal(false)} title={editingProgram ? "Edit Program" : "Tambah Program Baru"} maxWidth={400}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Program *</label>
            <input className="form-input" value={programForm.name} onChange={e => setProgramForm({ ...programForm, name: e.target.value })} placeholder="Cth: Matematika" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} value={programForm.description} onChange={e => setProgramForm({ ...programForm, description: e.target.value })} placeholder="Opsional..." />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowProgramModal(false)} disabled={savingProgram}>Batal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProgram} disabled={savingProgram}>{savingProgram ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL KELOLA LEVEL */}
      <Modal open={showLevelModal} onClose={() => setShowLevelModal(false)} title={`Kelola Level: ${activeProgram?.name}`} maxWidth={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Daftar Level yang Ada */}
          <div style={{ border: "1px solid var(--color-border-light)", borderRadius: 8, overflow: "hidden" }}>
            {activeProgram?.levels.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>Belum ada level di program ini.</div>
            ) : (
              activeProgram?.levels.map((lvl, i) => (
                <div key={lvl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < activeProgram.levels.length - 1 ? "1px solid var(--color-border-light)" : "none", background: editingLevel?.id === lvl.id ? "#f8fafc" : "#fff", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>{lvl.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Urutan: {lvl.levelOrder} • Kode: {lvl.levelCode}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditLevel(lvl)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleDeleteLevel(lvl.id)}>Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Tambah/Edit Level */}
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px dashed var(--color-border)" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--color-text-primary)" }}>
              {editingLevel ? "Edit Level" : "Tambah Level Baru"}
            </h4>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div className="form-group" style={{ marginBottom: 0, flex: "2 1 180px" }}>
                <label className="form-label" style={{ fontSize: 12 }}>Nama Level</label>
                <input className="form-input" value={levelForm.name} onChange={e => setLevelForm({ ...levelForm, name: e.target.value })} placeholder="Cth: Level 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: "1 1 100px" }}>
                <label className="form-label" style={{ fontSize: 12 }}>Urutan</label>
                <input type="number" className="form-input" value={levelForm.level_order} onChange={e => setLevelForm({ ...levelForm, level_order: parseInt(e.target.value) || 1 })} min={1} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-sm" onClick={handleSaveLevel} disabled={savingLevel}>
                {savingLevel ? "Menyimpan..." : (editingLevel ? "Update Level" : "Tambah Level")}
              </button>
              {editingLevel && (
                <button className="btn btn-ghost btn-sm" onClick={handleCancelEditLevel} disabled={savingLevel}>Batal Edit</button>
              )}
            </div>
          </div>
          
        </div>
      </Modal>

    </div>
  );
}
