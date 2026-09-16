"use client";

import { useState } from "react";
import {
  login, logout, getMe,
  getStudents, createStudent, updateStudent, deleteStudent,
  getTeachers, createTeacher,
  getClasses, createClass,
  getClassSessions, submitAttendance,
  getPrograms, createProgram,
  getPayrolls, generatePayroll,
} from "@/lib/api";
import type { AxiosError } from "axios";

/* ============================================================
   Halaman Test API Lengkap (GET + POST + PUT + DELETE)
   Akses di: http://localhost:3000/test-api
   ============================================================ */

type TestStatus = "idle" | "loading" | "success" | "error";

interface TestResult {
  status: TestStatus;
  response?: unknown;
  error?: string;
  duration?: number;
}

// ── Warna & ikon status ──────────────────────────────────────
const COLOR: Record<TestStatus, string> = {
  idle: "#475569", loading: "#f59e0b", success: "#22c55e", error: "#ef4444",
};
const ICON: Record<TestStatus, string> = {
  idle: "○", loading: "⟳", success: "✓", error: "✗",
};

// ── Grup test ────────────────────────────────────────────────
const GROUPS = [
  {
    title: "🔐 Auth",
    color: "#818cf8",
    tests: [
      { key: "auth_login",  label: "POST /auth/login",  method: "POST" },
      { key: "auth_me",     label: "GET  /auth/me",     method: "GET"  },
      { key: "auth_logout", label: "POST /auth/logout", method: "POST" },
    ],
  },
  {
    title: "👨‍🎓 Siswa",
    color: "#34d399",
    tests: [
      { key: "students_get",    label: "GET    /students",    method: "GET"    },
      { key: "students_post",   label: "POST   /students",    method: "POST"   },
      { key: "students_put",    label: "PUT    /students/:id", method: "PUT"   },
      { key: "students_delete", label: "DELETE /students/:id", method: "DELETE"},
    ],
  },
  {
    title: "👩‍🏫 Guru",
    color: "#fb923c",
    tests: [
      { key: "teachers_get",  label: "GET  /teachers", method: "GET"  },
      { key: "teachers_post", label: "POST /teachers", method: "POST" },
    ],
  },
  {
    title: "🏫 Kelas & Sesi",
    color: "#f472b6",
    tests: [
      { key: "classrooms_get",  label: "GET  /classrooms",   method: "GET"  },
      { key: "classrooms_post", label: "POST /classrooms",   method: "POST" },
      { key: "sessions_get",    label: "GET  /class-sessions", method: "GET" },
      { key: "sessions_attend", label: "POST /class-sessions/:id/submit-attendance", method: "POST" },
    ],
  },
  {
    title: "📚 Program",
    color: "#38bdf8",
    tests: [
      { key: "programs_get",  label: "GET  /programs", method: "GET"  },
      { key: "programs_post", label: "POST /programs", method: "POST" },
    ],
  },
  {
    title: "💰 Honor Guru",
    color: "#facc15",
    tests: [
      { key: "payrolls_get",      label: "GET  /teacher-payrolls",          method: "GET"  },
      { key: "payrolls_generate", label: "POST /teacher-payrolls/generate", method: "POST" },
    ],
  },
];

export default function TestApiPage() {
  const [email, setEmail]       = useState("owner@bsd.test");
  const [password, setPassword] = useState("password");
  const [results, setResults]   = useState<Record<string, TestResult>>({});
  // IDs dari data yang berhasil dibuat (untuk PUT/DELETE)
  const [createdStudentId, setCreatedStudentId] = useState<string>("");
  const [firstSessionId,   setFirstSessionId]   = useState<string>("");
  const [firstTeacherId,   setFirstTeacherId]   = useState<string>("");

  const set = (key: string, r: Partial<TestResult>) =>
    setResults((p) => {
      const prev = p[key] ?? { status: "idle" };
      return { ...p, [key]: { ...prev, ...r } };
    });

  const runTest = async (key: string) => {
    set(key, { status: "loading" });
    const t0 = Date.now();
    const ok  = (response: unknown) => set(key, { status: "success", response, duration: Date.now() - t0 });
    const err = (e: unknown) => {
      const ae = e as AxiosError<{ message?: string; errors?: unknown }>;
      const msg = ae.response
        ? `${ae.response.status} — ${JSON.stringify(ae.response.data)}`
        : (e as Error).message;
      set(key, { status: "error", error: msg, duration: Date.now() - t0 });
    };

    try {
      switch (key) {
        // ── Auth ────────────────────────────────────────────
        case "auth_login": {
          const res = await login({ email, password });
          ok(res);
          break;
        }
        case "auth_me": {
          const res = await getMe();
          ok(res);
          break;
        }
        case "auth_logout": {
          await logout();
          ok({ message: "Logout berhasil" });
          break;
        }

        // ── Students ────────────────────────────────────────
        case "students_get": {
          const res = await getStudents({ per_page: 3 } as Parameters<typeof getStudents>[0]);
          // Simpan ID pertama untuk PUT/DELETE
          const firstId = (res as { data?: { id?: string }[] }).data?.[0]?.id ?? "";
          if (firstId) setCreatedStudentId(firstId);
          ok(res);
          break;
        }
        case "students_post": {
          // Field sesuai StudentController::store()
          // required: full_name | optional: birth_date, school_name, school_grade, address, status
          const res = await createStudent({
            full_name:    "Test Siswa " + Date.now(),
            school_name:  "SD Test",
            school_grade: "6",
            status:       "Trial",
          } as any);
          const newId = (res as { id?: string }).id ?? "";
          if (newId) setCreatedStudentId(newId);
          ok(res);
          break;
        }
        case "students_put": {
          if (!createdStudentId) throw new Error("Jalankan GET atau POST siswa dulu untuk mendapatkan ID");
          // Field sesuai StudentController::update() — semua 'sometimes'
          const res = await updateStudent(createdStudentId, {
            school_grade: "5",
            status:       "Aktif",
          } as any);
          ok(res);
          break;
        }
        case "students_delete": {
          if (!createdStudentId) throw new Error("Jalankan POST siswa dulu untuk mendapatkan ID");
          await deleteStudent(createdStudentId);
          setCreatedStudentId("");
          ok({ message: `Siswa ${createdStudentId} berhasil dihapus` });
          break;
        }

        // ── Teachers ────────────────────────────────────────
        case "teachers_get": {
          const res = await getTeachers();
          const firstId = (res as { data?: { id?: string }[] }).data?.[0]?.id ?? "";
          if (firstId) setFirstTeacherId(firstId);
          ok(res);
          break;
        }
        case "teachers_post": {
          // Field sesuai TeacherController::store()
          // required: name, email, password | optional: phone, bank_name, bank_account_name, bank_account_number
          const ts = Date.now();
          const res = await createTeacher({
            name:     "Guru Test " + ts,
            email:    `guru.test.${ts}@bsd.test`,
            password: "password123",
            phone:    "08109999999",
          } as any);
          const newTeacherId = (res as { id?: string }).id ?? "";
          if (newTeacherId) setFirstTeacherId(newTeacherId);
          ok(res);
          break;
        }

        // ── Classrooms ──────────────────────────────────────
        case "classrooms_get": {
          const res = await getClasses();
          ok(res);
          break;
        }
        case "classrooms_post": {
          // Field sesuai ClassroomController::store()
          // required: program_level_id (UUID), name | optional: capacity
          // ⚠️ Butuh program_level_id yang valid dari DB
          // Ambil dulu dari GET /programs lalu cek level-nya
          const programsRes = await getPrograms();
          const firstLevel = (programsRes as unknown as { data?: { levels?: { id?: string }[] }[] })
            .data?.[0]?.levels?.[0]?.id ?? "";
          if (!firstLevel) throw new Error("Tidak ada program_level_id tersedia. Buat program & level dulu.");
          const res = await createClass({
            program_level_id: firstLevel,
            name:             "Kelas Test " + Date.now(),
            capacity:         15,
          } as any);
          ok(res);
          break;
        }

        // ── Class Sessions ──────────────────────────────────
        case "sessions_get": {
          const res = await getClassSessions({ per_page: 3 } as Parameters<typeof getClassSessions>[0]);
          const firstId = (res as { data?: { id?: string }[] }).data?.[0]?.id ?? "";
          if (firstId) setFirstSessionId(firstId);
          ok(res);
          break;
        }
        case "sessions_attend": {
          if (!firstSessionId) throw new Error("Jalankan GET class-sessions dulu untuk mendapatkan ID sesi");

          // Auto-fetch student ID jika belum ada (dari GET /students)
          let studentId = createdStudentId;
          if (!studentId) {
            const studentsRes = await getStudents({ per_page: 1 } as Parameters<typeof getStudents>[0]);
            studentId = (studentsRes as { data?: { id?: string }[] }).data?.[0]?.id ?? "";
            if (studentId) setCreatedStudentId(studentId);
          }
          if (!studentId) throw new Error("Tidak ada siswa di DB. Jalankan POST /students dulu.");

          const now = new Date();
          const toMySql = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
          const checkIn  = toMySql(new Date(now.getTime() - 60 * 60 * 1000));
          const checkOut = toMySql(now);
          await submitAttendance(firstSessionId, {
            students: [{ student_id: studentId, attendance_status: "present", notes: "Test dari test-api" }],
            logbook: {
              check_in:         checkIn,
              check_out:        checkOut,
              teaching_minutes: 60,
              material:         "Materi Test via test-api",
              notes:            "Catatan logbook test",
            },
          });
          ok({ message: `Absensi & logbook sesi ${firstSessionId} berhasil disubmit` });
          break;
        }

        // ── Programs ────────────────────────────────────────
        case "programs_get": {
          const res = await getPrograms();
          ok(res);
          break;
        }
        case "programs_post": {
          // Field sesuai ProgramController::store()
          // required: name | optional: description
          const res = await createProgram({
            name:        "Program Test " + Date.now(),
            description: "Deskripsi program test dari halaman test-api",
          } as Parameters<typeof createProgram>[0]);
          ok(res);
          break;
        }

        // ── Payrolls ────────────────────────────────────────
        case "payrolls_get": {
          const res = await getPayrolls();
          ok(res);
          break;
        }
        case "payrolls_generate": {
          if (!firstTeacherId) throw new Error("Jalankan GET teachers dulu untuk mendapatkan ID guru");
          // Field sesuai TeacherPayrollController::generatePayroll()
          // required: teacher_id (uuid), period_start (date), period_end (date >= period_start)
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, "0");
          const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
          const res = await generatePayroll({
            teacher_id:   firstTeacherId,
            period_start: `${y}-${m}-01`,
            period_end:   `${y}-${m}-${lastDay}`,
          });
          ok(res);
          break;
        }

        default:
          throw new Error(`Test "${key}" tidak dikenal`);
      }
    } catch (e) {
      err(e);
    }
  };

  const runGroup = async (keys: string[]) => {
    for (const k of keys) await runTest(k);
  };

  const runAll = async () => {
    const allKeys = GROUPS.flatMap((g) => g.tests.map((t) => t.key));
    for (const k of allKeys) await runTest(k);
  };

  const methodColor: Record<string, string> = {
    GET: "#38bdf8", POST: "#4ade80", PUT: "#fb923c", DELETE: "#f87171",
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "960px", margin: "0 auto", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
      <h1 style={{ color: "#38bdf8", margin: "0 0 0.25rem", fontSize: "1.5rem" }}>🔌 API Test — BSD After School Club</h1>
      <p style={{ color: "#64748b", margin: "0 0 1.5rem", fontSize: "0.8rem" }}>
        Base URL: <code style={{ color: "#38bdf8" }}>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}</code>
      </p>

      {/* Credentials */}
      <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", color: "#64748b", marginBottom: "4px" }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: "#0f172a", border: "1px solid #334155", borderRadius: "4px", color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.85rem" }} />
        </div>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", color: "#64748b", marginBottom: "4px" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: "#0f172a", border: "1px solid #334155", borderRadius: "4px", color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.85rem" }} />
        </div>
        <button onClick={runAll}
          style={{ padding: "6px 20px", background: "#0ea5e9", border: "none", borderRadius: "6px", color: "#fff", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
          ▶ Run All
        </button>
      </div>

      {/* Context state */}
      {(createdStudentId || firstSessionId || firstTeacherId) && (
        <div style={{ background: "#1e293b", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.75rem", color: "#94a3b8" }}>
          📌 <strong>Context tersimpan</strong>&nbsp;—&nbsp;
          {createdStudentId && <>Student ID: <code style={{ color: "#4ade80" }}>{createdStudentId}</code>&nbsp;&nbsp;</>}
          {firstSessionId && <>Session ID: <code style={{ color: "#f472b6" }}>{firstSessionId}</code>&nbsp;&nbsp;</>}
          {firstTeacherId && <>Teacher ID: <code style={{ color: "#fb923c" }}>{firstTeacherId}</code></>}
        </div>
      )}

      {/* Groups */}
      {GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: "1.5rem" }}>
          {/* Group header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.95rem", color: group.color }}>{group.title}</h2>
            <button onClick={() => runGroup(group.tests.map((t) => t.key))}
              style={{ padding: "2px 12px", background: "#1e293b", border: `1px solid ${group.color}44`, borderRadius: "4px", color: group.color, cursor: "pointer", fontSize: "0.75rem" }}>
              Run Group
            </button>
          </div>

          {/* Tests */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {group.tests.map((t) => {
              const r = results[t.key];
              const st: TestStatus = r?.status ?? "idle";
              return (
                <div key={t.key} style={{ background: "#1e293b", borderRadius: "6px", border: `1px solid ${COLOR[st]}22`, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem" }}>
                    <span style={{ color: COLOR[st], width: "1rem", textAlign: "center" }}>{ICON[st]}</span>
                    <span style={{ background: methodColor[t.method] + "22", color: methodColor[t.method], padding: "1px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", minWidth: "52px", textAlign: "center" }}>
                      {t.method}
                    </span>
                    <span style={{ flex: 1, fontSize: "0.85rem" }}>{t.label}</span>
                    {r?.duration && <span style={{ fontSize: "0.7rem", color: "#475569" }}>{r.duration}ms</span>}
                    <button onClick={() => runTest(t.key)} disabled={st === "loading"}
                      style={{ padding: "2px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "4px", color: "#e2e8f0", cursor: st === "loading" ? "default" : "pointer", fontSize: "0.75rem" }}>
                      {st === "loading" ? "..." : "Run"}
                    </button>
                  </div>

                  {r && (st === "success" || st === "error") && (
                    <div style={{ borderTop: "1px solid #0f172a", padding: "0.6rem 1rem", background: "#060d1a" }}>
                      {r.error
                        ? <p style={{ margin: 0, color: "#ef4444", fontSize: "0.8rem" }}>❌ {r.error}</p>
                        : <pre style={{ margin: 0, color: "#4ade80", fontSize: "0.72rem", overflow: "auto", maxHeight: "180px" }}>
                            {JSON.stringify(r.response, null, 2)}
                          </pre>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p style={{ color: "#334155", fontSize: "0.7rem", textAlign: "center", marginTop: "2rem" }}>
        ⚠️ Halaman ini hanya untuk development — hapus sebelum production
      </p>
    </div>
  );
}
