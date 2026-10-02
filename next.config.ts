import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  async headers() {
    return [
      {
        // Terapkan ke semua route
        source: "/(.*)",
        headers: [
          // Cegah halaman diembed di iframe (clickjacking)
          { key: "X-Frame-Options",        value: "DENY" },
          // Cegah browser menebak content-type (MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Jangan kirim Referer ke domain lain
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          // Matikan fitur browser yang tidak dipakai
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },

  async redirects() {
    // Blokir /test-api di production (double protection setelah middleware)
    if (process.env.NODE_ENV === "production") {
      return [
        { source: "/test-api", destination: "/", permanent: false },
      ];
    }
    return [];
  },
};

export default nextConfig;
