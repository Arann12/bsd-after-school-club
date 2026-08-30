import React from "react";

export function LogoIcon({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Butterfly Antennae & Head */}
      <path
        d="M74 34 C71 22 65 14 62 12"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="62" cy="12" r="3" fill="#f59e0b" />
      <path
        d="M86 34 C89 22 95 14 98 12"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="98" cy="12" r="3" fill="#f59e0b" />
      <circle cx="80" cy="30" r="4" fill="#f59e0b" />

      {/* Butterfly Body */}
      <path
        d="M80 37 C76 49 75 66 77 79 C78 82 82 82 83 79 C85 66 84 49 80 37 Z"
        fill="#f59e0b"
      />
      <circle cx="80" cy="85" r="3" fill="#f59e0b" />

      {/* Left Book Wing (Outer) */}
      <path
        d="M74 44 C61 34 41 28 27 33 C25 34 22 36 22 39 L15 84 C14 87 16 90 19 91 C33 95 55 98 74 90"
        stroke="#1a5c8a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Book Wing (Inner) */}
      <path
        d="M72 54 C59 46 43 43 30 46 L24 81 C37 84 57 87 72 81"
        stroke="#1a5c8a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 91 C36 82 55 84 74 90"
        stroke="#1a5c8a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Book Wing (Outer) */}
      <path
        d="M86 44 C99 34 119 28 133 33 C135 34 138 36 138 39 L145 84 C146 87 144 90 141 91 C127 95 105 98 86 90"
        stroke="#1a5c8a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Book Wing (Inner) */}
      <path
        d="M88 54 C101 46 117 43 130 46 L136 81 C123 84 103 87 88 81"
        stroke="#1a5c8a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M141 91 C124 82 105 84 86 90"
        stroke="#1a5c8a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Book Bottom V Fold */}
      <path
        d="M74 90 L80 87 L86 90"
        stroke="#1a5c8a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  subtitle = "Owner Dashboard",
  size = 38,
}: {
  subtitle?: string;
  size?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid var(--color-border-light)",
          flexShrink: 0,
        }}
      >
        <LogoIcon size={size - 4} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "var(--color-primary)",
            lineHeight: 1.2,
            letterSpacing: "-0.2px",
          }}
        >
          BSD After School Club
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default Logo;
