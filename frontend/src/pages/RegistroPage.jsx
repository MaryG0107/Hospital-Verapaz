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
import { ROLES } from "../utils/roles";

const CAMPOS_VACIOS = {
  nombreCompleto: "", dpi: "", direccion: "", lugarNacimiento: "", fechaNacimiento: "",
  telefono: "", edad: "", sexo: "", estadoCivil: "", ocupacion: "", religion: "",
  nacionalidad: "", nombreConyuge: "", nombrePadre: "", nombreMadre: "",
  contactoEmergencia: "", parentesco: "",
};

export function RegistroPage({ onVerExpediente }) {
  const { usuario } = useAuth();
  const puedeRegistrar = [ROLES.RECEPCION, ROLES.ADMIN].includes(usuario.rol);

  const [tab, setTab] = useState("nuevo");
  const [buscarInput, setBuscarInput] = useState("");
  const [buscar, setBuscar] = useState(""); // valor con debounce, para no disparar una petición por cada tecla (RNF-07)

  useEffect(() => {
    const timeout = setTimeout(() => setBuscar(buscarInput), 300);
    return () => clearTimeout(timeout);
  }, [buscarInput]);

  const { data: pacientes, loading, error, reload } = useFetch(`/pacientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ""}`);

  const [form, setForm] = useState(CAMPOS_VACIOS);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      const paciente = await api.post("/pacientes", { ...form, edad: form.edad ? Number(form.edad) : undefined });
      setMensaje({ tone: "success", texto: `Paciente registrado con historia clínica ${paciente.historiaClinica}` });
      setForm(CAMPOS_VACIOS);
      reload();
    } catch (err) {
      setMensaje({ tone: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <PageHeader title="Registro y Admisión de Pacientes" />
      <div className="flex gap-2 mb-4">
        {puedeRegistrar && (
          <button
            onClick={() => setTab("nuevo")}
            className="px-4 py-2 rounded-md text-sm font-semibold"
            style={tab === "nuevo" ? { backgroundColor: "#1F3864", color: "white" } : { border: "1px solid #E2E4EA", backgroundColor: "white" }}
          >
            + Paciente nuevo
          </button>
        )}
        <button
          onClick={() => setTab("lista")}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={tab === "lista" ? { backgroundColor: "#1F3864", color: "white" } : { border: "1px solid #E2E4EA", backgroundColor: "white" }}
        >
          Pacientes registrados
        </button>
      </div>

      {tab === "nuevo" && puedeRegistrar ? (
        <Card>
          <p className="text-xs font-semibold mb-4" style={{ color: "#888" }}>
            Historia clínica: se genera automáticamente al guardar (RF-03). El DPI no puede repetirse (RF-04).
          </p>
          {mensaje && <Banner tone={mensaje.tone}>{mensaje.texto}</Banner>}
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <FormField label="Nombre completo"><TextInput required value={form.nombreCompleto} onChange={(e) => setCampo("nombreCompleto", e.target.value)} /></FormField>
            <FormField label="DPI"><TextInput required value={form.dpi} onChange={(e) => setCampo("dpi", e.target.value)} /></FormField>
            <FormField label="Fecha de nacimiento"><TextInput type="date" value={form.fechaNacimiento} onChange={(e) => setCampo("fechaNacimiento", e.target.value)} /></FormField>
            <FormField label="Lugar de nacimiento"><TextInput value={form.lugarNacimiento} onChange={(e) => setCampo("lugarNacimiento", e.target.value)} /></FormField>
            <FormField label="Dirección"><TextInput value={form.direccion} onChange={(e) => setCampo("direccion", e.target.value)} /></FormField>
            <FormField label="Teléfono"><TextInput value={form.telefono} onChange={(e) => setCampo("telefono", e.target.value)} /></FormField>
            <FormField label="Edad"><TextInput type="number" min="0" value={form.edad} onChange={(e) => setCampo("edad", e.target.value)} /></FormField>
            <FormField label="Sexo">
              <Select value={form.sexo} onChange={(e) => setCampo("sexo", e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </Select>
            </FormField>
            <FormField label="Estado civil"><TextInput value={form.estadoCivil} onChange={(e) => setCampo("estadoCivil", e.target.value)} /></FormField>
            <FormField label="Ocupación"><TextInput value={form.ocupacion} onChange={(e) => setCampo("ocupacion", e.target.value)} /></FormField>
            <FormField label="Religión"><TextInput value={form.religion} onChange={(e) => setCampo("religion", e.target.value)} /></FormField>
            <FormField label="Nacionalidad"><TextInput value={form.nacionalidad} onChange={(e) => setCampo("nacionalidad", e.target.value)} /></FormField>
            <FormField label="Nombre del cónyuge"><TextInput value={form.nombreConyuge} onChange={(e) => setCampo("nombreConyuge", e.target.value)} /></FormField>
            <FormField label="Nombre del padre"><TextInput value={form.nombrePadre} onChange={(e) => setCampo("nombrePadre", e.target.value)} /></FormField>
            <FormField label="Nombre de la madre"><TextInput value={form.nombreMadre} onChange={(e) => setCampo("nombreMadre", e.target.value)} /></FormField>
            <FormField label="Contacto de emergencia"><TextInput value={form.contactoEmergencia} onChange={(e) => setCampo("contactoEmergencia", e.target.value)} /></FormField>
            <FormField label="Parentesco"><TextInput value={form.parentesco} onChange={(e) => setCampo("parentesco", e.target.value)} /></FormField>
            <div className="col-span-3 mt-2">
              <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Guardar paciente"}</Button>
            </div>
          </form>
        </Card>
      ) : tab === "lista" ? (
        <>
          <div className="mb-4 flex gap-2">
            <TextInput
              placeholder="Buscar por nombre, DPI o historia clínica (RF-02)"
              value={buscarInput}
              onChange={(e) => setBuscarInput(e.target.value)}
              style={{ maxWidth: 360 }}
            />
          </div>
          {error && <Banner tone="error">{error}</Banner>}
          <Table
            headers={["Historia clínica", "Nombre", "DPI", "Edad", "Sexo", ""]}
            rows={loading ? [] : pacientes || []}
            emptyMessage={loading ? "Cargando…" : "No hay pacientes registrados."}
            renderRow={(p) => (
              <>
                <td className="px-4 py-3">{p.historiaClinica}</td>
                <td className="px-4 py-3">{p.nombreCompleto}</td>
                <td className="px-4 py-3">{p.dpi}</td>
                <td className="px-4 py-3">{p.edad ?? "—"}</td>
                <td className="px-4 py-3">{p.sexo ?? "—"}</td>
                <td className="px-4 py-3">
                  <button className="text-xs font-semibold" style={{ color: "#1F3864" }} onClick={() => onVerExpediente(p.id)}>
                    Ver expediente →
                  </button>
                </td>
              </>
            )}
          />
        </>
      ) : null}
    </div>
  );
}
