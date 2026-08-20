import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Button } from "../components/Button";
import { Banner } from "../components/Banner";
import { Modal } from "../components/Modal";
import { DocumentoImprimible } from "../components/DocumentoImprimible";
import { FormField, TextInput, Select, TextArea } from "../components/FormField";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

export function TratamientoPage({ pacienteIdInicial }) {
  const { usuario } = useAuth();
  const puedeRegistrar = [ROLES.ENFERMERIA, ROLES.CONSULTA, ROLES.ADMIN].includes(usuario.rol);
  const puedeRecetar = [ROLES.CONSULTA, ROLES.ADMIN].includes(usuario.rol);

  const { data: pacientes } = useFetch("/pacientes");
  const [pacienteId, setPacienteId] = useState(pacienteIdInicial || null);

  useEffect(() => {
    if (!pacienteId && pacientes?.length) setPacienteId(pacientes[0].id);
  }, [pacientes, pacienteId]);

  const { data: items, loading, error, reload } = useFetch(pacienteId ? `/tratamientos?pacienteId=${pacienteId}` : null, { enabled: !!pacienteId });
  const { data: recetas, loading: cargandoRecetas, reload: reloadRecetas } = useFetch(pacienteId ? `/recetas?pacienteId=${pacienteId}` : null, { enabled: !!pacienteId });

  const [form, setForm] = useState({ descripcion: "", dosis: "", costo: "", origen: "intrahospitalario" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [recetaForm, setRecetaForm] = useState({ medicamento: "", dosis: "", indicaciones: "", duracion: "" });
  const [guardandoReceta, setGuardandoReceta] = useState(false);
  const [mensajeReceta, setMensajeReceta] = useState(null);
  const [recetaImprimir, setRecetaImprimir] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post("/tratamientos", { ...form, pacienteId, costo: Number(form.costo) });
      setMensaje({ tone: "success", texto: "Registrado correctamente." });
      setForm({ descripcion: "", dosis: "", costo: "", origen: "intrahospitalario" });
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  async function handleSubmitReceta(e) {
    e.preventDefault();
    setGuardandoReceta(true);
    setMensajeReceta(null);
    try {
      await api.post("/recetas", { ...recetaForm, pacienteId });
      setMensajeReceta({ tone: "success", texto: "Receta registrada correctamente." });
      setRecetaForm({ medicamento: "", dosis: "", indicaciones: "", duracion: "" });
      reloadRecetas();
    } catch (err) {
      setMensajeReceta({ tone: "error", texto: err.message });
    } finally {
      setGuardandoReceta(false);
    }
  }

  const patient = pacientes?.find((p) => p.id === pacienteId);

  return (
    <div>
      <PageHeader title="Tratamiento y Medicamentos Intrahospitalarios" subtitle={patient ? `Paciente: ${patient.nombreCompleto} · ${patient.historiaClinica}` : undefined} />
      <div className="mb-4">
        <Select value={pacienteId || ""} onChange={(e) => setPacienteId(Number(e.target.value))} style={{ maxWidth: 360 }}>
          {(pacientes || []).map((p) => (
            <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.historiaClinica}</option>
          ))}
        </Select>
      </div>

      {error && <Banner tone="error">{error}</Banner>}
      <Table
        headers={["Medicamento / Procedimiento", "Dosis", "Fecha", "Costo", "Origen"]}
        rows={loading ? [] : items || []}
        emptyMessage={loading ? "Cargando…" : "Sin registros para este paciente."}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3">{r.descripcion}</td>
            <td className="px-4 py-3">{r.dosis || "—"}</td>
            <td className="px-4 py-3">{new Date(r.fecha).toLocaleString()}</td>
            <td className="px-4 py-3">Q{Number(r.costo).toFixed(2)}</td>
            <td className="px-4 py-3" style={{ color: r.origen === "farmacia" ? COLORS.teal : "#333", fontWeight: r.origen === "farmacia" ? 600 : 400 }}>
              {r.origen === "farmacia" ? "Farmacia (venta directa)" : "Intrahospitalario"}
            </td>
          </>
        )}
      />

      {puedeRegistrar && (
        <Card style={{ marginTop: 16 }}>
          <div className="font-semibold text-sm mb-3">+ Registrar medicamento / procedimiento</div>
          {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <FormField label="Descripción"><TextInput required value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} /></FormField>
            <FormField label="Dosis"><TextInput value={form.dosis} onChange={(e) => setForm((f) => ({ ...f, dosis: e.target.value }))} /></FormField>
            <FormField label="Costo (Q)"><TextInput type="number" step="0.01" min="0" required value={form.costo} onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))} /></FormField>
            <FormField label="Origen">
              <Select value={form.origen} onChange={(e) => setForm((f) => ({ ...f, origen: e.target.value }))}>
                <option value="intrahospitalario">Intrahospitalario</option>
                <option value="farmacia">Farmacia (venta directa)</option>
              </Select>
            </FormField>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Registrar"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <div className="font-semibold text-sm mb-3">Recetas médicas</div>
        <Table
          headers={["Medicamento", "Dosis", "Duración", "Médico", "Fecha", ""]}
          rows={cargandoRecetas ? [] : recetas || []}
          emptyMessage={cargandoRecetas ? "Cargando…" : "Sin recetas registradas para este paciente."}
          renderRow={(r) => (
            <>
              <td className="px-4 py-3 font-semibold">{r.medicamento}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{r.dosis}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{r.duracion || "—"}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{r.medico?.nombre}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{new Date(r.creadoEn).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button onClick={() => setRecetaImprimir(r)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: COLORS.navy }}>
                  <Printer size={13} /> Imprimir
                </button>
              </td>
            </>
          )}
        />

        {puedeRecetar && (
          <form onSubmit={handleSubmitReceta} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mt-4">
            {mensajeReceta && <div className="col-span-1 sm:col-span-2 lg:col-span-4"><Banner tone={mensajeReceta.tone}>{mensajeReceta.texto}</Banner></div>}
            <FormField label="Medicamento"><TextInput required value={recetaForm.medicamento} onChange={(e) => setRecetaForm((f) => ({ ...f, medicamento: e.target.value }))} /></FormField>
            <FormField label="Dosis"><TextInput required placeholder="ej. 1 tableta cada 8 horas" value={recetaForm.dosis} onChange={(e) => setRecetaForm((f) => ({ ...f, dosis: e.target.value }))} /></FormField>
            <FormField label="Duración"><TextInput placeholder="ej. 7 días" value={recetaForm.duracion} onChange={(e) => setRecetaForm((f) => ({ ...f, duracion: e.target.value }))} /></FormField>
            <FormField label="Indicaciones"><TextInput placeholder="ej. Tomar con alimentos" value={recetaForm.indicaciones} onChange={(e) => setRecetaForm((f) => ({ ...f, indicaciones: e.target.value }))} /></FormField>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={guardandoReceta}>{guardandoReceta ? "Guardando…" : "Registrar receta"}</Button>
            </div>
          </form>
        )}
      </Card>

      <Modal open={!!recetaImprimir} onClose={() => setRecetaImprimir(null)} title="Receta médica" maxWidth={520}>
        {recetaImprimir && (
          <DocumentoImprimible titulo="Receta Médica" subtitulo={new Date(recetaImprimir.creadoEn).toLocaleString()}>
            <div className="text-sm mb-4">
              <div><strong>Paciente:</strong> {patient?.nombreCompleto}</div>
              <div><strong>Historia clínica:</strong> {patient?.historiaClinica}</div>
              {patient?.edad != null && <div><strong>Edad:</strong> {patient.edad} años</div>}
            </div>
            <div className="rounded-xl p-4 text-sm mb-4" style={{ border: "1px solid #ccc" }}>
              <div className="font-bold mb-1">Rp/ {recetaImprimir.medicamento}</div>
              <div className="mb-1"><strong>Dosis:</strong> {recetaImprimir.dosis}</div>
              {recetaImprimir.duracion && <div className="mb-1"><strong>Duración:</strong> {recetaImprimir.duracion}</div>}
              {recetaImprimir.indicaciones && <div><strong>Indicaciones:</strong> {recetaImprimir.indicaciones}</div>}
            </div>
            <div className="text-sm mt-8" style={{ borderTop: "1px solid #ccc", paddingTop: 8 }}>
              <strong>Médico:</strong> {recetaImprimir.medico?.nombre}
            </div>
          </DocumentoImprimible>
        )}
      </Modal>
    </div>
  );
}
