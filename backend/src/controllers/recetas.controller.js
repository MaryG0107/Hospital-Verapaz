// Controlador: Recetas medicas (parte del Modulo 3 - Tratamiento y Medicamentos)
import { prisma } from "../config/prisma.js";
import { registrarActividad } from "../services/actividad.service.js";

export async function listar(req, res) {
  const { pacienteId } = req.query;
  const recetas = await prisma.receta.findMany({
    where: pacienteId ? { pacienteId: Number(pacienteId) } : undefined,
    orderBy: { creadoEn: "desc" },
    take: 100,
    include: {
      paciente: { select: { nombreCompleto: true, historiaClinica: true } },
      medico: { select: { nombre: true } },
    },
  });
  res.json(recetas);
}

// Para la vista imprimible de la receta
export async function obtenerUno(req, res) {
  const receta = await prisma.receta.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      paciente: { select: { nombreCompleto: true, historiaClinica: true, edad: true, sexo: true } },
      medico: { select: { nombre: true } },
    },
  });
  if (!receta) return res.status(404).json({ error: "Receta no encontrada" });
  res.json(receta);
}

export async function crear(req, res) {
  const { pacienteId, medicamento, dosis, indicaciones, duracion } = req.body;
  if (!pacienteId || !medicamento || !dosis) {
    return res.status(400).json({ error: "pacienteId, medicamento y dosis son requeridos" });
  }

  const receta = await prisma.receta.create({
    data: {
      pacienteId: Number(pacienteId),
      medicoId: req.user.id,
      medicamento,
      dosis,
      indicaciones: indicaciones || "",
      duracion: duracion || "",
    },
  });
  await registrarActividad(req.user.id, "crear_receta", medicamento);
  res.status(201).json(receta);
}
