import React, { useEffect, useState } from "react";
import { ShoppingCart, Trash2, Printer } from "lucide-react";
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

const ESTADO_LABEL = { ok: "OK", stock_bajo: "Stock bajo", por_vencer: "Por vencer" };

export function FarmaciaPage() {
  const { usuario } = useAuth();
  const puedeGestionar = [ROLES.FARMACIA, ROLES.ADMIN].includes(usuario.rol);

  const { data: medicamentos, loading, error, reload } = useFetch("/farmacia");
  const { data: pacientes } = useFetch("/pacientes", { enabled: puedeGestionar });
  const { data: facturas, reload: reloadFacturas } = useFetch("/farmacia/ventas", { enabled: puedeGestionar });

  const [nuevoMed, setNuevoMed] = useState({ nombre: "", tipo: "", presentacion: "", stock: "", stockMinimo: "10", precioVenta: "", fechaVencimiento: "", proveedor: "" });
  const [mov, setMov] = useState({ medicamentoId: "", cantidad: "", pacienteId: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Carrito de venta directa (RF-20/RF-24/RF-27): varios medicamentos en una sola factura
  const [carrito, setCarrito] = useState([]);
  const [itemForm, setItemForm] = useState({ medicamentoId: "", cantidad: "1" });
  const [carritoPacienteId, setCarritoPacienteId] = useState("");
  const [cobrando, setCobrando] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState(null);
  const [facturaImprimir, setFacturaImprimir] = useState(null);

  useEffect(() => {
    if (!mov.medicamentoId && medicamentos?.length) setMov((m) => ({ ...m, medicamentoId: medicamentos[0].id }));
    if (!itemForm.medicamentoId && medicamentos?.length) setItemForm((f) => ({ ...f, medicamentoId: medicamentos[0].id }));
  }, [medicamentos]); // eslint-disable-line

  const alertas = (medicamentos || []).filter((m) => m.estado.includes("stock_bajo") || m.estado.includes("por_vencer"));
  const totalCarrito = carrito.reduce((suma, i) => suma + i.precioVenta * i.cantidad, 0);

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

  // RF-24/RF-15: salida por uso intrahospitalario (un medicamento, cargado al costeo del paciente)
  async function registrarMovimiento(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post(`/farmacia/${mov.medicamentoId}/salidas`, { cantidad: Number(mov.cantidad), pacienteId: Number(mov.pacienteId) });
      setMensaje({ tone: "success", texto: "Movimiento registrado y cargado al costeo del paciente." });
      setMov((m) => ({ ...m, cantidad: "", pacienteId: "" }));
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  function agregarAlCarrito() {
    const medicamento = (medicamentos || []).find((m) => m.id === Number(itemForm.medicamentoId));
    const cantidad = Number(itemForm.cantidad);
    if (!medicamento || !cantidad || cantidad <= 0) return;

    setCarrito((c) => {
      const existente = c.find((i) => i.medicamentoId === medicamento.id);
      if (existente) {
        return c.map((i) => (i.medicamentoId === medicamento.id ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...c, { medicamentoId: medicamento.id, nombre: medicamento.nombre, precioVenta: Number(medicamento.precioVenta), cantidad }];
    });
    setItemForm((f) => ({ ...f, cantidad: "1" }));
  }

  function quitarDelCarrito(medicamentoId) {
    setCarrito((c) => c.filter((i) => i.medicamentoId !== medicamentoId));
  }

  async function cobrarCarrito() {
    setCobrando(true);
    setMensajeCarrito(null);
    try {
      const factura = await api.post("/farmacia/ventas", {
        pacienteId: carritoPacienteId || undefined,
        items: carrito.map((i) => ({ medicamentoId: i.medicamentoId, cantidad: i.cantidad })),
      });
      setMensajeCarrito({ tone: "success", texto: `Factura #${factura.id} generada por Q${Number(factura.montoTotal).toFixed(2)}` });
      setCarrito([]);
      setCarritoPacienteId("");
      reload();
      reloadFacturas();
    } catch (err) {
      setMensajeCarrito({ tone: "error", texto: err.message });
    } finally {
      setCobrando(false);
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
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart size={16} style={{ color: COLORS.navy }} />
              <div className="font-semibold text-sm">Venta directa (RF-20/RF-24/RF-27)</div>
            </div>
            <p className="text-xs mb-4" style={{ color: "#888" }}>
              Agregue uno o varios medicamentos al carrito. Puede asociarla a un paciente (para su registro) o dejarla sin paciente. Al cobrar se genera una sola factura con el detalle de cada medicamento.
            </p>
            {mensajeCarrito && <Banner tone={mensajeCarrito.tone}>{mensajeCarrito.texto}</Banner>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
              <FormField label="Medicamento">
                <Select value={itemForm.medicamentoId} onChange={(e) => setItemForm((f) => ({ ...f, medicamentoId: e.target.value }))}>
                  {(medicamentos || []).map((m) => <option key={m.id} value={m.id}>{m.nombre} (Q{Number(m.precioVenta).toFixed(2)})</option>)}
                </Select>
              </FormField>
              <FormField label="Cantidad">
                <TextInput type="number" min="1" value={itemForm.cantidad} onChange={(e) => setItemForm((f) => ({ ...f, cantidad: e.target.value }))} />
              </FormField>
              <div>
                <Button variant="secondary" onClick={agregarAlCarrito}>+ Agregar al carrito</Button>
              </div>
            </div>

            {carrito.length > 0 && (
              <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F7F8FB" }}>
                      <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "#888" }}>Medicamento</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "#888" }}>Cant.</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "#888" }}>Subtotal</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((i) => (
                      <tr key={i.medicamentoId} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <td className="px-3 py-2">{i.nombre}</td>
                        <td className="px-3 py-2 text-right">{i.cantidad}</td>
                        <td className="px-3 py-2 text-right">Q{(i.precioVenta * i.cantidad).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => quitarDelCarrito(i.medicamentoId)} className="text-gray-400 hover:text-red-500" aria-label="Quitar">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <FormField label="Paciente (opcional)">
                <Select value={carritoPacienteId} onChange={(e) => setCarritoPacienteId(e.target.value)} style={{ minWidth: 260 }}>
                  <option value="">Sin paciente (venta mostrador)</option>
                  {(pacientes || []).map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.historiaClinica}</option>)}
                </Select>
              </FormField>
              <div className="flex-1 text-right sm:text-left">
                <div className="text-xs font-semibold" style={{ color: "#888" }}>TOTAL</div>
                <div className="text-xl font-bold" style={{ color: COLORS.navy }}>Q{totalCarrito.toFixed(2)}</div>
              </div>
              <Button onClick={cobrarCarrito} disabled={carrito.length === 0 || cobrando}>
                {cobrando ? "Generando factura…" : "Cobrar y generar factura"}
              </Button>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="font-semibold text-sm mb-3">Salida por uso intrahospitalario (RF-15)</div>
            {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
            <form onSubmit={registrarMovimiento} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <FormField label="Medicamento">
                <Select required value={mov.medicamentoId} onChange={(e) => setMov((m) => ({ ...m, medicamentoId: e.target.value }))}>
                  {(medicamentos || []).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </Select>
              </FormField>
              <FormField label="Cantidad"><TextInput type="number" min="1" required value={mov.cantidad} onChange={(e) => setMov((m) => ({ ...m, cantidad: e.target.value }))} /></FormField>
              <FormField label="Paciente">
                <Select required value={mov.pacienteId} onChange={(e) => setMov((m) => ({ ...m, pacienteId: e.target.value }))}>
                  <option value="">Seleccionar…</option>
                  {(pacientes || []).map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                </Select>
              </FormField>
              <div>
                <Button type="submit" disabled={guardando}>{guardando ? "Registrando…" : "Registrar"}</Button>
              </div>
            </form>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="font-semibold text-sm mb-3">Facturas de farmacia recientes</div>
            <Table
              headers={["Factura", "Paciente", "Medicamentos", "Total", "Fecha", ""]}
              rows={facturas || []}
              emptyMessage="Sin ventas registradas."
              renderRow={(f) => (
                <>
                  <td className="px-4 py-3 font-semibold">#{f.id}</td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>{f.paciente?.nombreCompleto || "Venta mostrador"}</td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>{f.items.map((i) => i.medicamento.nombre).join(", ")}</td>
                  <td className="px-4 py-3 font-semibold">Q{Number(f.montoTotal).toFixed(2)}</td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>{new Date(f.creadoEn).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setFacturaImprimir(f)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: COLORS.navy }}>
                      <Printer size={13} /> Imprimir
                    </button>
                  </td>
                </>
              )}
            />
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

      <Modal open={!!facturaImprimir} onClose={() => setFacturaImprimir(null)} title="Factura de farmacia" maxWidth={560}>
        {facturaImprimir && (
          <DocumentoImprimible
            titulo="Factura de Farmacia"
            subtitulo={`No. ${facturaImprimir.id} · ${new Date(facturaImprimir.creadoEn).toLocaleString()}`}
          >
            {facturaImprimir.paciente ? (
              <div className="text-sm mb-4">
                <div><strong>Paciente:</strong> {facturaImprimir.paciente.nombreCompleto}</div>
                <div><strong>Historia clínica:</strong> {facturaImprimir.paciente.historiaClinica}</div>
                {facturaImprimir.paciente.dpi && <div><strong>DPI:</strong> {facturaImprimir.paciente.dpi}</div>}
              </div>
            ) : (
              <div className="text-sm mb-4" style={{ color: "#666" }}>Venta de mostrador (sin paciente asociado)</div>
            )}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <th className="text-left py-1.5">Medicamento</th>
                  <th className="text-right py-1.5">Cant.</th>
                  <th className="text-right py-1.5">Precio</th>
                  <th className="text-right py-1.5">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaImprimir.items.map((i) => (
                  <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td className="py-1.5">{i.medicamento.nombre}</td>
                    <td className="text-right py-1.5">{i.cantidad}</td>
                    <td className="text-right py-1.5">Q{Number(i.precioUnitario).toFixed(2)}</td>
                    <td className="text-right py-1.5">Q{Number(i.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-base mb-4">Total: Q{Number(facturaImprimir.montoTotal).toFixed(2)}</div>
            <div className="text-xs" style={{ color: "#888" }}>Atendido por: {facturaImprimir.registrador?.nombre}</div>
          </DocumentoImprimible>
        )}
      </Modal>
    </div>
  );
}
