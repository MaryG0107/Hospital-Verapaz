import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Button } from "../components/Button";
import { Banner } from "../components/Banner";
import { FormField, TextInput, Select } from "../components/FormField";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

const ESTADO_LABEL = { ok: "OK", stock_bajo: "Stock bajo", por_vencer: "Por vencer" };
const ESTADO_COLOR = { ok: COLORS.green, stock_bajo: COLORS.red, por_vencer: COLORS.red };

export function FarmaciaPage() {
  const { usuario } = useAuth();
  const puedeGestionar = [ROLES.FARMACIA, ROLES.ADMIN].includes(usuario.rol);

  const { data: medicamentos, loading, error, reload } = useFetch("/farmacia");
  const { data: pacientes } = useFetch("/pacientes", { enabled: puedeGestionar });

  const [nuevoMed, setNuevoMed] = useState({ nombre: "", tipo: "", presentacion: "", stock: "", stockMinimo: "10", precioVenta: "", fechaVencimiento: "", proveedor: "" });
  const [mov, setMov] = useState({ medicamentoId: "", tipo: "entrada", cantidad: "", motivo: "compra", pacienteId: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (!mov.medicamentoId && medicamentos?.length) setMov((m) => ({ ...m, medicamentoId: medicamentos[0].id }));
  }, [medicamentos]); // eslint-disable-line

  const alertas = (medicamentos || []).filter((m) => m.estado.includes("stock_bajo") || m.estado.includes("por_vencer"));

  async function crearMedicamento(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post("/farmacia", {
        ...nuevoMed,
        stock: Number(nuevoMed.stock || 0),
        stockMinimo: Number(nuevoMed.stockMinimo || 10),
        precioVenta: Number(nuevoMed.precioVenta || 0),
      });
      setMensaje({ tone: "success", texto: "Medicamento agregado al inventario." });
      setNuevoMed({ nombre: "", tipo: "", presentacion: "", stock: "", stockMinimo: "10", precioVenta: "", fechaVencimiento: "", proveedor: "" });
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  async function registrarMovimiento(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      const path = mov.tipo === "entrada" ? `/farmacia/${mov.medicamentoId}/entradas` : `/farmacia/${mov.medicamentoId}/salidas`;
      const body = mov.tipo === "entrada"
        ? { cantidad: Number(mov.cantidad), motivo: "compra" }
        : { cantidad: Number(mov.cantidad), motivo: mov.motivo, pacienteId: mov.motivo === "uso intrahospitalario" ? Number(mov.pacienteId) : undefined };
      await api.post(path, body);
      setMensaje({ tone: "success", texto: "Movimiento registrado." });
      setMov((m) => ({ ...m, cantidad: "" }));
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <PageHeader title="Farmacia — Inventario de Medicamentos" subtitle="Módulo independiente, con facturación propia" />

      {alertas.length > 0 && (
        <Banner tone="error">
          ⚠ {alertas.filter((a) => a.estado.includes("stock_bajo")).length} medicamento(s) con stock bajo el mínimo ·{" "}
          {alertas.filter((a) => a.estado.includes("por_vencer")).length} próximo(s) a vencer (RF-25, RF-26)
        </Banner>
      )}
      {error && <Banner tone="error">{error}</Banner>}

      <Table
        headers={["Medicamento", "Tipo", "Stock", "Precio venta", "Vencimiento", "Proveedor", "Estado"]}
        rows={loading ? [] : medicamentos || []}
        emptyMessage={loading ? "Cargando…" : "Sin medicamentos registrados."}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3">{r.nombre}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.tipo || "—"}</td>
            <td className="px-4 py-3">{r.stock}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>Q{Number(r.precioVenta).toFixed(2)}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.fechaVencimiento ? new Date(r.fechaVencimiento).toLocaleDateString() : "—"}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.proveedor || "—"}</td>
            <td className="px-4 py-3 font-semibold" style={{ color: r.estado.includes("ok") ? COLORS.green : COLORS.red }}>
              {r.estado.map((e) => ESTADO_LABEL[e]).join(" · ")}
            </td>
          </>
        )}
      />

      {puedeGestionar && (
        <>
          <Card style={{ marginTop: 16 }}>
            <div className="font-semibold text-sm mb-3">Registrar entrada / salida (kardex — RNF-10)</div>
            {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
            <form onSubmit={registrarMovimiento} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField label="Medicamento">
                <Select required value={mov.medicamentoId} onChange={(e) => setMov((m) => ({ ...m, medicamentoId: e.target.value }))}>
                  {(medicamentos || []).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </Select>
              </FormField>
              <FormField label="Movimiento">
                <Select value={mov.tipo} onChange={(e) => setMov((m) => ({ ...m, tipo: e.target.value }))}>
                  <option value="entrada">Entrada (RF-23)</option>
                  <option value="salida">Salida (RF-24)</option>
                </Select>
              </FormField>
              {mov.tipo === "salida" && (
                <FormField label="Motivo">
                  <Select value={mov.motivo} onChange={(e) => setMov((m) => ({ ...m, motivo: e.target.value }))}>
                    <option value="venta directa">Venta directa (RF-20/27)</option>
                    <option value="uso intrahospitalario">Uso intrahospitalario (RF-15)</option>
                  </Select>
                </FormField>
              )}
              <FormField label="Cantidad"><TextInput type="number" min="1" required value={mov.cantidad} onChange={(e) => setMov((m) => ({ ...m, cantidad: e.target.value }))} /></FormField>
              {mov.tipo === "salida" && mov.motivo === "uso intrahospitalario" && (
                <FormField label="Paciente">
                  <Select required value={mov.pacienteId} onChange={(e) => setMov((m) => ({ ...m, pacienteId: e.target.value }))}>
                    <option value="">Seleccionar…</option>
                    {(pacientes || []).map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                  </Select>
                </FormField>
              )}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={guardando}>{guardando ? "Registrando…" : "Registrar movimiento"}</Button>
              </div>
            </form>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="font-semibold text-sm mb-3">+ Nuevo medicamento (RF-22)</div>
            <form onSubmit={crearMedicamento} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField label="Nombre"><TextInput required value={nuevoMed.nombre} onChange={(e) => setNuevoMed((f) => ({ ...f, nombre: e.target.value }))} /></FormField>
              <FormField label="Tipo"><TextInput value={nuevoMed.tipo} onChange={(e) => setNuevoMed((f) => ({ ...f, tipo: e.target.value }))} /></FormField>
              <FormField label="Presentación"><TextInput value={nuevoMed.presentacion} onChange={(e) => setNuevoMed((f) => ({ ...f, presentacion: e.target.value }))} /></FormField>
              <FormField label="Proveedor"><TextInput value={nuevoMed.proveedor} onChange={(e) => setNuevoMed((f) => ({ ...f, proveedor: e.target.value }))} /></FormField>
              <FormField label="Stock inicial"><TextInput type="number" min="0" value={nuevoMed.stock} onChange={(e) => setNuevoMed((f) => ({ ...f, stock: e.target.value }))} /></FormField>
              <FormField label="Stock mínimo"><TextInput type="number" min="0" value={nuevoMed.stockMinimo} onChange={(e) => setNuevoMed((f) => ({ ...f, stockMinimo: e.target.value }))} /></FormField>
              <FormField label="Precio de venta (Q)"><TextInput type="number" step="0.01" min="0" value={nuevoMed.precioVenta} onChange={(e) => setNuevoMed((f) => ({ ...f, precioVenta: e.target.value }))} /></FormField>
              <FormField label="Fecha de vencimiento"><TextInput type="date" value={nuevoMed.fechaVencimiento} onChange={(e) => setNuevoMed((f) => ({ ...f, fechaVencimiento: e.target.value }))} /></FormField>
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Agregar medicamento"}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
