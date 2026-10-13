"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  options?: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function getTextFromReactNode(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextFromReactNode).join("");
  if (React.isValidElement(node)) {
    return getTextFromReactNode((node.props as any)?.children);
  }
  return "";
}

function extractOptionsFromChildren(children: React.ReactNode): SelectOption[] {
  const result: SelectOption[] = [];

  const walk = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (child == null || typeof child === "boolean") return;
      if (Array.isArray(child)) {
        walk(child);
        return;
      }
      if (!React.isValidElement(child)) return;

      if (child.type === React.Fragment) {
        walk((child.props as any)?.children);
        return;
      }

      const p = child.props as any;
      const isOption =
        child.type === "option" ||
        (typeof child.type === "string" && child.type.toLowerCase() === "option") ||
        (p && (p.value !== undefined || p.label !== undefined));

      if (isOption) {
        const val = p?.value !== undefined ? p.value : "";
        const labelText =
          getTextFromReactNode(p?.children) ||
          (p?.label !== undefined ? String(p.label) : String(val));

        result.push({
          value: val,
          label: labelText || String(val),
          sublabel: p?.["data-sublabel"] || p?.sublabel,
          disabled: !!p?.disabled,
        });
        return;
      }

      if ((child.props as any)?.children) {
        walk((child.props as any).children);
      }
    });
  };

  walk(children);
  return result;
}

export default function SearchableSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "-- Pilih --",
  searchPlaceholder = "Cari opsi...",
  disabled = false,
  required = false,
  className = "",
  style = {},
  children,
}: SearchableSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    dropUp: boolean;
  }>({
    top: 0,
    left: 0,
    width: 200,
    maxHeight: 240,
    dropUp: false,
  });

  const [internalValue, setInternalValue] = useState<string | number>(
    value !== undefined ? value : defaultValue !== undefined ? defaultValue : ""
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allOptions: SelectOption[] = useMemo(() => {
    if (options && options.length > 0) return options;
    if (children) return extractOptionsFromChildren(children);
    return [];
  }, [options, children]);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const currentValue = value !== undefined ? value : internalValue;

  const selectedOption = useMemo(() => {
    return allOptions.find((opt) => String(opt.value) === String(currentValue));
  }, [allOptions, currentValue]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        String(opt.value).toLowerCase().includes(q)
    );
  }, [allOptions, searchTerm]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (rect.bottom < 0 || rect.top > vh) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    const isDropUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const availableSpace = isDropUp ? spaceAbove - 16 : spaceBelow - 16;
    const maxHeight = Math.max(140, Math.min(260, availableSpace));

    const desiredWidth = Math.max(rect.width, 180);
    const width = Math.min(desiredWidth, vw - 24);

    let left = rect.left;
    if (left + width > vw - 12) {
      left = vw - width - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const top = isDropUp ? rect.top - 4 : rect.bottom + 4;

    setCoords({
      top,
      left,
      width,
      maxHeight,
      dropUp: isDropUp,
    });
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setSearchTerm("");
      setHighlightedIndex(-1);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    }
  }, [isOpen]);

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    setInternalValue(opt.value);
    setIsOpen(false);
    setSearchTerm("");

    if (onChange) {
      onChange({
        target: {
          value: String(opt.value),
          name: name || id || "",
        },
      });
    }

    triggerRef.current?.focus();
  };

  const scrollIndexIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLDivElement>("[data-select-option]");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    }
  };

  const isFormInput = className.includes("form-input");

  const {
    width,
    minWidth,
    maxWidth,
    flex,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    display,
    ...restTriggerStyle
  } = style;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: display || (width === "100%" || isFormInput ? "block" : "inline-block"),
    width: width || (isFormInput ? "100%" : undefined),
    minWidth,
    maxWidth,
    flex,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  };

  const triggerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "left",
    background: disabled ? "var(--color-bg, #f8fafc)" : "#ffffff",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.65 : 1,
    userSelect: "none",
    gap: 8,
    outline: "none",
    ...restTriggerStyle,
  };

  const renderDropdownMenu = () => {
    if (!mounted || !isOpen) return null;

    const menuNode = (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          width: coords.width,
          transform: coords.dropUp ? "translateY(-100%)" : "none",
          zIndex: 999999,
          background: "#ffffff",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 10,
          boxShadow: "0 16px 36px -4px rgba(15, 23, 42, 0.18), 0 6px 14px -2px rgba(15, 23, 42, 0.10)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeIn 0.12s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Live Search Input */}
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid var(--color-border-light, #f1f5f9)",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted, #94a3b8)"
            strokeWidth={2}
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(0);
            }}
            placeholder={searchPlaceholder}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 12.5,
              color: "var(--color-text-primary, #1e293b)",
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                searchInputRef.current?.focus();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                color: "var(--color-text-muted, #94a3b8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Options List */}
        <div
          ref={listRef}
          role="listbox"
          style={{
            maxHeight: coords.maxHeight,
            overflowY: "auto",
            padding: "4px 0",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: "16px 12px",
                fontSize: 12.5,
                color: "var(--color-text-muted, #94a3b8)",
                textAlign: "center",
              }}
            >
              Tidak ada hasil ditemukan
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === String(currentValue);
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={`${opt.value}-${idx}`}
                  data-select-option
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: "8px 12px",
                    fontSize: 12.5,
                    cursor: opt.disabled ? "not-allowed" : "pointer",
                    opacity: opt.disabled ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    background: isSelected
                      ? "#e0f2fe"
                      : isHighlighted
                      ? "#f1f5f9"
                      : "transparent",
                    color: isSelected ? "#0369a1" : "var(--color-text-primary, #1e293b)",
                    fontWeight: isSelected ? 700 : 500,
                    transition: "background 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span
                        style={{
                          fontSize: 11,
                          color: isSelected ? "#0284c7" : "var(--color-text-muted, #64748b)",
                          fontWeight: 400,
                        }}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0369a1"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    return createPortal(menuNode, document.body);
  };

  return (
    <div
      ref={containerRef}
      className="searchable-select-wrap"
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue !== undefined ? String(currentValue) : ""}
          required={required}
        />
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={triggerStyle}
        className={className}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            color: selectedOption ? "inherit" : "var(--color-text-muted, #94a3b8)",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: "var(--color-text-muted, #64748b)",
            transition: "transform 0.2s ease",
            transform: isOpen ? (coords.dropUp ? "rotate(0deg)" : "rotate(180deg)") : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {renderDropdownMenu()}
    </div>
  );
}
