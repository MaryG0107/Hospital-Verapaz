import React from "react";
import { COLORS } from "../styles/tokens";

const TONES = {
  success: { bg: "#E7F5EC", color: COLORS.green },
  error: { bg: "#FBEAE8", color: COLORS.red },
  warning: { bg: "#FBEAE8", color: COLORS.red },
  info: { bg: "#EFF1FB", color: COLORS.navy },
};

export function Banner({ tone = "info", children }) {
  const { bg, color } = TONES[tone] || TONES.info;
  return (
    <div className="rounded-md px-4 py-3 mb-4 text-sm font-semibold" style={{ backgroundColor: bg, color }}>
      {children}
    </div>
  );
}
