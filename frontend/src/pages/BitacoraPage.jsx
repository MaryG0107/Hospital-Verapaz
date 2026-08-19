import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Banner } from "../components/Banner";
import { FormField, Select, TextArea } from "../components/FormField";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

export function BitacoraPage({ pacienteIdInicial }) {
  const { usuario } = useAuth();
  const puedeRegistrar = [ROLES.ENFERMERIA, ROLES.RECEPCION, ROLES.ADMIN].includes(usuario.rol);

  const { data: pacientes } = useFetch("/pacientes");
  const [pacienteId, setPacienteId] = useState(pacienteIdInicial || null);

  useEffect(() => {
    if (!pacienteId && pacientes?.length) setPacienteId(pacientes[0].id);
  }, [pacientes, pacienteId]);

  const { data: visitas, loading, error, reload } = useFetch(pacienteId ? `/bitacora?pacienteId=${pacienteId}` : null, { enabled: !!pacienteId });

  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post("/bitacora", { pacienteId, descripcion });
      setMensaje({ tone: "success", texto: "Visita registrada." });
      setDescripcion("");
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <PageHeader title="Bitácora de Visitas" subtitle="Registro de cada visita/consulta: qué se hizo y quién lo hizo (RF-28)" />
      <div className="mb-4">
        <Select value={pacienteId || ""} onChange={(e) => setPacienteId(Number(e.target.value))} style={{ maxWidth: 360 }}>
          {(pacientes || []).map((p) => (
            <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.historiaClinica}</option>
          ))}
        </Select>
      </div>

      {error && <Banner tone="error">{error}</Banner>}
      <Card>
        {loading ? (
          <div className="text-sm" style={{ color: "#888" }}>Cargando…</div>
        ) : !visitas?.length ? (
          <div className="text-sm" style={{ color: "#888" }}>Sin visitas registradas para este paciente.</div>
        ) : (
          visitas.map((v, i) => (
            <div key={v.id} className="flex gap-4 py-3" style={i > 0 ? { borderTop: `1px solid ${COLORS.border}` } : {}}>
              <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ backgroundColor: COLORS.gold, flexShrink: 0 }} />
              <div style={{ width: 180, flexShrink: 0, color: "#888" }} className="text-xs font-semibold">{new Date(v.fecha).toLocaleString()}</div>
              <div>
                <div className="text-sm font-semibold">{v.autor?.nombre} — {v.autor?.rol}</div>
                <div className="text-xs mt-0.5" style={{ color: "#888" }}>{v.descripcion}</div>
              </div>
            </div>
          ))
        )}
      </Card>

      {puedeRegistrar && (
        <Card style={{ marginTop: 16 }}>
          <div className="font-semibold text-sm mb-3">+ Registrar visita</div>
          {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Descripción">
              <TextArea required rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </FormField>
            <div>
              <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Registrar visita"}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
