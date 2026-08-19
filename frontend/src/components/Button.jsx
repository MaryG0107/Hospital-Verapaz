import React from "react";
import { COLORS } from "../styles/tokens";

export function Button({ children, onClick, variant = "primary", type = "button", disabled = false }) {
  const base = "px-4 py-2 rounded-md text-sm font-semibold transition-colors";
  if (variant === "primary") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={base}
        style={{ backgroundColor: COLORS.navy, color: "white", opacity: disabled ? 0.6 : 1 }}
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
      className={base + " border"}
      style={{ borderColor: COLORS.border, color: "#333", backgroundColor: "white", opacity: disabled ? 0.6 : 1 }}
    >
      {children}
    </button>
  );
}
