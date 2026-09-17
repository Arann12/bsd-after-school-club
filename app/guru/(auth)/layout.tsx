/**
 * Layout kosong untuk route group (auth) di dalam /guru.
 * Mengoverride app/guru/layout.tsx agar halaman login
 * TIDAK dibungkus AuthGuard.
 */
export default function GuruAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
