/* ============================================================
   BSD After School Club — API Barrel Export
   Import semua kebutuhan API dari satu tempat:
   import { login, getStudents, ... } from "@/lib/api"
   ============================================================ */

// Axios instance (kalau perlu akses langsung)
export { default as axiosInstance } from "./axiosInstance";

// Auth
export * from "./auth";

// Students, Parents, Enrollment
export * from "./students";
export * from "./parents";

export * from "./teachers";
export * from "./academic";

// Finance: Invoices, Payments, Cash, Honor, Reports
export * from "./finance";
export * from "./payrolls";

// Operational: Announcements, Inventory, Notifications
export * from "./operational";
