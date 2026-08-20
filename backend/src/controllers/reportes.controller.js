// Controlador: Reportes administrativos y financieros (Modulo 9, RF-31)
import { prisma } from "../config/prisma.js";
import { reporteConsolidado } from "../services/facturacion.service.js";

function rangoFecha(desde, hasta) {
  const rango = {};
  if (desde) rango.gte = new Date(desde);
  if (hasta) rango.lte = new Date(hasta);
  return Object.keys(rango).length ? rango : undefined;
}

// Ingresos/egresos del hospital + farmacia en un periodo
export async function financiero(req, res) {
  const { desde, hasta } = req.query;
  const datos = await reporteConsolidado({ desde, hasta });
  res.json(datos);
}

// Admisiones y egresos: totales por condicion de egreso en un periodo
export async function admisiones(req, res) {
  const { desde, hasta } = req.query;
  const where = { fechaIngreso: rangoFecha(desde, hasta) };

  const [totalIngresos, porCondicion] = await Promise.all([
    prisma.paciente.count({ where }),
    prisma.paciente.groupBy({
      by: ["condicionEgreso"],
      where: { ...where, condicionEgreso: { not: null } },
      _count: { _all: true },
    }),
  ]);

  res.json({
    totalIngresos,
    porCondicionEgreso: porCondicion.map((c) => ({ condicion: c.condicionEgreso, total: c._count._all })),
  });
}

// Facturacion por forma de pago (transferencia / efectivo)
export async function facturacionPorFormaPago(req, res) {
  const { desde, hasta } = req.query;
  const grupos = await prisma.facturaHospital.groupBy({
    by: ["formaPago"],
    where: { creadoEn: rangoFecha(desde, hasta) },
    _sum: { total: true },
    _count: { _all: true },
  });
  res.json(grupos.map((g) => ({ formaPago: g.formaPago, total: Number(g._sum.total || 0), cantidad: g._count._all })));
}

// RNF-10: kardex de movimientos de inventario de farmacia
export async function inventarioKardex(req, res) {
  const { medicamentoId, desde, hasta } = req.query;
  const movimientos = await prisma.movimientoInventario.findMany({
    where: {
      medicamentoId: medicamentoId ? Number(medicamentoId) : undefined,
      fecha: rangoFecha(desde, hasta),
    },
    orderBy: { fecha: "desc" },
    take: 200,
    include: { medicamento: { select: { nombre: true } } },
  });
  res.json(movimientos);
}

// RNF-08: quien vio el diagnostico confidencial de cada paciente y cuando
export async function auditoriaDiagnostico(req, res) {
  const { pacienteId, desde, hasta } = req.query;
  const accesos = await prisma.accesoDiagnostico.findMany({
    where: {
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
      fecha: rangoFecha(desde, hasta),
    },
    orderBy: { fecha: "desc" },
    take: 200,
    include: {
      usuario: { select: { nombre: true, rol: true } },
      paciente: { select: { nombreCompleto: true, historiaClinica: true } },
    },
  });
  res.json(accesos);
}
