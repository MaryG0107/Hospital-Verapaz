import React, { useEffect, useState } from "react";
import { ShieldAlert, KeyRound } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Banner } from "../components/Banner";
import { Modal } from "../components/Modal";
import { FormField, TextInput, Select, TextArea } from "../components/FormField";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles/tokens";
import { ROLES } from "../utils/roles";

export function ExpedientePage({ pacienteIdInicial }) {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === ROLES.ADMIN;

  const { data: pacientes } = useFetch("/pacientes");
  const [selectedId, setSelectedId] = useState(pacienteIdInicial || null);

  useEffect(() => {
    if (!selectedId && pacientes?.length) setSelectedId(pacientes[0].id);
  }, [pacientes, selectedId]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [diagnostico, setDiagnostico] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | cargando | visible | sin-registro
  const [mensajeError, setMensajeError] = useState(null);

  const [texto, setTexto] = useState("");
  const [codigoCie, setCodigoCie] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(null);

  function headersToken() {
    return esAdmin ? {} : { "x-temp-token": tempToken };
  }

  function abrirModal() {
    setMensajeError(null);
    setModalAbierto(true);
  }

  async function autogenerarToken() {
    setMensajeError(null);
    try {
      const data = await api.post("/auth/token/auto", { pacienteId: selectedId });
      setTempToken(data.token);
      setTokenInfo(`Token generado, expira ${new Date(data.expiraEn).toLocaleTimeString()}`);
    } catch (err) {
      setMensajeError(err.message);
    }
  }

  // RF-11: el Administrador confirma sin token; los demas roles necesitan
  // uno vigente (RF-33/RF-34). El modal es el unico punto de entrada para
  // ver el diagnostico, para dejar claro que es una accion sensible (RNF-08).
  async function confirmarYVer() {
    setEstado("cargando");
    setMensajeError(null);
    try {
      const data = await api.get(`/expedientes/paciente/${selectedId}`, { headers: headersToken() });
      setDiagnostico(data);
      setEstado("visible");
      setModalAbierto(false);
      // el token es de un solo uso (RNF-12): ya se consumio al verificar,
      // asi que no lo dejamos activo para el formulario de "Registrar diagnostico"
      setTempToken("");
      setTokenInfo(null);
    } catch (err) {
      if (err.message.includes("no tiene diagnostico")) {
        setEstado("sin-registro");
        setModalAbierto(false);
      } else {
        setEstado("idle");
        setMensajeError(err.message);
      }
    }
  }

  async function guardarDiagnostico(e) {
    e.preventDefault();
    setGuardando(true);
    setMensajeGuardado(null);
    try {
      await api.post(`/expedientes/paciente/${selectedId}`, { texto, codigoCie }, { headers: headersToken() });
      setMensajeGuardado({ tone: "success", texto: "Diagnóstico registrado correctamente." });
      setTexto("");
      setCodigoCie("");
      setEstado("idle");
      setDiagnostico(null);
    } catch (err) {
      setMensajeGuardado({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  const patient = pacientes?.find((p) => p.id === selectedId);

  return (
    <div>
      <PageHeader title="Expediente Clínico" />
      <div className="mb-4">
        <Select
          value={selectedId || ""}
          onChange={(e) => {
            setSelectedId(Number(e.target.value));
            setEstado("idle");
            setDiagnostico(null);
            setTempToken("");
            setTokenInfo(null);
          }}
          style={{ maxWidth: 360 }}
        >
          {(pacientes || []).map((p) => (
            <option key={p.id} value={p.id}>{p.nombreCompleto} — {p.historiaClinica}</option>
          ))}
        </Select>
      </div>

      {patient && (
        <Card style={{ marginBottom: 16 }}>
          <div className="font-semibold text-sm mb-2">Datos básicos del paciente</div>
          <div className="text-sm" style={{ color: "#666" }}>
            {patient.nombreCompleto} · {patient.historiaClinica} · {patient.edad ?? "—"} años · {patient.sexo ?? "—"}
          </div>
        </Card>
      )}

      <div className="mb-4">
        <Button onClick={abrirModal} disabled={!selectedId}>
          {estado === "cargando" ? "Consultando…" : "Ver diagnóstico"}
        </Button>
      </div>

      {estado === "visible" && diagnostico && (
        <Card style={{ border: `2px solid ${COLORS.gold}`, marginBottom: 16 }}>
          <div className="font-semibold text-sm mb-1">🔓 Diagnóstico confidencial</div>
          <p className="text-xs mb-3" style={{ color: "#888" }}>
            Código CIE: {diagnostico.codigoCie || "—"} · Registrado: {new Date(diagnostico.creadoEn).toLocaleString()}
          </p>
          <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "#FAFAFB", border: `1px solid ${COLORS.border}` }}>
            {diagnostico.diagnostico}
          </div>
        </Card>
      )}

      {estado === "sin-registro" && <Banner tone="info">Este paciente todavía no tiene un diagnóstico registrado.</Banner>}

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Información médica confidencial" icon={ShieldAlert}>
        <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>
          Está por ver el diagnóstico confidencial de <strong style={{ color: COLORS.text }}>{patient?.nombreCompleto}</strong>.
          Esta acción queda registrada a su nombre (RNF-08).
        </p>

        {mensajeError && <Banner tone="error">{mensajeError}</Banner>}

        {esAdmin ? (
          <Button onClick={confirmarYVer} disabled={estado === "cargando"}>
            {estado === "cargando" ? "Verificando…" : "Continuar y ver diagnóstico"}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <FormField label="Token de acceso temporal (RF-33)">
              <TextInput value={tempToken} onChange={(e) => setTempToken(e.target.value)} placeholder="Pegue aquí el token" />
            </FormField>
            {tokenInfo && <p className="text-xs -mt-1" style={{ color: COLORS.green }}>{tokenInfo}</p>}
            {usuario.puedeAutogenerarToken ? (
              <Button variant="secondary" onClick={autogenerarToken}>
                <span className="flex items-center gap-1.5"><KeyRound size={14} /> Autogenerar token (RF-34)</span>
              </Button>
            ) : (
              <p className="text-xs" style={{ color: "#888" }}>No tiene permiso para autogenerar tokens. Solicítelo al Administrador desde Seguridad y Roles.</p>
            )}
            <Button onClick={confirmarYVer} disabled={!tempToken || estado === "cargando"}>
              {estado === "cargando" ? "Verificando…" : "Confirmar y ver diagnóstico"}
            </Button>
          </div>
        )}
      </Modal>

      {(esAdmin || tempToken) && (
        <Card>
          <div className="font-semibold text-sm mb-3">Registrar diagnóstico (RF-10)</div>
          {mensajeGuardado && <Banner tone={mensajeGuardado.tone}>{mensajeGuardado.texto}</Banner>}
          <form onSubmit={guardarDiagnostico} className="flex flex-col gap-4">
            <FormField label="Diagnóstico">
              <TextArea required rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} />
            </FormField>
            <FormField label="Código CIE (opcional)">
              <TextInput value={codigoCie} onChange={(e) => setCodigoCie(e.target.value)} style={{ maxWidth: 200 }} />
            </FormField>
            <div>
              <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Guardar diagnóstico"}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
