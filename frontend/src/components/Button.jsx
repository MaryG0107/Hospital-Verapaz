import React from "react";
import { COLORS } from "../styles/tokens";

export function Button({ children, onClick, variant = "primary", type = "button", disabled = false }) {
  const base = "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:active:scale-100";
  if (variant === "primary") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={base + " shadow-soft hover:shadow-lifted hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-soft"}
        style={{ backgroundColor: COLORS.navy, color: "white", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base + " border hover:bg-gray-50"}
      style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: "white", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
}
