// Controlador: Area Financiera (Modulo 5 - Facturacion Hospital)
import { prisma } from "../config/prisma.js";
import { generarFacturaHospital, reporteConsolidado } from "../services/facturacion.service.js";

export async function listar(req, res) {
  const facturas = await prisma.facturaHospital.findMany({
    orderBy: { creadoEn: "desc" },
    take: 50,
    include: { paciente: { select: { nombreCompleto: true, historiaClinica: true } } },
  });
  res.json(facturas);
}

export async function obtenerUno(req, res) {
  const factura = await prisma.facturaHospital.findUnique({
    where: { id: Number(req.params.id) },
    include: { paciente: { select: { nombreCompleto: true, historiaClinica: true } } },
  });
  if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
  res.json(factura);
}

// RF-17/RF-18/RF-19
export async function crear(req, res) {
  const { pacienteId, costoHospital, formaPago } = req.body;
  if (!pacienteId || costoHospital === undefined || !formaPago) {
    return res.status(400).json({ error: "pacienteId, costoHospital y formaPago son requeridos" });
  }
  if (!["transferencia", "efectivo"].includes(formaPago)) {
    return res.status(400).json({ error: 'formaPago debe ser "transferencia" o "efectivo"' });
  }

  try {
    const factura = await generarFacturaHospital({
      pacienteId: Number(pacienteId),
      costoHospital: Number(costoHospital),
      formaPago,
    });
    res.status(201).json(factura);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}

// RF-21: reporte financiero consolidado (hospital + farmacia)
export async function reporte(req, res) {
  const { desde, hasta } = req.query;
  const datos = await reporteConsolidado({ desde, hasta });
  res.json(datos);
}
