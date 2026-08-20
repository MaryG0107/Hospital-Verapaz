import React, { useEffect } from "react";
import { X } from "lucide-react";
import { COLORS } from "../styles/tokens";

export function Modal({ open, onClose, title, icon: Icon, children }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 animate-fade-in" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-lifted w-full animate-fade-in-up"
        style={{ maxWidth: 440 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EEF1FB" }}>
                <Icon size={17} style={{ color: COLORS.navy }} />
              </div>
            )}
            <h3 className="text-base font-bold" style={{ color: COLORS.text }}>{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-5 pt-3">{children}</div>
      </div>
    </div>
  );
}
