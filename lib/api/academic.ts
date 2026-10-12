import axiosInstance from "./axiosInstance";
import type { PaginatedResponse, ApiResponse } from "./types";
import { mapTeacher, type Teacher, type TeacherRaw } from "./teachers";

// ============================================================================
// Types
// ============================================================================

export interface ProgramLevelRaw {
  id: string;
  program_id: string;
  level_code: string;
  name: string;
  level_order: number;
  is_active: boolean;
  classrooms?: ClassroomRaw[];
}

export interface ProgramRaw {
  id: string;
  program_code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  levels?: ProgramLevelRaw[];
}

export interface ClassroomRaw {
  id: string;
  program_level_id: string;
  class_code: string;
  name: string;
  capacity: number;
  status: string;
  active_students_count?: number;
  program_level?: ProgramLevelRaw;
  teachers?: ClassTeacherRaw[];
  enrollments?: {
    id: string;
    student_id: string;
    status: string;
    student?: { id: string; full_name: string };
  }[];
}

export interface ClassTeacherRaw {
  id: string;
  classroom_id: string;
  teacher_id: string;
  effective_from: string;
  effective_until: string | null;
  role: "primary" | "assistant";
  teacher?: Teacher;
  user?: { name: string; full_name?: string };
}

// Frontend mapped types
export interface ProgramLevel {
  id: string;
  programId: string;
  levelCode: string;
  name: string;
  levelOrder: number;
  isActive: boolean;
  classrooms?: Classroom[];
}

export interface Program {
  id: string;
  programCode: string;
  name: string;
  description: string | null;
  isActive: boolean;
  levels: ProgramLevel[];
}

export interface Classroom {
  id: string;
  programLevelId: string;
  classCode: string;
  name: string;
  capacity: number;
  status: string;
  activeStudentsCount: number;
  programLevel?: ProgramLevel;
  teachers: ClassTeacher[];
  students: { id: string; name: string }[];
}

export interface ClassTeacher {
  id: string;
  classroomId: string;
  teacherId: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  role: "primary" | "assistant";
  teacher?: Teacher;
  name: string; // resolved name
}

export interface ClassScheduleRaw {
  id: string;
  classroom_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
  classroom?: ClassroomRaw;
  teacher?: TeacherRaw | Teacher;
}

export interface ClassSchedule {
  id: string;
  classroomId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  isActive: boolean;
  classroom?: Classroom;
  teacher?: Teacher;
}

export interface ClassSessionRaw {
  id: string;
  classroom_id: string;
  teacher_id: string;
  class_schedule_id: string | null;
  session_number: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  is_rescheduled: boolean;
  is_holiday: boolean;
  classroom?: ClassroomRaw;
  teacher?: TeacherRaw | Teacher;
  class_schedule?: ClassScheduleRaw;
  teacher_logbook?: any;
  student_attendances?: any[];
}

export interface ClassSession {
  id: string;
  classroomId: string;
  teacherId: string;
  classScheduleId: string | null;
  sessionNumber: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  isRescheduled: boolean;
  isHoliday: boolean;
  classroom?: Classroom;
  teacher?: Teacher;
  classSchedule?: ClassSchedule;
  teacherLogbook?: any;
  studentAttendances?: any[];
}

export interface SubmitAttendancePayload {
  students: {
    student_id: string;
    attendance_status: "present" | "absent" | "late" | "excused";
    notes?: string;
  }[];
  logbook: {
    check_in: string;
    check_out: string;
    teaching_minutes: number;
    material: string;
    notes?: string;
  };
}

// ============================================================================
// Mappers
// ============================================================================

export function mapProgramLevel(raw: ProgramLevelRaw): ProgramLevel {
  return {
    id: raw.id,
    programId: raw.program_id,
    levelCode: raw.level_code,
    name: raw.name,
    levelOrder: raw.level_order,
    isActive: raw.is_active,
    classrooms: raw.classrooms ? raw.classrooms.map(mapClassroom) : undefined,
  };
}

export function mapProgram(raw: ProgramRaw): Program {
  return {
    id: raw.id,
    programCode: raw.program_code,
    name: raw.name,
    description: raw.description,
    isActive: raw.is_active,
    levels: raw.levels ? raw.levels.map(mapProgramLevel).sort((a, b) => a.levelOrder - b.levelOrder) : [],
  };
}

export function mapClassTeacher(raw: ClassTeacherRaw): ClassTeacher {
  return {
    id: raw.id,
    classroomId: raw.classroom_id,
    teacherId: raw.teacher_id,
    effectiveFrom: raw.effective_from,
    effectiveUntil: raw.effective_until,
    role: raw.role,
    teacher: raw.teacher,
    name: raw.user?.name || raw.user?.full_name || raw.teacher?.name || "Unknown Teacher",
  };
}

export function mapClassroom(raw: ClassroomRaw): Classroom {
  return {
    id: raw.id,
    programLevelId: raw.program_level_id,
    classCode: raw.class_code,
    name: raw.name,
    capacity: raw.capacity,
    status: raw.status,
    activeStudentsCount: raw.active_students_count || 0,
    programLevel: raw.program_level ? mapProgramLevel(raw.program_level) : undefined,
    teachers: raw.teachers ? raw.teachers.map(mapClassTeacher) : [],
    students: raw.enrollments ? raw.enrollments.map(e => ({
      id: e.student_id,
      name: e.student?.full_name || "Unknown Student"
    })) : [],
  };
}

export function mapClassSchedule(raw: ClassScheduleRaw): ClassSchedule {
  return {
    id: raw.id,
    classroomId: raw.classroom_id,
    teacherId: raw.teacher_id,
    dayOfWeek: raw.day_of_week,
    startTime: raw.start_time,
    endTime: raw.end_time,
    effectiveFrom: raw.effective_from,
    effectiveUntil: raw.effective_until,
    isActive: raw.is_active,
    classroom: raw.classroom ? mapClassroom(raw.classroom) : undefined,
    teacher: raw.teacher ? mapTeacher(raw.teacher as any) : undefined,
  };
}

export function mapClassSession(raw: ClassSessionRaw): ClassSession {
  return {
    id: raw.id,
    classroomId: raw.classroom_id,
    teacherId: raw.teacher_id,
    classScheduleId: raw.class_schedule_id,
    sessionNumber: raw.session_number,
    sessionDate: raw.session_date,
    startTime: raw.start_time,
    endTime: raw.end_time,
    status: raw.status,
    isRescheduled: raw.is_rescheduled,
    isHoliday: raw.is_holiday,
    classroom: raw.classroom ? mapClassroom(raw.classroom) : undefined,
    teacher: raw.teacher ? mapTeacher(raw.teacher as any) : undefined,
    classSchedule: raw.class_schedule ? mapClassSchedule(raw.class_schedule) : undefined,
    teacherLogbook: raw.teacher_logbook,
    studentAttendances: raw.student_attendances,
  };
}

// ============================================================================
// API Calls: Programs
// ============================================================================

export async function getPrograms(params?: { search?: string; is_active?: boolean; per_page?: number }) {
  const res = await axiosInstance.get<PaginatedResponse<ProgramRaw>>("/programs", { params });
  return {
    ...res.data.data,
    data: res.data.data.data.map(mapProgram),
  };
}

export async function getProgramById(id: string) {
  const res = await axiosInstance.get<ApiResponse<ProgramRaw>>(`/programs/${id}`);
  return mapProgram(res.data.data);
}

export async function createProgram(data: { name: string; description?: string | null }) {
  const res = await axiosInstance.post<ApiResponse<ProgramRaw>>("/programs", data);
  return mapProgram(res.data.data);
}

export async function updateProgram(id: string, data: { name?: string; description?: string | null; is_active?: boolean }) {
  const res = await axiosInstance.put<ApiResponse<ProgramRaw>>(`/programs/${id}`, data);
  return mapProgram(res.data.data);
}

export async function deleteProgram(id: string) {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/programs/${id}`);
  return res.data;
}

// ============================================================================
// API Calls: Program Levels
// ============================================================================

export async function addProgramLevel(programId: string, data: { name: string; level_order?: number }) {
  const res = await axiosInstance.post<ApiResponse<ProgramLevelRaw>>(`/programs/${programId}/levels`, data);
  return mapProgramLevel(res.data.data);
}

export async function updateProgramLevel(programId: string, levelId: string, data: { name?: string; level_order?: number; is_active?: boolean }) {
  const res = await axiosInstance.put<ApiResponse<ProgramLevelRaw>>(`/programs/${programId}/levels/${levelId}`, data);
  return mapProgramLevel(res.data.data);
}

export async function deleteProgramLevel(programId: string, levelId: string) {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/programs/${programId}/levels/${levelId}`);
  return res.data;
}

// ============================================================================
// API Calls: Classrooms
// ============================================================================

export async function getClassrooms(params?: { search?: string; status?: string; program_level_id?: string; per_page?: number }) {
  const res = await axiosInstance.get<PaginatedResponse<ClassroomRaw>>("/classrooms", { params });
  return {
    ...res.data.data,
    data: res.data.data.data.map(mapClassroom),
  };
}

export async function getClassroomById(id: string) {
  const res = await axiosInstance.get<ApiResponse<ClassroomRaw>>(`/classrooms/${id}`);
  return mapClassroom(res.data.data);
}

export async function createClassroom(data: { program_level_id: string; name: string; capacity?: number }) {
  const res = await axiosInstance.post<ApiResponse<ClassroomRaw>>("/classrooms", data);
  return mapClassroom(res.data.data);
}

export async function updateClassroom(id: string, data: { program_level_id?: string; name?: string; capacity?: number; status?: string }) {
  const res = await axiosInstance.put<ApiResponse<ClassroomRaw>>(`/classrooms/${id}`, data);
  return mapClassroom(res.data.data);
}

export async function deleteClassroom(id: string) {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/classrooms/${id}`);
  return res.data;
}

// ============================================================================
// API Calls: Assign / Remove Teachers from Classroom
// ============================================================================

export async function assignTeacherToClassroom(
  classroomId: string, 
  data: { teacher_id: string; effective_from: string; effective_until?: string | null; role?: "primary" | "assistant" }
) {
  const res = await axiosInstance.post<ApiResponse<ClassroomRaw>>(`/classrooms/${classroomId}/teachers`, data);
  return mapClassroom(res.data.data);
}

export async function removeTeacherFromClassroom(classroomId: string, teacherId: string) {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/classrooms/${classroomId}/teachers/${teacherId}`);
  return res.data;
}

// ============================================================================
// API Calls: Class Schedules
// ============================================================================

export async function getClassSchedules() {
  const res = await axiosInstance.get<ApiResponse<ClassScheduleRaw[]>>("/class-schedules");
  return res.data.data.map(mapClassSchedule);
}

export async function createClassSchedule(data: {
  classroom_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until?: string | null;
}) {
  const res = await axiosInstance.post<ApiResponse<ClassScheduleRaw>>("/class-schedules", data);
  return mapClassSchedule(res.data.data);
}

export async function updateClassSchedule(id: string, data: Partial<{
  classroom_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
}>) {
  const res = await axiosInstance.put<ApiResponse<ClassScheduleRaw>>(`/class-schedules/${id}`, data);
  return mapClassSchedule(res.data.data);
}

export async function deleteClassSchedule(id: string) {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/class-schedules/${id}`);
  return res.data;
}

export async function generateClassSessions(scheduleId: string, data: { total_sessions: number; start_date: string }) {
  const res = await axiosInstance.post<ApiResponse<{
    sessions_count: number;
    sessions: any[];
    skipped_holidays: string[];
    skipped_conflicts: string[];
  }>>(`/class-schedules/${scheduleId}/generate-sessions`, data);
  return res.data.data;
}

// ============================================================================
// API Calls: Class Sessions & Attendances
// ============================================================================

export async function createClassSession(data: {
  classroom_id: string;
  teacher_id?: string;
  class_schedule_id?: string | null;
  session_number?: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status?: string;
}) {
  const res = await axiosInstance.post<ApiResponse<ClassSessionRaw>>("/class-sessions", data);
  return mapClassSession(res.data.data);
}

export async function getClassSessions(params?: { date?: string; teacher_id?: string; classroom_id?: string; per_page?: number }) {
  const res = await axiosInstance.get<ApiResponse<ClassSessionRaw[]>>("/class-sessions", { params });
  return res.data.data.map(mapClassSession);
}

export async function getClassSessionById(id: string) {
  const res = await axiosInstance.get<ApiResponse<ClassSessionRaw>>(`/class-sessions/${id}`);
  return mapClassSession(res.data.data);
}

export async function submitAttendanceAndLogbook(sessionId: string, payload: SubmitAttendancePayload) {
  const res = await axiosInstance.post<ApiResponse<any>>(`/class-sessions/${sessionId}/submit-attendance`, payload);
  return res.data;
}

export async function getHolidays(params?: { per_page?: number }) {
  const res = await axiosInstance.get<ApiResponse<any>>("/holidays", { params });
  return res.data;
}

// ============================================================================
// Academic Dashboard (Hari 7)
// ============================================================================
export interface AcademicDashboardData {
  summary: {
    total_students: number;
    active_students: number;
    total_teachers: number;
    active_teachers: number;
    total_classrooms: number;
    active_classrooms: number;
    total_programs: number;
    today_sessions: number;
    today_schedules: number;
  };
  attendance_today: {
    present: number;
    late: number;
    excused: number;
    absent: number;
    total_recorded: number;
  };
  today_sessions: any[];
}

export async function getAcademicDashboard(): Promise<AcademicDashboardData> {
  const res = await axiosInstance.get<ApiResponse<AcademicDashboardData>>("/academic/dashboard");
  return res.data.data;
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================
export const getClasses = getClassrooms;
export const getClass = getClassroomById;
export const createClass = createClassroom;
export const updateClass = updateClassroom;
export const deleteClass = deleteClassroom;
export const submitAttendance = submitAttendanceAndLogbook;

