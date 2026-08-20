import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Button } from "../components/Button";
import { Banner } from "../components/Banner";
import { Modal } from "../components/Modal";
import { DocumentoImprimible } from "../components/DocumentoImprimible";
import { FormField, TextInput, Select } from "../components/FormField";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

export function FinancieraPage() {
  const { usuario } = useAuth();
  const puedeFacturar = [ROLES.FACTURACION, ROLES.ADMIN].includes(usuario.rol);

  const { data: reporte, reload: reloadReporte } = useFetch("/facturacion/reporte");
  const { data: facturas, loading, error, reload: reloadFacturas } = useFetch("/facturacion");
  const { data: pacientes } = useFetch("/pacientes");
  const [facturaImprimir, setFacturaImprimir] = useState(null);

  const [pacienteId, setPacienteId] = useState(null);
  useEffect(() => {
    if (!pacienteId && pacientes?.length) setPacienteId(pacientes[0].id);
  }, [pacientes, pacienteId]);

  const [form, setForm] = useState({ costoHospital: "", formaPago: "efectivo" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      const factura = await api.post("/facturacion", { pacienteId, costoHospital: Number(form.costoHospital), formaPago: form.formaPago });
      setMensaje({ tone: "success", texto: `Factura generada por Q${Number(factura.total).toFixed(2)}` });
      setForm({ costoHospital: "", formaPago: "efectivo" });
      reloadFacturas();
      reloadReporte();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  const stats = reporte
    ? [
        { label: "INGRESOS HOSPITAL", value: `Q ${reporte.ingresosHospital.toLocaleString()}`, color: COLORS.navy },
        { label: "INGRESOS FARMACIA", value: `Q ${reporte.ingresosFarmacia.toLocaleString()}`, color: COLORS.teal },
        { label: "TOTAL CONSOLIDADO", value: `Q ${reporte.totalConsolidado.toLocaleString()}`, color: COLORS.gold },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Área Financiera" subtitle="Reporte consolidado: ingresos del hospital y de farmacia, por separado y en conjunto (RF-21)" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="text-xs font-semibold" style={{ color: "#888" }}>{s.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {error && <Banner tone="error">{error}</Banner>}
      <Table
        headers={["Paciente", "Costo hospital", "Costo tratamiento", "Total", "Forma de pago", "Fecha", ""]}
        rows={loading ? [] : facturas || []}
        emptyMessage={loading ? "Cargando…" : "Sin facturas registradas."}
        renderRow={(f) => (
          <>
            <td className="px-4 py-3">{f.paciente?.nombreCompleto} <span style={{ color: "#999" }}>({f.paciente?.historiaClinica})</span></td>
            <td className="px-4 py-3">Q{Number(f.costoHospital).toFixed(2)}</td>
            <td className="px-4 py-3">Q{Number(f.costoTratamiento).toFixed(2)}</td>
            <td className="px-4 py-3 font-semibold">Q{Number(f.total).toFixed(2)}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{f.formaPago === "efectivo" ? "Efectivo" : "Transferencia"}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{new Date(f.creadoEn).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <button onClick={() => setFacturaImprimir(f)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: COLORS.navy }}>
                <Printer size={13} /> Imprimir
              </button>
            </td>
          </>
        )}
      />

      {puedeFacturar && (
        <Card style={{ marginTop: 16 }}>
          <div className="font-semibold text-sm mb-1">5.1 Facturación Hospital</div>
          <p className="text-xs mb-4" style={{ color: "#888" }}>
            El costo de tratamiento intrahospitalario pendiente se suma automáticamente al costo base (RF-17, RF-19).
          </p>
          {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <FormField label="Paciente">
              <Select required value={pacienteId || ""} onChange={(e) => setPacienteId(Number(e.target.value))}>
                {(pacientes || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.historiaClinica}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Costo base hospital (Q)"><TextInput type="number" step="0.01" min="0" required value={form.costoHospital} onChange={(e) => setForm((f) => ({ ...f, costoHospital: e.target.value }))} /></FormField>
            <FormField label="Forma de pago">
              <Select value={form.formaPago} onChange={(e) => setForm((f) => ({ ...f, formaPago: e.target.value }))}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </Select>
            </FormField>
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={guardando}>{guardando ? "Generando…" : "Generar factura"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Modal open={!!facturaImprimir} onClose={() => setFacturaImprimir(null)} title="Factura de hospital" maxWidth={520}>
        {facturaImprimir && (
          <DocumentoImprimible
            titulo="Factura de Hospital"
            subtitulo={`No. ${facturaImprimir.id} · ${new Date(facturaImprimir.creadoEn).toLocaleString()}`}
          >
            <div className="text-sm mb-4">
              <div><strong>Paciente:</strong> {facturaImprimir.paciente?.nombreCompleto}</div>
              <div><strong>Historia clínica:</strong> {facturaImprimir.paciente?.historiaClinica}</div>
              <div><strong>Forma de pago:</strong> {facturaImprimir.formaPago === "efectivo" ? "Efectivo" : "Transferencia"}</div>
            </div>
            <table className="w-full text-sm mb-4">
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td className="py-1.5">Costo base hospital</td>
                  <td className="py-1.5 text-right">Q{Number(facturaImprimir.costoHospital).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td className="py-1.5">Costo de tratamiento intrahospitalario</td>
                  <td className="py-1.5 text-right">Q{Number(facturaImprimir.costoTratamiento).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div className="text-right font-bold text-base">Total: Q{Number(facturaImprimir.total).toFixed(2)}</div>
          </DocumentoImprimible>
        )}
      </Modal>
    </div>
  );
}
