import React from "react";
import { COLORS } from "../styles/tokens";
import { ROLE_LABELS } from "../utils/roles";

const NAV_ITEMS = [
  { key: "registro", label: "Registro y Admisión" },
  { key: "expediente", label: "Expediente Clínico" },
  { key: "tratamiento", label: "Tratamiento" },
  { key: "referidos", label: "Clientes Referidos" },
  { key: "financiera", label: "Área Financiera" },
  { key: "farmacia", label: "Farmacia" },
  { key: "bitacora", label: "Bitácora de Visitas" },
  { key: "seguridad", label: "Seguridad y Roles" },
  { key: "reportes", label: "Reportes" },
];

export function Layout({ usuario, page, setPage, onLogout, children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.lightBg }}>
      <div className="flex flex-col" style={{ width: 240, backgroundColor: COLORS.navy, flexShrink: 0 }}>
        <div className="px-5 pt-6 pb-4">
          <div className="text-white font-bold text-sm tracking-wide">HOSPITAL VERAPAZ</div>
          <div className="text-xs mt-1" style={{ color: "#B7C1D9" }}>{usuario.nombre}</div>
          <div className="text-xs" style={{ color: "#B7C1D9" }}>{ROLE_LABELS[usuario.rol] || usuario.rol}</div>
        </div>
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="w-full text-left px-3 py-2.5 rounded-md text-sm mb-1"
              style={
                page === item.key
                  ? { backgroundColor: COLORS.gold, color: COLORS.navy, fontWeight: 600 }
                  : { color: "white", backgroundColor: "transparent" }
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button onClick={onLogout} className="w-full text-left px-3 py-2.5 rounded-md text-sm" style={{ color: "#B7C1D9" }}>
            ← Cerrar sesión
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
