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

export function TratamientoPage({ pacienteIdInicial }) {
  const { usuario } = useAuth();
  const puedeRegistrar = [ROLES.ENFERMERIA, ROLES.CONSULTA, ROLES.ADMIN].includes(usuario.rol);

  const { data: pacientes } = useFetch("/pacientes");
  const [pacienteId, setPacienteId] = useState(pacienteIdInicial || null);

  useEffect(() => {
    if (!pacienteId && pacientes?.length) setPacienteId(pacientes[0].id);
  }, [pacientes, pacienteId]);

  const { data: items, loading, error, reload } = useFetch(pacienteId ? `/tratamientos?pacienteId=${pacienteId}` : null, { enabled: !!pacienteId });

  const [form, setForm] = useState({ descripcion: "", dosis: "", costo: "", origen: "intrahospitalario" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

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
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
            <FormField label="Descripción"><TextInput required value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} /></FormField>
            <FormField label="Dosis"><TextInput value={form.dosis} onChange={(e) => setForm((f) => ({ ...f, dosis: e.target.value }))} /></FormField>
            <FormField label="Costo (Q)"><TextInput type="number" step="0.01" min="0" required value={form.costo} onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))} /></FormField>
            <FormField label="Origen">
              <Select value={form.origen} onChange={(e) => setForm((f) => ({ ...f, origen: e.target.value }))}>
                <option value="intrahospitalario">Intrahospitalario</option>
                <option value="farmacia">Farmacia (venta directa)</option>
              </Select>
            </FormField>
            <div className="col-span-4">
              <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Registrar"}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
