// Punto único de conexión al backend (Express). Vite hace proxy de /api -> http://localhost:4000
const BASE_URL = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // La sesion (JWT) expiro o dejo de ser valida: avisa a AuthContext para
    // que cierre sesion y regrese al login, en vez de dejar la app mostrando
    // errores de "Token invalido" en cada peticion.
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event("auth:sesion-expirada"));
    }
    throw new Error(body?.error || `Error ${res.status} al llamar ${path}`);
  }
  return body;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
};
