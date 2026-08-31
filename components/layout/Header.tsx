"use client";

import React, { useState } from "react";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userInitial?: string;
  userColor?: string;
  greetingText?: string;
  showSearch?: boolean;
  showChildSelector?: boolean;
  selectedChild?: string;
  selectedChildLevel?: string;
}

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({
  userName = "Owner",
  userEmail = "admin@bsdafterschool.com",
  userRole,
  userInitial = "O",
  userColor = "linear-gradient(135deg, #1a5c8a, #2a7ab8)",
  greetingText,
  showSearch = true,
  showChildSelector = false,
  selectedChild = "Budi",
  selectedChildLevel = "Phonics L2",
}: HeaderProps) {
  const pathname = usePathname() || "";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentChild, setCurrentChild] = useState(selectedChild);
  const [currentLevel, setCurrentLevel] = useState(selectedChildLevel);

  let profileLink = "/owner/profil";
  if (pathname.startsWith("/admin")) profileLink = "/admin/profil";
  else if (pathname.startsWith("/guru")) profileLink = "/guru/profil";
  else if (pathname.startsWith("/orang-tua")) profileLink = "/orang-tua/profil";

  const childrenList = [
    { name: "Budi", level: "Phonics L2", id: "STD-88921" },
    { name: "Annisa", level: "Calistung L1", id: "STD-88925" },
  ];

  return (
    <header className="header" style={{ justifyContent: "space-between", position: "relative" }}>
      {/* Left side: Greeting or Search */}
      {greetingText ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>
            {greetingText}
          </span>
          {showChildSelector && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#ffffff",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "5px 12px 5px 6px",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
                id="child-selector-btn"
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    fontSize: 12,
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
                    {currentChild}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--color-text-muted)" }}>
                    {currentLevel}
                  </div>
                </div>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--color-primary)", marginLeft: 4 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 6,
                    background: "#ffffff",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-md)",
                    zIndex: 50,
                    minWidth: 180,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border-light)" }}>
                    Pilih Anak
                  </div>
                  {childrenList.map((ch) => (
                    <div
                      key={ch.name}
                      onClick={() => {
                        setCurrentChild(ch.name);
                        setCurrentLevel(ch.level);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: currentChild === ch.name ? "var(--color-primary-bg)" : "#ffffff",
                      }}
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {ch.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--color-text-muted)" }}>
                          {ch.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : showSearch ? (
        <div className="header-search">
          <div className="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              id="header-search-input"
            />
          </div>
        </div>
      ) : <div />}

      {/* Right Actions */}
      <div className="header-actions" style={{ position: "relative" }}>
        {/* Notification Bell */}
        <button className="header-icon-btn" id="header-notif-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="badge-dot" />
        </button>

        {/* Help Question Icon (if Orang Tua) */}
        {greetingText && (
          <button className="header-icon-btn" id="header-help-btn" aria-label="Help">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        )}

        {/* User Info / Profile Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="header-user"
            id="header-user-menu"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "background 0.15s",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: userColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                border: "2px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>
            <div className="header-user-info" style={{ textAlign: "left" }}>
              <span className="header-user-name">{userName}</span>
              {userRole ? (
                <span className="badge badge-info" style={{ fontSize: 10, padding: "1px 6px", alignSelf: "flex-start", marginTop: 2 }}>
                  {userRole}
                </span>
              ) : (
                <span className="header-user-email">{userEmail}</span>
              )}
            </div>
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-text-muted)", marginLeft: 2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* User Profile Dropdown */}
          {userMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                background: "#ffffff",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 60,
                width: 220,
                overflow: "hidden",
                animation: "fadeIn 0.15s ease-out",
              }}
            >
              {/* Dropdown Header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border-light)", background: "#f8fafc" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
                  {userName}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {userEmail}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: "6px" }}>
                <Link
                  href={profileLink}
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Lihat Profil & Akun</span>
                </Link>

                <div style={{ height: 1, background: "var(--color-border-light)", margin: "4px 0" }} />

                <Link
                  href="/"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-danger)",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Keluar</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
