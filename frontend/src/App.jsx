import React, { useState } from "react";

// ---- Design tokens (mismos que en el prototipo de Figma) ----
const NAVY = "#1F3864";
const GOLD = "#B08B2E";
const LIGHTBG = "#F2F4F8";
const BORDER = "#E2E4EA";
const RED = "#B94A3D";
const GREEN = "#2E7D4F";
const TEAL = "#1C7373";

const NAV_ITEMS = [
  { key: "registro", label: "Registro y Admisión" },
  { key: "expediente", label: "Expediente Clínico" },
  { key: "tratamiento", label: "Tratamiento" },
  { key: "referidos", label: "Clientes Referidos" },
  { key: "financiera", label: "Área Financiera" },
  { key: "farmacia", label: "Farmacia" },
  { key: "bitacora", label: "Bitácora de Visitas" },
  { key: "seguridad", label: "Seguridad y Roles" },
  { key: "reportes", label: "Reportes" },
];

const ROLES = [
  "Administrador",
  "Recepción / Admisión",
  "Personal de consulta",
  "Enfermería / Secretaría",
  "Facturación",
  "Farmacia",
];

// ---- Mock data (mismo contenido usado en el prototipo de Figma) ----
const INITIAL_PATIENTS = [
  { id: "HC-2026-000123", nombre: "María López Xol", dpi: "2451 87456 0101", edad: 34, sexo: "Femenino" },
  { id: "HC-2026-000124", nombre: "Carlos Xol Tzalam", dpi: "1832 55210 0101", edad: 51, sexo: "Masculino" },
];

const FARMACIA_ITEMS = [
  { nombre: "Paracetamol 500mg", tipo: "Analgésico", stock: 320, vence: "12/2027", proveedor: "Farmaquímica S.A.", estado: "OK" },
  { nombre: "Amoxicilina 500mg", tipo: "Antibiótico", stock: 8, vence: "03/2027", proveedor: "Distribuidora Cobán", estado: "Stock bajo" },
  { nombre: "Insulina Glargina", tipo: "Hormona", stock: 15, vence: "09/2026", proveedor: "MedSupply GT", estado: "Por vencer" },
  { nombre: "Suero Fisiológico 1L", tipo: "Solución IV", stock: 5, vence: "01/2028", proveedor: "Farmaquímica S.A.", estado: "Stock bajo" },
  { nombre: "Ibuprofeno 400mg", tipo: "Analgésico", stock: 210, vence: "06/2027", proveedor: "Distribuidora Cobán", estado: "OK" },
];

const TRATAMIENTO_ITEMS = [
  { item: "Suero Fisiológico 1L", dosis: "1 unidad", fecha: "05/08 08:15", costo: "Q45.00", origen: "Intrahospitalario" },
  { item: "Paracetamol 500mg IV", dosis: "1 dosis", fecha: "05/08 09:00", costo: "Q12.00", origen: "Intrahospitalario" },
  { item: "Curación de herida", dosis: "1 procedimiento", fecha: "05/08 10:30", costo: "Q80.00", origen: "Intrahospitalario" },
  { item: "Insulina Glargina", dosis: "10 UI", fecha: "05/08 20:00", costo: "Q35.00", origen: "Farmacia (venta directa)" },
];

const REFERIDOS_ITEMS = [
  { medico: "Dr. Carlos Xol Tzalam", especialidad: "Medicina Interna", pacientes: 14, comision: "Q250 / paciente", total: "Q3,500" },
  { medico: "Dra. Ana Choc Ical", especialidad: "Pediatría", pacientes: 9, comision: "Q200 / paciente", total: "Q1,800" },
  { medico: "Dr. Manuel Pop Coy", especialidad: "Traumatología", pacientes: 6, comision: "Q300 / paciente", total: "Q1,800" },
];

const BITACORA_ITEMS = [
  { fecha: "05/08/2026 08:15", autor: "Enfermería — Turno Mañana", desc: "Control de signos vitales. Presión 120/80, temperatura 36.8°C." },
  { fecha: "05/08/2026 10:30", autor: "Recepción / Admisión", desc: "Visita de familiar registrada (esposo). Entrega de documentos." },
  { fecha: "05/08/2026 14:00", autor: "Enfermería — Turno Tarde", desc: "Administración de medicamento según indicación médica." },
  { fecha: "05/08/2026 20:00", autor: "Secretaría", desc: "Registro de llamada de médico referente solicitando informe de evolución." },
];

const USUARIOS_ITEMS = [
  { usuario: "Ing. Luis Rodas (Admin)", rol: "Administrador", funciones: "Todas + asignación de roles", token: "—" },
  { usuario: "Dra. Ana Choc", rol: "Médico", funciones: "Consulta + Diagnóstico (con token)", token: "Autogenera" },
  { usuario: "Dr. Carlos Xol", rol: "Médico", funciones: "Consulta + Diagnóstico (con token)", token: "Solicita" },
  { usuario: "María Sagui", rol: "Recepción/Admisión", funciones: "Registro, Facturación, Visitas", token: "Solicita" },
  { usuario: "Diego Hernández", rol: "Farmacia", funciones: "Inventario, Facturación Farmacia", token: "—" },
];

const REPORTES_ITEMS = [
  { titulo: "Reporte de ingresos por período", desc: "Hospital + Farmacia, consolidado y por separado" },
  { titulo: "Reporte de egresos y costeo", desc: "Por paciente, por servicio" },
  { titulo: "Reporte de facturación", desc: "Detalle por forma de pago (transferencia/efectivo)" },
  { titulo: "Reporte de admisiones y egresos", desc: "Ingresos, egresos, condición de egreso" },
  { titulo: "Reporte de inventario de farmacia", desc: "Stock, entradas, salidas, alertas (kardex)" },
];

// ---- UI helpers ----
function Button({ children, onClick, variant = "primary", type = "button" }) {
  const base = "px-4 py-2 rounded-md text-sm font-semibold transition-colors";
  if (variant === "primary") {
    return (
      <button type={type} onClick={onClick} className={base} style={{ backgroundColor: NAVY, color: "white" }}>
        {children}
      </button>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={base + " border"}
      style={{ borderColor: BORDER, color: "#333", backgroundColor: "white" }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm" style={style}>
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold" style={{ color: "#1a1a1a" }}>{title}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: "#666" }}>{subtitle}</p>}
    </div>
  );
}

function Table({ headers, rows, renderRow }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#F4F4F7" }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "#666", fontSize: 11, textTransform: "uppercase" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Login ----
function LoginPage({ onLogin }) {
  const [role, setRole] = useState(ROLES[0]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: LIGHTBG }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        <Card>
          <div className="text-center mb-2">
            <div className="text-xs font-bold tracking-widest" style={{ color: NAVY }}>HOSPITAL VERAPAZ</div>
            <h2 className="text-2xl font-semibold mt-2">Iniciar Sesión</h2>
            <p className="text-xs mt-1" style={{ color: "#888" }}>
              Sistema de gestión de expediente clínico y administrativo
            </p>
          </div>
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(role);
            }}
          >
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Usuario</label>
              <input
                type="text"
                placeholder="correo@hospitalverapaz.gt"
                className="w-full mt-1 px-3 py-2 rounded-md text-sm border"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-3 py-2 rounded-md text-sm border"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-md text-sm border"
                style={{ borderColor: BORDER }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full py-2 rounded-md text-sm font-semibold mt-2" style={{ backgroundColor: NAVY, color: "white" }}>
              Ingresar
            </button>
            <p className="text-center text-xs" style={{ color: GOLD }}>
              ¿Olvidó su contraseña? Contacte al Administrador
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ---- Módulo: Registro y Admisión ----
function RegistroPage({ patients, setPatients }) {
  const [nombre, setNombre] = useState("");
  const [dpi, setDpi] = useState("");
  const [tab, setTab] = useState("nuevo");

  function addPatient(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    const id = `HC-2026-${String(100000 + patients.length + 1).slice(-6)}`;
    setPatients([...patients, { id, nombre, dpi: dpi || "—", edad: "—", sexo: "—" }]);
    setNombre("");
    setDpi("");
  }

  return (
    <div>
      <PageHeader title="Registro y Admisión de Pacientes" />
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("nuevo")}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={tab === "nuevo" ? { backgroundColor: NAVY, color: "white" } : { border: `1px solid ${BORDER}`, backgroundColor: "white" }}
        >
          + Paciente nuevo
        </button>
        <button
          onClick={() => setTab("lista")}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={tab === "lista" ? { backgroundColor: NAVY, color: "white" } : { border: `1px solid ${BORDER}`, backgroundColor: "white" }}
        >
          Pacientes registrados ({patients.length})
        </button>
      </div>

      {tab === "nuevo" ? (
        <Card>
          <p className="text-xs font-semibold mb-4" style={{ color: "#888" }}>
            Historia clínica: se genera automáticamente al guardar (RF-03)
          </p>
          <form onSubmit={addPatient} className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Nombre completo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md text-sm border" style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>DPI</label>
              <input value={dpi} onChange={(e) => setDpi(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md text-sm border" style={{ borderColor: BORDER }} />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Fecha de nacimiento</label>
              <input type="date" className="w-full mt-1 px-3 py-2 rounded-md text-sm border" style={{ borderColor: BORDER }} />
            </div>
            <div className="col-span-3 mt-2">
              <Button type="submit">Guardar paciente</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Table
          headers={["Historia clínica", "Nombre", "DPI", "Edad", "Sexo"]}
          rows={patients}
          renderRow={(p) => (
            <>
              <td className="px-4 py-3">{p.id}</td>
              <td className="px-4 py-3">{p.nombre}</td>
              <td className="px-4 py-3">{p.dpi}</td>
              <td className="px-4 py-3">{p.edad}</td>
              <td className="px-4 py-3">{p.sexo}</td>
            </>
          )}
        />
      )}
    </div>
  );
}

// ---- Módulo: Expediente Clínico (control de acceso por token) ----
function ExpedientePage({ patients, role }) {
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const [tokenActivo, setTokenActivo] = useState(role === "Administrador");
  const patient = patients.find((p) => p.id === selectedId) || patients[0];
  const puedeVer = role === "Administrador" || tokenActivo;

  return (
    <div>
      <PageHeader title="Expediente Clínico" />
      <div className="mb-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-3 py-2 rounded-md text-sm border"
          style={{ borderColor: BORDER }}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} — {p.id}</option>
          ))}
        </select>
      </div>

      <div
        className="rounded-md px-4 py-3 mb-4 text-sm font-semibold"
        style={{ backgroundColor: puedeVer ? "#E7F5EC" : "#FBEAE8", color: puedeVer ? GREEN : RED }}
      >
        {puedeVer
          ? `🔓 Sesión activa: ${role} — acceso al diagnóstico confidencial`
          : `🔒 Sesión activa: ${role} — sin acceso al diagnóstico (solicite token al Administrador)`}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="font-semibold text-sm mb-2">Datos básicos del paciente</div>
        <div className="text-sm" style={{ color: "#666" }}>
          {patient?.nombre} · {patient?.id} · {patient?.edad} años · {patient?.sexo}
        </div>
      </Card>

      {puedeVer ? (
        <Card style={{ border: `2px solid ${GOLD}` }}>
          <div className="font-semibold text-sm mb-1">🔒 Diagnóstico confidencial (cifrado)</div>
          <p className="text-xs mb-3" style={{ color: "#888" }}>
            Solo visible para Administrador, o mediante token de acceso temporal (RF-10, RF-11, RF-33, RF-34).
          </p>
          <div className="rounded-md p-3 text-sm" style={{ backgroundColor: "#FAFAFB", border: `1px solid ${BORDER}` }}>
            Diagnóstico: Diabetes mellitus tipo II (E11.9). Complicaciones: ninguna reportada.
          </div>
        </Card>
      ) : (
        <Card style={{ backgroundColor: "#F5F5F5" }}>
          <div className="font-semibold text-sm mb-1" style={{ color: "#888" }}>🔒 Diagnóstico confidencial</div>
          <p className="text-sm mb-3" style={{ color: "#888" }}>No tiene permiso para ver esta información.</p>
          <Button onClick={() => setTokenActivo(true)}>Solicitar token de acceso temporal</Button>
        </Card>
      )}
    </div>
  );
}

// ---- Módulo: Tratamiento ----
function TratamientoPage() {
  return (
    <div>
      <PageHeader title="Tratamiento y Medicamentos Intrahospitalarios" subtitle="Paciente: María López Xol · HC-2026-000123" />
      <Table
        headers={["Medicamento / Procedimiento", "Dosis", "Fecha / Hora", "Costo", "Origen"]}
        rows={TRATAMIENTO_ITEMS}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3">{r.item}</td>
            <td className="px-4 py-3">{r.dosis}</td>
            <td className="px-4 py-3">{r.fecha}</td>
            <td className="px-4 py-3">{r.costo}</td>
            <td className="px-4 py-3" style={{ color: r.origen.includes("Farmacia") ? TEAL : "#333", fontWeight: r.origen.includes("Farmacia") ? 600 : 400 }}>
              {r.origen}
            </td>
          </>
        )}
      />
      <div className="mt-4">
        <Button>+ Registrar medicamento / procedimiento</Button>
      </div>
    </div>
  );
}

// ---- Módulo: Clientes Referidos ----
function ReferidosPage() {
  return (
    <div>
      <PageHeader title="Clientes Referidos" subtitle="Médicos externos que refieren pacientes, con su comisión asociada (RF-16)" />
      <Table
        headers={["Médico referente", "Especialidad", "Pacientes referidos", "Comisión", "Total acumulado"]}
        rows={REFERIDOS_ITEMS}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3 font-semibold">{r.medico}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.especialidad}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.pacientes}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.comision}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.total}</td>
          </>
        )}
      />
      <div className="mt-4">
        <Button>+ Registrar médico referente</Button>
      </div>
    </div>
  );
}

// ---- Módulo: Área Financiera ----
function FinancieraPage() {
  const stats = [
    { label: "INGRESOS HOSPITAL (mes)", value: "Q 184,320", color: NAVY },
    { label: "INGRESOS FARMACIA (mes)", value: "Q 42,150", color: TEAL },
    { label: "TOTAL CONSOLIDADO", value: "Q 226,470", color: GOLD },
  ];
  return (
    <div>
      <PageHeader title="Área Financiera" subtitle="Reporte consolidado: ingresos del hospital y de farmacia, por separado y en conjunto (RF-21)" />
      <div className="grid grid-cols-3 gap-4 mb-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="text-xs font-semibold" style={{ color: "#888" }}>{s.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NAVY }} />
            <span className="font-semibold text-sm">5.1 Facturación Hospital</span>
          </div>
          <div className="text-sm flex justify-between py-1" style={{ color: "#666" }}><span>Consultas y tratamientos</span><span>Q 132,400</span></div>
          <div className="text-sm flex justify-between py-1" style={{ color: "#666" }}><span>Post-tratamiento intrahospitalario</span><span>Q 51,920</span></div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAL }} />
            <span className="font-semibold text-sm">5.2 Facturación Farmacia</span>
          </div>
          <div className="text-sm flex justify-between py-1" style={{ color: "#666" }}><span>Ventas directas de medicamentos</span><span>Q 42,150</span></div>
          <div className="text-sm flex justify-between py-1" style={{ color: "#666" }}><span>Recibido automáticamente de Farmacia</span><span>✓</span></div>
        </Card>
      </div>
    </div>
  );
}

// ---- Módulo: Farmacia ----
function FarmaciaPage() {
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <PageHeader title="Farmacia — Inventario de Medicamentos" subtitle="Módulo independiente, con facturación propia (visión a futuro)" />
        <Button>+ Registrar entrada</Button>
      </div>
      <div className="rounded-md px-4 py-3 mb-4 text-sm font-semibold" style={{ backgroundColor: "#FBEAE8", color: RED }}>
        ⚠ 2 medicamentos con stock bajo el mínimo · 1 próximo a vencer (RF-25, RF-26)
      </div>
      <Table
        headers={["Medicamento", "Tipo", "Stock", "Vencimiento", "Proveedor", "Estado"]}
        rows={FARMACIA_ITEMS}
        renderRow={(r) => (
          <>
            <td className="px-4 py-3">{r.nombre}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.tipo}</td>
            <td className="px-4 py-3">{r.stock}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.vence}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{r.proveedor}</td>
            <td className="px-4 py-3 font-semibold" style={{ color: r.estado === "OK" ? GREEN : RED }}>{r.estado}</td>
          </>
        )}
      />
    </div>
  );
}

// ---- Módulo: Bitácora de Visitas ----
function BitacoraPage() {
  return (
    <div>
      <PageHeader title="Bitácora de Visitas" subtitle="Registro de cada visita/consulta: qué se hizo y quién lo hizo (RF-28)" />
      <Card>
        {BITACORA_ITEMS.map((b, i) => (
          <div key={i} className="flex gap-4 py-3" style={i > 0 ? { borderTop: `1px solid ${BORDER}` } : {}}>
            <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ backgroundColor: GOLD, flexShrink: 0 }} />
            <div style={{ width: 160, flexShrink: 0, color: "#888" }} className="text-xs font-semibold">{b.fecha}</div>
            <div>
              <div className="text-sm font-semibold">{b.autor}</div>
              <div className="text-xs mt-0.5" style={{ color: "#888" }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </Card>
      <div className="mt-4">
        <Button>+ Registrar visita</Button>
      </div>
    </div>
  );
}

// ---- Módulo: Seguridad y Roles ----
function SeguridadPage() {
  return (
    <div>
      <PageHeader title="Seguridad y Roles de Usuario" subtitle="El Administrador asigna roles, funciones y permisos de token (RF-29, RF-30, RF-32, RF-33, RF-34)" />
      <Table
        headers={["Usuario", "Rol", "Funciones asignadas", "Token de acceso"]}
        rows={USUARIOS_ITEMS}
        renderRow={(u) => (
          <>
            <td className="px-4 py-3 font-semibold">{u.usuario}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{u.rol}</td>
            <td className="px-4 py-3" style={{ color: "#666" }}>{u.funciones}</td>
            <td className="px-4 py-3 font-semibold" style={{ color: u.token === "Autogenera" ? GREEN : "#666" }}>{u.token}</td>
          </>
        )}
      />
      <div className="mt-4 rounded-md p-4 text-sm" style={{ backgroundColor: "#EFF1FB" }}>
        <div className="font-semibold mb-1" style={{ color: NAVY }}>🔑 Tokens de acceso temporal</div>
        <div style={{ color: "#666" }}>Duración: 5–15 minutos · Un solo uso · El Administrador los emite o autoriza su autogeneración.</div>
      </div>
    </div>
  );
}

// ---- Módulo: Reportes ----
function ReportesPage() {
  return (
    <div>
      <PageHeader title="Reportes" subtitle="Reportes administrativos y financieros para apoyar la toma de decisiones (RF-31)" />
      <Card>
        {REPORTES_ITEMS.map((r, i) => (
          <div key={i} className="flex justify-between items-center py-3" style={i > 0 ? { borderTop: `1px solid ${BORDER}` } : {}}>
            <div>
              <div className="text-sm font-semibold">{r.titulo}</div>
              <div className="text-xs mt-0.5" style={{ color: "#888" }}>{r.desc}</div>
            </div>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-md border" style={{ borderColor: NAVY, color: NAVY }}>
              Exportar PDF
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---- Layout con sidebar ----
function Layout({ role, page, setPage, onLogout, children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: LIGHTBG }}>
      <div className="flex flex-col" style={{ width: 240, backgroundColor: NAVY, flexShrink: 0 }}>
        <div className="px-5 pt-6 pb-4">
          <div className="text-white font-bold text-sm tracking-wide">HOSPITAL VERAPAZ</div>
          <div className="text-xs mt-1" style={{ color: "#B7C1D9" }}>{role}</div>
        </div>
        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="w-full text-left px-3 py-2.5 rounded-md text-sm mb-1"
              style={
                page === item.key
                  ? { backgroundColor: GOLD, color: NAVY, fontWeight: 600 }
                  : { color: "white", backgroundColor: "transparent" }
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button onClick={onLogout} className="w-full text-left px-3 py-2.5 rounded-md text-sm" style={{ color: "#B7C1D9" }}>
            ← Cerrar sesión
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}

// ---- App raíz ----
export default function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("registro");
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  if (!role) {
    return <LoginPage onLogin={(r) => setRole(r)} />;
  }

  return (
    <Layout role={role} page={page} setPage={setPage} onLogout={() => setRole(null)}>
      {page === "registro" && <RegistroPage patients={patients} setPatients={setPatients} />}
      {page === "expediente" && <ExpedientePage patients={patients} role={role} />}
      {page === "tratamiento" && <TratamientoPage />}
      {page === "referidos" && <ReferidosPage />}
      {page === "financiera" && <FinancieraPage />}
      {page === "farmacia" && <FarmaciaPage />}
      {page === "bitacora" && <BitacoraPage />}
      {page === "seguridad" && <SeguridadPage />}
      {page === "reportes" && <ReportesPage />}
    </Layout>
  );
}
