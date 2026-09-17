/**
 * Layout kosong untuk route group (auth) di dalam /admin.
 * Mengoverride app/admin/layout.tsx agar halaman login
 * TIDAK dibungkus AuthGuard.
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
