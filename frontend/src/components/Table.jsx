import React from "react";
import { COLORS } from "../styles/tokens";

export function Table({ headers, rows, renderRow, emptyMessage = "Sin datos por mostrar." }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#F4F4F7" }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-sm" style={{ color: "#999" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                {renderRow(row)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
