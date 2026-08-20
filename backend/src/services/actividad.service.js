// Bitacora general del sistema: quien hizo que y cuando (login/logout y
// cada creacion/edicion en cualquier modulo). No debe interrumpir la
// accion principal si falla, por eso nunca lanza el error hacia arriba.
import { prisma } from "../config/prisma.js";

export async function registrarActividad(usuarioId, accion, detalle) {
  try {
    await prisma.logActividad.create({ data: { usuarioId: usuarioId ?? null, accion, detalle: detalle ?? null } });
  } catch (err) {
    console.error("No se pudo registrar actividad:", err.message);
  }
}
