/**
 * Layout kosong untuk route group (auth) di dalam /orang-tua.
 * Mengoverride app/orang-tua/layout.tsx agar halaman login
 * TIDAK dibungkus AuthGuard.
 */
export default function OrangTuaAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
