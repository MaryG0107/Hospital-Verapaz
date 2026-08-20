import React from "react";
import { COLORS } from "../styles/tokens";

export function Card({ children, style = {} }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border"
      style={{ borderColor: COLORS.border, ...style }}
    >
      {children}
    </div>
  );
}
