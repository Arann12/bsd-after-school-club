"use client";

import {
  STUDENT_STATUS_COLOR,
  PAYMENT_STATUS_COLOR,
  HONOR_STATUS_COLOR,
  ATTENDANCE_STATUS_COLOR,
  CASH_STATUS_COLOR,
  ENROLLMENT_STATUS_COLOR,
  ANNOUNCEMENT_STATUS_COLOR,
  INVENTORY_CONDITION_COLOR,
} from "@/lib/constants";

type ColorMap = Record<string, { bg: string; color: string }>;

interface StatusBadgeProps {
  /** The status label to display */
  status: string;
  /** Which color map to use. Auto-detected from status text if omitted. */
  variant?: "student" | "payment" | "honor" | "attendance" | "cash" | "enrollment" | "announcement" | "inventory";
  /** Optional prefix text before status, e.g. "SPP:" */
  prefix?: string;
  /** Pill shape (default) or compact */
  size?: "default" | "sm";
}

const variantMap: Record<string, ColorMap> = {
  student: STUDENT_STATUS_COLOR,
  payment: PAYMENT_STATUS_COLOR,
  honor: HONOR_STATUS_COLOR,
  attendance: ATTENDANCE_STATUS_COLOR,
  cash: CASH_STATUS_COLOR,
  enrollment: ENROLLMENT_STATUS_COLOR,
  announcement: ANNOUNCEMENT_STATUS_COLOR,
  inventory: INVENTORY_CONDITION_COLOR,
};

/** Auto-detect which color map to use based on status text */
function autoDetectVariant(status: string): ColorMap {
  if (status in STUDENT_STATUS_COLOR) return STUDENT_STATUS_COLOR;
  if (status in PAYMENT_STATUS_COLOR) return PAYMENT_STATUS_COLOR;
  if (status in HONOR_STATUS_COLOR) return HONOR_STATUS_COLOR;
  if (status in ATTENDANCE_STATUS_COLOR) return ATTENDANCE_STATUS_COLOR;
  if (status in CASH_STATUS_COLOR) return CASH_STATUS_COLOR;
  if (status in ENROLLMENT_STATUS_COLOR) return ENROLLMENT_STATUS_COLOR;
  if (status in ANNOUNCEMENT_STATUS_COLOR) return ANNOUNCEMENT_STATUS_COLOR;
  if (status in INVENTORY_CONDITION_COLOR) return INVENTORY_CONDITION_COLOR;
  // Fallback: neutral
  return { [status]: { bg: "#f1f5f9", color: "#64748b" } };
}

export default function StatusBadge({ status, variant, prefix, size = "default" }: StatusBadgeProps) {
  const colorMap = variant ? variantMap[variant] : autoDetectVariant(status);
  const colors = colorMap[status] || { bg: "#f1f5f9", color: "#64748b" };

  const padding = size === "sm" ? "2px 8px" : "3px 10px";
  const fontSize = size === "sm" ? 10.5 : 11.5;

  return (
    <span
      style={{
        background: colors.bg,
        color: colors.color,
        fontSize,
        fontWeight: 700,
        padding,
        borderRadius: "var(--radius-full)",
        whiteSpace: "nowrap",
      }}
    >
      {prefix ? `${prefix} ${status}` : status}
    </span>
  );
}
