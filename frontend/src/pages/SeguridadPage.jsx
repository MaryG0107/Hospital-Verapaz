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
import { ROLES, ROLE_LABELS } from "../utils/roles";

const MINUTOS_EN_LINEA = 5;

function estadoConexion(ultimaActividad) {
  if (!ultimaActividad) return { enLinea: false, texto: "Nunca ha entrado" };
  const minutos = (Date.now() - new Date(ultimaActividad).getTime()) / 60000;
  if (minutos <= MINUTOS_EN_LINEA) return { enLinea: true, texto: "En línea" };
  if (minutos < 60) return { enLinea: false, texto: `Hace ${Math.round(minutos)} min` };
  if (minutos < 1440) return { enLinea: false, texto: `Hace ${Math.round(minutos / 60)} h` };
  return { enLinea: false, texto: new Date(ultimaActividad).toLocaleDateString() };
}

export function SeguridadPage() {
  const { usuario } = useAuth();

  if (usuario.rol !== ROLES.ADMIN) {
    return (
      <div>
        <PageHeader title="Seguridad y Roles de Usuario" />
        <Card>
          <div className="font-semibold text-sm mb-2">🔑 Tokens de acceso temporal</div>
          <p className="text-sm" style={{ color: "#666" }}>
            El Administrador asigna roles, funciones y permisos de token (RF-29, RF-30, RF-32, RF-33, RF-34).
            Duración del token: 5–15 minutos · Un solo uso. Solicítelo en el módulo de Expediente Clínico si necesita ver un diagnóstico.
          </p>
        </Card>
      </div>
    );
  }

  return <SeguridadAdmin />;
}

function SeguridadAdmin() {
  const { data: usuarios, loading, error, reload } = useFetch("/usuarios");

  const [nuevo, setNuevo] = useState({ nombre: "", correo: "", password: "", rol: ROLES.RECEPCION, puedeAutogenerarToken: false });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [tokenForm, setTokenForm] = useState({ usuarioId: "" });
  const [tokenResultado, setTokenResultado] = useState(null);
  const [emitiendoToken, setEmitiendoToken] = useState(false);

  // Refresca el estado "en linea" periodicamente sin que el Administrador tenga que recargar la pagina
  useEffect(() => {
    const intervalo = setInterval(reload, 30000);
    return () => clearInterval(intervalo);
  }, [reload]);

  async function crearUsuario(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api.post("/usuarios", nuevo);
      setMensaje({ tone: "success", texto: "Usuario creado." });
      setNuevo({ nombre: "", correo: "", password: "", rol: ROLES.RECEPCION, puedeAutogenerarToken: false });
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  async function actualizarUsuario(id, cambios) {
    try {
      await api.put(`/usuarios/${id}`, cambios);
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    }
  }

  async function emitirToken(e) {
    e.preventDefault();
    setEmitiendoToken(true);
    setTokenResultado(null);
    try {
      const data = await api.post("/auth/token", { usuarioId: Number(tokenForm.usuarioId) });
      setTokenResultado(data);
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setEmitiendoToken(false);
    }
  }

  return (
    <div>
      <PageHeader title="Seguridad y Roles de Usuario" subtitle="El Administrador asigna roles, funciones y permisos de token (RF-29, RF-30, RF-32, RF-33, RF-34)" />
      {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      <Table
        headers={["Usuario", "Correo", "Rol", "Autogenera token", "Estado"]}
        rows={loading ? [] : usuarios || []}
        emptyMessage={loading ? "Cargando…" : "Sin usuarios registrados."}
        renderRow={(u) => {
          const estado = estadoConexion(u.ultimaActividad);
          return (
            <>
              <td className="px-4 py-3 font-semibold">{u.nombre}</td>
              <td className="px-4 py-3" style={{ color: "#666" }}>{u.correo}</td>
              <td className="px-4 py-3">
                <Select value={u.rol} onChange={(e) => actualizarUsuario(u.id, { rol: e.target.value })} style={{ margin: 0, width: "auto" }}>
                  {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </Select>
              </td>
              <td className="px-4 py-3">
                <label className="flex items-center gap-2 text-xs" style={{ color: "#666" }}>
                  <input type="checkbox" checked={u.puedeAutogenerarToken} onChange={(e) => actualizarUsuario(u.id, { puedeAutogenerarToken: e.target.checked })} />
                  RF-34
                </label>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: estado.enLinea ? COLORS.green : "#888" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: estado.enLinea ? COLORS.green : "#C4C9D4" }} />
                  {estado.texto}
                </span>
              </td>
            </>
          );
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <div className="font-semibold text-sm mb-3">+ Nuevo usuario</div>
          <form onSubmit={crearUsuario} className="flex flex-col gap-4">
            <FormField label="Nombre"><TextInput required value={nuevo.nombre} onChange={(e) => setNuevo((f) => ({ ...f, nombre: e.target.value }))} /></FormField>
            <FormField label="Correo"><TextInput type="email" required value={nuevo.correo} onChange={(e) => setNuevo((f) => ({ ...f, correo: e.target.value }))} /></FormField>
            <FormField label="Contraseña temporal"><TextInput type="password" required value={nuevo.password} onChange={(e) => setNuevo((f) => ({ ...f, password: e.target.value }))} /></FormField>
            <FormField label="Rol">
              <Select value={nuevo.rol} onChange={(e) => setNuevo((f) => ({ ...f, rol: e.target.value }))}>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </FormField>
            <label className="flex items-center gap-2 text-sm" style={{ color: "#444" }}>
              <input type="checkbox" checked={nuevo.puedeAutogenerarToken} onChange={(e) => setNuevo((f) => ({ ...f, puedeAutogenerarToken: e.target.checked }))} />
              Puede autogenerar sus propios tokens (RF-34)
            </label>
            <div>
              <Button type="submit" disabled={guardando}>{guardando ? "Creando…" : "Crear usuario"}</Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="font-semibold text-sm mb-1">🔑 Emitir token de acceso temporal (RF-33)</div>
          <p className="text-xs mb-3" style={{ color: "#888" }}>Genera un token de un solo uso para que un usuario consulte el diagnóstico confidencial. Cópielo y compártalo por un canal seguro: solo se muestra una vez.</p>
          <form onSubmit={emitirToken} className="flex flex-col gap-4">
            <FormField label="Usuario">
              <Select required value={tokenForm.usuarioId} onChange={(e) => setTokenForm({ usuarioId: e.target.value })}>
                <option value="">Seleccionar…</option>
                {(usuarios || []).filter((u) => u.rol !== ROLES.ADMIN).map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre} ({ROLE_LABELS[u.rol]})</option>
                ))}
              </Select>
            </FormField>
            <div>
              <Button type="submit" disabled={emitiendoToken}>{emitiendoToken ? "Generando…" : "Generar token"}</Button>
            </div>
          </form>
          {tokenResultado && (
            <div className="rounded-xl p-3 text-sm mt-3" style={{ backgroundColor: "#FAFAFB", border: `1px solid ${COLORS.border}` }}>
              <div className="font-mono text-xs break-all">{tokenResultado.token}</div>
              <div className="text-xs mt-1" style={{ color: "#888" }}>Expira: {new Date(tokenResultado.expiraEn).toLocaleString()}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
