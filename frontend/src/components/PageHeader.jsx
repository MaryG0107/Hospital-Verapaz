import React from "react";
import { COLORS } from "../styles/tokens";

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: COLORS.text }}>{title}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>{subtitle}</p>}
    </div>
  );
}
