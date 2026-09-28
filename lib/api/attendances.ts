/* ============================================================
   BSD After School Club — Student Attendances API
   ============================================================ */

import axiosInstance from "./axiosInstance";

// ── Raw types from backend ───────────────────────────────────

export interface AttendanceRaw {
  id: string;
  class_session_id: string;
  student_id: string;
  attendance_status: "present" | "absent" | "late" | "excused";
  notes?: string | null;
  recorded_at?: string;
  student?: {
    id: string;
    full_name: string;
    student_code: string;
  };
  class_session?: {
    id: string;
    session_number: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    classroom?: {
      id: string;
      name: string;
    };
    teacher?: {
      id: string;
      user?: {
        name: string;
      };
    };
    teacher_logbooks?: {
      material: string;
      notes?: string;
      check_in?: string;
      check_out?: string;
    }[];
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  sessionNumber: number;
  sessionDate: string;       // YYYY-MM-DD
  sessionDateDisplay: string; // "2 Sep 2026"
  startTime: string;          // "14:00"
  endTime: string;            // "15:00"
  status: "present" | "absent" | "late" | "excused";
  statusLabel: "Hadir" | "Alpha" | "Terlambat" | "Izin";
  notes: string | null;
  classroomId: string;
  classroomName: string;
  teacherName: string;
  material: string;
  teacherNotes: string;
}

// ── Map status ───────────────────────────────────────────────

const STATUS_LABEL: Record<string, "Hadir" | "Alpha" | "Terlambat" | "Izin"> = {
  present: "Hadir",
  absent:  "Alpha",
  late:    "Terlambat",
  excused: "Izin",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export function mapAttendance(raw: AttendanceRaw): AttendanceRecord {
  const session = raw.class_session;
  const dateStr = session?.session_date
    ? session.session_date.substring(0, 10)
    : "";
  const logbook = session?.teacher_logbooks?.[0];

  return {
    id: raw.id,
    studentId: raw.student_id,
    studentName: raw.student?.full_name ?? "-",
    sessionId: raw.class_session_id,
    sessionNumber: session?.session_number ?? 0,
    sessionDate: dateStr,
    sessionDateDisplay: dateStr ? formatDate(dateStr) : "-",
    startTime: session?.start_time ? session.start_time.substring(0, 5) : "--:--",
    endTime:   session?.end_time   ? session.end_time.substring(0, 5)   : "--:--",
    status: raw.attendance_status,
    statusLabel: STATUS_LABEL[raw.attendance_status] ?? "Alpha",
    notes: raw.notes ?? null,
    classroomId: session?.classroom?.id ?? "",
    classroomName: session?.classroom?.name ?? "-",
    teacherName: session?.teacher?.user?.name ?? "-",
    material: logbook?.material ?? "-",
    teacherNotes: logbook?.notes ?? "",
  };
}

// ── API Functions ─────────────────────────────────────────────

interface AttendanceParams {
  student_id?: string;
  class_session_id?: string;
  attendance_status?: string;
  per_page?: number;
  page?: number;
}

interface PaginatedRaw<T> {
  success: boolean;
  data: {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export async function getStudentAttendances(params: AttendanceParams = {}) {
  const res = await axiosInstance.get<PaginatedRaw<AttendanceRaw>>(
    "/student-attendances",
    { params: { per_page: 200, ...params } }
  );
  const page = res.data.data;
  return {
    data: page.data.map(mapAttendance),
    total: page.total,
    currentPage: page.current_page,
    lastPage: page.last_page,
  };
}
