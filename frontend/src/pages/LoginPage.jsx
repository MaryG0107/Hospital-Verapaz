import React, { useState } from "react";
import { HeartPulse, Lock, Mail } from "lucide-react";
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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: `linear-gradient(135deg, ${COLORS.lightBg} 0%, #E7EBF5 100%)` }}
    >
      <div className="w-full flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lifted bg-white" style={{ maxWidth: 880 }}>
        {/* Panel de marca */}
        <div
          className="relative md:w-2/5 px-8 py-10 md:py-12 flex flex-col justify-between overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.navyDark} 100%)` }}
        >
          <div
            className="absolute rounded-full opacity-10"
            style={{ width: 260, height: 260, background: COLORS.gold, top: -80, right: -80 }}
          />
          <div
            className="absolute rounded-full opacity-10"
            style={{ width: 180, height: 180, background: "white", bottom: -60, left: -60 }}
          />
          <div className="relative">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <HeartPulse size={22} color={COLORS.goldLight} />
            </div>
            <div className="text-xs font-bold tracking-[0.2em]" style={{ color: COLORS.goldLight }}>HOSPITAL VERAPAZ</div>
            <h1 className="text-2xl font-bold text-white mt-2 leading-snug">
              Sistema de gestión de expediente clínico y administrativo
            </h1>
            <p className="text-sm mt-3" style={{ color: "#B7C1D9" }}>
              Cobán, Alta Verapaz — acceso exclusivo para personal autorizado.
            </p>
          </div>
          <p className="relative text-xs mt-10 hidden md:block" style={{ color: "#7C8AAE" }}>
            Universidad Mariano Gálvez de Guatemala · Seminario de Tecnología de Información
          </p>
        </div>

        {/* Panel de acceso */}
        <div className="md:w-3/5 px-6 py-10 sm:px-10 sm:py-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold" style={{ color: COLORS.text }}>Iniciar sesión</h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Ingresa con tu correo y contraseña asignados.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {sesionExpirada && !error && <Banner tone="info">Su sesión expiró. Inicie sesión de nuevo.</Banner>}
            {error && <Banner tone="error">{error}</Banner>}

            <div>
              <label className="text-xs font-semibold" style={{ color: "#475066" }}>Usuario</label>
              <div className="relative mt-1.5">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9AA3B8" }} />
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@hospitalverapaz.gt"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all duration-150 focus:border-navy focus:ring-2"
                  style={{ borderColor: COLORS.border, "--tw-ring-color": "rgba(31, 56, 100, 0.18)" }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold" style={{ color: "#475066" }}>Contraseña</label>
              <div className="relative mt-1.5">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9AA3B8" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all duration-150 focus:border-navy focus:ring-2"
                  style={{ borderColor: COLORS.border, "--tw-ring-color": "rgba(31, 56, 100, 0.18)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 rounded-xl text-sm font-semibold mt-2 transition-all duration-150 shadow-soft hover:shadow-lifted hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ backgroundColor: COLORS.navy, color: "white", opacity: cargando ? 0.6 : 1 }}
            >
              {cargando ? "Ingresando…" : "Ingresar"}
            </button>
            <p className="text-center text-xs" style={{ color: COLORS.gold }}>
              ¿Olvidó su contraseña? Contacte al Administrador
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
