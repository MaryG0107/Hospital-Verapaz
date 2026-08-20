import React, { useState } from "react";
import { Card } from "../components/Card";
import { Banner } from "../components/Banner";
import { COLORS } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login, sesionExpirada } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(correo, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.lightBg }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        <Card>
          <div className="text-center mb-2">
            <div className="text-xs font-bold tracking-widest" style={{ color: COLORS.navy }}>HOSPITAL VERAPAZ</div>
            <h2 className="text-2xl font-semibold mt-2">Iniciar Sesión</h2>
            <p className="text-xs mt-1" style={{ color: "#888" }}>
              Sistema de gestión de expediente clínico y administrativo
            </p>
          </div>
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {sesionExpirada && !error && <Banner tone="info">Su sesión expiró. Inicie sesión de nuevo.</Banner>}
            {error && <Banner tone="error">{error}</Banner>}
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Usuario</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@hospitalverapaz.gt"
                className="w-full mt-1 px-3 py-2 rounded-md text-sm border"
                style={{ borderColor: COLORS.border }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: "#444" }}>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 px-3 py-2 rounded-md text-sm border"
                style={{ borderColor: COLORS.border }}
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2 rounded-md text-sm font-semibold mt-2"
              style={{ backgroundColor: COLORS.navy, color: "white", opacity: cargando ? 0.6 : 1 }}
            >
              {cargando ? "Ingresando…" : "Ingresar"}
            </button>
            <p className="text-center text-xs" style={{ color: COLORS.gold }}>
              ¿Olvidó su contraseña? Contacte al Administrador
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
