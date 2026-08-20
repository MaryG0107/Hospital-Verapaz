import React from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

export function ReportesPage() {
  const { usuario } = useAuth();

  if (usuario.rol !== ROLES.ADMIN) {
    return (
      <div>
        <PageHeader title="Reportes" />
        <Card>
          <p className="text-sm" style={{ color: "#666" }}>Los reportes administrativos y financieros están disponibles solo para el Administrador (RF-31).</p>
        </Card>
      </div>
    );
  }

  const { data: financiero } = useFetch("/reportes/financiero");
  const { data: admisiones } = useFetch("/reportes/admisiones");
  const { data: porFormaPago } = useFetch("/reportes/facturacion-por-forma-pago");
  const { data: kardex } = useFetch("/reportes/inventario-kardex");
  const { data: auditoria } = useFetch("/reportes/auditoria-diagnostico");

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Reportes administrativos y financieros para apoyar la toma de decisiones (RF-31)" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="text-xs font-semibold" style={{ color: "#888" }}>INGRESOS HOSPITAL</div>
          <div className="text-2xl font-bold mt-1" style={{ color: COLORS.navy }}>Q {financiero?.ingresosHospital?.toLocaleString() ?? "—"}</div>
        </Card>
        <Card>
          <div className="text-xs font-semibold" style={{ color: "#888" }}>INGRESOS FARMACIA</div>
          <div className="text-2xl font-bold mt-1" style={{ color: COLORS.teal }}>Q {financiero?.ingresosFarmacia?.toLocaleString() ?? "—"}</div>
        </Card>
        <Card>
          <div className="text-xs font-semibold" style={{ color: "#888" }}>TOTAL CONSOLIDADO</div>
          <div className="text-2xl font-bold mt-1" style={{ color: COLORS.gold }}>Q {financiero?.totalConsolidado?.toLocaleString() ?? "—"}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="font-semibold text-sm mb-3">Admisiones por condición de egreso</div>
          <div className="text-sm mb-2" style={{ color: "#666" }}>Total de ingresos: {admisiones?.totalIngresos ?? "—"}</div>
          {(admisiones?.porCondicionEgreso || []).map((c) => (
            <div key={c.condicion} className="text-sm flex justify-between py-1" style={{ color: "#666" }}>
              <span>{c.condicion}</span><span>{c.total}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="font-semibold text-sm mb-3">Facturación por forma de pago</div>
          {(porFormaPago || []).map((f) => (
            <div key={f.formaPago} className="text-sm flex justify-between py-1" style={{ color: "#666" }}>
              <span>{f.formaPago === "efectivo" ? "Efectivo" : "Transferencia"} ({f.cantidad})</span>
              <span>Q{f.total.toFixed(2)}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="font-semibold text-sm mb-3">Kardex de inventario de farmacia (RNF-10)</div>
        <Table
          headers={["Medicamento", "Tipo", "Cantidad", "Motivo", "Fecha"]}
          rows={kardex || []}
          emptyMessage="Sin movimientos registrados."
          renderRow={(m) => (
            <>
              <td className="px-4 py-3">{m.medicamento?.nombre}</td>
              <td className="px-4 py-3" style={{ color: m.tipo === "entrada" ? COLORS.green : COLORS.red }}>{m.tipo}</td>
              <td className="px-4 py-3">{m.cantidad}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{m.motivo || "—"}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{new Date(m.fecha).toLocaleString()}</td>
            </>
          )}
        />
      </Card>

      <Card>
        <div className="font-semibold text-sm mb-1">Auditoría de accesos al diagnóstico confidencial (RNF-08)</div>
        <p className="text-xs mb-3" style={{ color: "#888" }}>
          Quién vio el diagnóstico de cada paciente, cuándo, y si fue como Administrador (acceso directo) o con un token temporal.
        </p>
        <Table
          headers={["Usuario", "Rol", "Paciente", "Tipo de acceso", "Fecha"]}
          rows={auditoria || []}
          emptyMessage="Sin accesos registrados."
          renderRow={(a) => (
            <>
              <td className="px-4 py-3 font-semibold">{a.usuario?.nombre}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{a.usuario?.rol}</td>
              <td className="px-4 py-3">{a.paciente?.nombreCompleto} <span style={{ color: "#999" }}>({a.paciente?.historiaClinica})</span></td>
              <td className="px-4 py-3 font-semibold" style={{ color: a.viaToken ? COLORS.gold : COLORS.navy }}>
                {a.viaToken ? "Con token temporal" : "Administrador (directo)"}
              </td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{new Date(a.fecha).toLocaleString()}</td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
