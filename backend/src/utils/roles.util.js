// Roles de usuario del sistema (Modulo 8 - Seguridad y Roles, RF-30)
export const ROLES = Object.freeze({
  ADMIN: "Administrador",
  RECEPCION: "Recepcion",
  CONSULTA: "Consulta",
  ENFERMERIA: "Enfermeria",
  FACTURACION: "Facturacion",
  FARMACIA: "Farmacia",
});

export const ROLES_VALIDOS = Object.values(ROLES);
