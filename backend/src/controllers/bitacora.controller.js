// Controlador: Bitacora de Visitas (Modulo 7)
import { prisma } from "../config/prisma.js";
import { registrarActividad } from "../services/actividad.service.js";

// RF-28: listar visitas, opcionalmente filtradas por paciente
export async function listar(req, res) {
  const { pacienteId } = req.query;
  const visitas = await prisma.bitacoraVisita.findMany({
    where: pacienteId ? { pacienteId: Number(pacienteId) } : undefined,
    orderBy: { fecha: "desc" },
    take: 100,
    include: { autor: { select: { nombre: true, rol: true } } },
  });
  res.json(visitas);
}

export async function obtenerUno(req, res) {
  const visita = await prisma.bitacoraVisita.findUnique({
    where: { id: Number(req.params.id) },
    include: { autor: { select: { nombre: true, rol: true } } },
  });
  if (!visita) return res.status(404).json({ error: "Visita no encontrada" });
  res.json(visita);
}

// RF-28: registrar visita/consulta, dejando constancia de quien la hizo
export async function crear(req, res) {
  const { pacienteId, descripcion } = req.body;
  if (!pacienteId || !descripcion) {
    return res.status(400).json({ error: "pacienteId y descripcion son requeridos" });
  }
  const visita = await prisma.bitacoraVisita.create({
    data: { pacienteId: Number(pacienteId), descripcion, autorId: req.user.id },
  });
  await registrarActividad(req.user.id, "registrar_visita", descripcion);
  res.status(201).json(visita);
}

export async function actualizar(req, res) {
  const { descripcion } = req.body;
  try {
    const visita = await prisma.bitacoraVisita.update({
      where: { id: Number(req.params.id) },
      data: { descripcion },
    });
    res.json(visita);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Visita no encontrada" });
    throw err;
  }
}
