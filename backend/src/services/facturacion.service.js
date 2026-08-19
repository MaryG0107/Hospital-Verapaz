// Logica de negocio de facturacion, con transacciones que garantizan que
// costeo + factura se registren como una sola operacion atomica (RNF-13):
// si un paso falla, Prisma revierte todo lo hecho dentro del $transaction.
import { prisma } from "../config/prisma.js";

// RF-17/RF-18/RF-19: calcula el costo de tratamiento pendiente del paciente,
// lo suma al costo base del hospital y genera la factura en una sola transaccion.
export async function generarFacturaHospital({ pacienteId, costoHospital, formaPago }) {
  return prisma.$transaction(async (tx) => {
    const paciente = await tx.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) {
      const error = new Error("Paciente no encontrado");
      error.status = 404;
      throw error;
    }

    // RF-15: tanto los insumos intrahospitalarios como los medicamentos de
    // farmacia consumidos durante la estadia (origen "farmacia" por uso
    // intrahospitalario, distinto de una venta directa) se cargan al costeo
    // del paciente. Solo las ventas directas de farmacia (VentaFarmacia) se
    // facturan aparte.
    const pendientes = await tx.tratamientoItem.findMany({
      where: { pacienteId, facturado: false },
    });
    const costoTratamiento = pendientes.reduce((suma, item) => suma + Number(item.costo), 0);
    const total = Number(costoHospital) + costoTratamiento;

    const factura = await tx.facturaHospital.create({
      data: { pacienteId, costoHospital, costoTratamiento, total, formaPago },
    });

    if (pendientes.length > 0) {
      await tx.tratamientoItem.updateMany({
        where: { id: { in: pendientes.map((i) => i.id) } },
        data: { facturado: true },
      });
    }

    return factura;
  });
}

// RF-20/RF-24/RF-27: una venta directa de farmacia descuenta stock, deja
// kardex (movimiento) y genera su propia factura, en una sola transaccion.
export async function registrarVentaFarmacia({ medicamentoId, cantidad, registradoPor }) {
  return prisma.$transaction(async (tx) => {
    const medicamento = await tx.medicamentoInventario.findUnique({ where: { id: medicamentoId } });
    if (!medicamento) {
      const error = new Error("Medicamento no encontrado");
      error.status = 404;
      throw error;
    }
    if (medicamento.stock < cantidad) {
      const error = new Error("Stock insuficiente para esta venta");
      error.status = 409;
      throw error;
    }

    const precioUnitario = Number(medicamento.precioVenta);
    const total = precioUnitario * cantidad;

    const venta = await tx.ventaFarmacia.create({
      data: { medicamentoId, cantidad, precioUnitario, total, registradoPor },
    });

    await tx.movimientoInventario.create({
      data: { medicamentoId, tipo: "salida", cantidad, motivo: "venta directa" },
    });

    await tx.medicamentoInventario.update({
      where: { id: medicamentoId },
      data: { stock: { decrement: cantidad } },
    });

    const factura = await tx.facturaFarmacia.create({
      data: { ventaId: venta.id, montoTotal: total },
    });

    return { venta, factura };
  });
}

// RF-21: reporte financiero consolidado (hospital + farmacia, por separado y en conjunto)
export async function reporteConsolidado({ desde, hasta } = {}) {
  const rangoFecha = {};
  if (desde) rangoFecha.gte = new Date(desde);
  if (hasta) rangoFecha.lte = new Date(hasta);
  const where = Object.keys(rangoFecha).length ? { creadoEn: rangoFecha } : undefined;

  const [facturasHospital, facturasFarmacia] = await Promise.all([
    prisma.facturaHospital.findMany({ where }),
    prisma.facturaFarmacia.findMany({ where }),
  ]);

  const ingresosHospital = facturasHospital.reduce((suma, f) => suma + Number(f.total), 0);
  const ingresosFarmacia = facturasFarmacia.reduce((suma, f) => suma + Number(f.montoTotal), 0);

  return {
    ingresosHospital: Number(ingresosHospital.toFixed(2)),
    ingresosFarmacia: Number(ingresosFarmacia.toFixed(2)),
    totalConsolidado: Number((ingresosHospital + ingresosFarmacia).toFixed(2)),
    cantidadFacturasHospital: facturasHospital.length,
    cantidadFacturasFarmacia: facturasFarmacia.length,
  };
}
