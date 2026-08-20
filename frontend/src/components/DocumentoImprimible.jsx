import React from "react";
import { Printer } from "lucide-react";
import { Button } from "./Button";
import { COLORS } from "../styles/tokens";

// Layout comun para todo lo imprimible (facturas, recetas): un
// encabezado tipo membrete + el contenido especifico de cada documento.
// El boton "Imprimir" tiene la clase no-print para no salir en el papel.
export function DocumentoImprimible({ titulo, subtitulo, children }) {
  return (
    <div>
      <div className="no-print flex justify-end mb-3">
        <Button onClick={() => window.print()}>
          <span className="flex items-center gap-1.5"><Printer size={15} /> Imprimir</span>
        </Button>
      </div>

      <div id="printable-area" className="text-black">
        <div className="text-center mb-5 pb-3" style={{ borderBottom: "1px solid #ccc" }}>
          <div className="text-xs font-bold tracking-widest" style={{ color: COLORS.navy }}>HOSPITAL VERAPAZ</div>
          <div className="text-[11px]" style={{ color: "#666" }}>Cobán, Alta Verapaz — Sistema de gestión de expediente clínico y administrativo</div>
          <h2 className="text-lg font-bold mt-2">{titulo}</h2>
          {subtitulo && <p className="text-xs mt-0.5" style={{ color: "#666" }}>{subtitulo}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
