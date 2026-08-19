import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegistroPage } from "./pages/RegistroPage";
import { ExpedientePage } from "./pages/ExpedientePage";
import { TratamientoPage } from "./pages/TratamientoPage";
import { ReferidosPage } from "./pages/ReferidosPage";
import { FinancieraPage } from "./pages/FinancieraPage";
import { FarmaciaPage } from "./pages/FarmaciaPage";
import { BitacoraPage } from "./pages/BitacoraPage";
import { SeguridadPage } from "./pages/SeguridadPage";
import { ReportesPage } from "./pages/ReportesPage";

export default function App() {
  const { usuario, logout } = useAuth();
  const [page, setPage] = useState("registro");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  if (!usuario) return <LoginPage />;

  function irAExpediente(pacienteId) {
    setPacienteSeleccionado(pacienteId);
    setPage("expediente");
  }

  return (
    <Layout usuario={usuario} page={page} setPage={setPage} onLogout={logout}>
      {page === "registro" && <RegistroPage onVerExpediente={irAExpediente} />}
      {page === "expediente" && <ExpedientePage pacienteIdInicial={pacienteSeleccionado} />}
      {page === "tratamiento" && <TratamientoPage pacienteIdInicial={pacienteSeleccionado} />}
      {page === "referidos" && <ReferidosPage />}
      {page === "financiera" && <FinancieraPage />}
      {page === "farmacia" && <FarmaciaPage />}
      {page === "bitacora" && <BitacoraPage pacienteIdInicial={pacienteSeleccionado} />}
      {page === "seguridad" && <SeguridadPage />}
      {page === "reportes" && <ReportesPage />}
    </Layout>
  );
}
