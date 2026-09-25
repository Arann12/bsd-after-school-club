"use client";

import { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  label: string;
  /** Render custom cell content. Falls back to row[key] */
  render?: (row: T) => React.ReactNode;
  /** Whether this column is searchable */
  searchable?: boolean;
  /** Flex value for the column width */
  flex?: number;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

interface FilterOption {
  label: string;
  values: string[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Unique key extractor */
  rowKey: (row: T) => string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Filter options above the table */
  filters?: FilterOption[];
  /** Active filter values */
  filterValues?: Record<string, string>;
  /** Filter change handler */
  onFilterChange?: (filterKey: string, value: string) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Footer content below the table (e.g. pagination) */
  footer?: React.ReactNode;
  /** Custom empty state */
  emptyMessage?: string;
}

export default function DataTable<T extends object>({
  columns, data, rowKey, searchPlaceholder = "Cari...",
  filters, filterValues, onFilterChange, onRowClick, footer,
  emptyMessage = "Tidak ada data yang ditemukan.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    // Global search
    if (search) {
      const q = search.toLowerCase();
      const searchableCols = columns.filter(c => c.searchable !== false);
      result = result.filter(row =>
        searchableCols.some(col => {
          const val = (row as Record<string, unknown>)[col.key];
          return val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Per-filter search
    if (filterValues) {
      Object.entries(filterValues).forEach(([key, val]) => {
        if (val && val !== "Semua") {
          result = result.filter(row => String((row as Record<string, unknown>)[key]) === val);
        }
      });
    }

    return result;
  }, [data, search, filterValues, columns]);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Search + Filters */}
      {(searchPlaceholder || filters) && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              style={{ paddingLeft: 38, width: "100%" }}
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filters?.map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {f.label}
              </label>
              <select
                className="select-control"
                style={{ padding: "8px 12px", fontSize: 13 }}
                value={filterValues?.[f.label] || "Semua"}
                onChange={e => onFilterChange?.(f.label, e.target.value)}
              >
                {f.values.map(v => (
                  <option key={v} value={v}>{v === "Semua" ? `Semua ${f.label}` : v}</option>
                ))}
              </select>
            </div>
          ))}
          <span style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginLeft: "auto", alignSelf: "flex-end" }}>
            {filtered.length} data
          </span>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    padding: "12px 16px", fontSize: 11, fontWeight: 700,
                    color: "var(--color-text-muted)", textTransform: "uppercase",
                    letterSpacing: "0.05em", whiteSpace: "nowrap",
                    flex: col.flex,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-text-muted)", fontSize: 14 }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : filtered.map((row, i) => (
              <tr
                key={rowKey(row)}
                className="row-hover"
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none", background: "#fff", cursor: onRowClick ? "pointer" : undefined }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
    </div>
  );
}
