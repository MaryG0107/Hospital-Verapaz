// Controlador: Farmacia - inventario y ventas (Modulo 6)
import { prisma } from "../config/prisma.js";
import { registrarVentaFarmacia } from "../services/facturacion.service.js";

const DIAS_ALERTA_VENCIMIENTO = 60;

function calcularEstado(medicamento) {
  const estados = [];
  if (medicamento.stock < medicamento.stockMinimo) estados.push("stock_bajo"); // RF-25
  if (medicamento.fechaVencimiento) {
    const diasParaVencer = (new Date(medicamento.fechaVencimiento) - Date.now()) / 86_400_000;
    if (diasParaVencer <= DIAS_ALERTA_VENCIMIENTO) estados.push("por_vencer"); // RF-26
  }
  return estados.length ? estados : ["ok"];
}

// RF-22: inventario de medicamentos, con alertas RF-25/RF-26
export async function listar(req, res) {
  const medicamentos = await prisma.medicamentoInventario.findMany({ orderBy: { nombre: "asc" } });
  res.json(medicamentos.map((m) => ({ ...m, estado: calcularEstado(m) })));
}

export async function obtenerUno(req, res) {
  const medicamento = await prisma.medicamentoInventario.findUnique({ where: { id: Number(req.params.id) } });
  if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });
  res.json({ ...medicamento, estado: calcularEstado(medicamento) });
}

export async function crear(req, res) {
  const { nombre, tipo, presentacion, stock, stockMinimo, precioVenta, fechaVencimiento, proveedor } = req.body;
  if (!nombre) return res.status(400).json({ error: "nombre es requerido" });

  const medicamento = await prisma.medicamentoInventario.create({
    data: {
      nombre, tipo, presentacion, proveedor,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 10,
      precioVenta: precioVenta ?? 0,
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
    },
  });
  res.status(201).json(medicamento);
}

export async function actualizar(req, res) {
  const { nombre, tipo, presentacion, stockMinimo, precioVenta, fechaVencimiento, proveedor } = req.body;
  try {
    const medicamento = await prisma.medicamentoInventario.update({
      where: { id: Number(req.params.id) },
      data: {
        nombre, tipo, presentacion, proveedor, stockMinimo, precioVenta,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
      },
    });
    res.json(medicamento);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Medicamento no encontrado" });
    throw err;
  }
}

// RF-23: entrada de medicamentos al inventario (compra o recepcion de proveedor)
export async function registrarEntrada(req, res) {
  const { cantidad, motivo } = req.body;
  const medicamentoId = Number(req.params.id);
  if (!cantidad || cantidad <= 0) return res.status(400).json({ error: "cantidad debe ser mayor a 0" });

  try {
    const [medicamento] = await prisma.$transaction([
      prisma.medicamentoInventario.update({
        where: { id: medicamentoId },
        data: { stock: { increment: cantidad } },
      }),
      prisma.movimientoInventario.create({
        data: { medicamentoId, tipo: "entrada", cantidad, motivo: motivo || "compra" },
      }),
    ]);
    res.status(201).json(medicamento);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Medicamento no encontrado" });
    throw err;
  }
}

// RF-24/RF-15: salida de medicamentos. "venta directa" genera factura de
// farmacia propia (RF-20/RF-27); "uso intrahospitalario" se carga al
// costeo del paciente (RF-15) en vez de facturarse por separado.
export async function registrarSalida(req, res) {
  const { cantidad, motivo, pacienteId } = req.body;
  const medicamentoId = Number(req.params.id);
  if (!cantidad || cantidad <= 0) return res.status(400).json({ error: "cantidad debe ser mayor a 0" });

  try {
    if (motivo === "uso intrahospitalario") {
      if (!pacienteId) return res.status(400).json({ error: "pacienteId es requerido para uso intrahospitalario" });

      const medicamento = await prisma.medicamentoInventario.findUnique({ where: { id: medicamentoId } });
      if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });
      if (medicamento.stock < cantidad) return res.status(409).json({ error: "Stock insuficiente" });

      const costo = Number(medicamento.precioVenta) * cantidad;
      const [, , tratamiento] = await prisma.$transaction([
        prisma.medicamentoInventario.update({ where: { id: medicamentoId }, data: { stock: { decrement: cantidad } } }),
        prisma.movimientoInventario.create({
          data: { medicamentoId, tipo: "salida", cantidad, motivo: "uso intrahospitalario" },
        }),
        prisma.tratamientoItem.create({
          data: {
            pacienteId: Number(pacienteId),
            descripcion: medicamento.nombre,
            dosis: `${cantidad} unidad(es)`,
            costo,
            origen: "farmacia",
          },
        }),
      ]);
      return res.status(201).json({ ok: true, tratamiento });
    }

    // motivo por defecto: "venta directa"
    const resultado = await registrarVentaFarmacia({
      medicamentoId,
      cantidad: Number(cantidad),
      registradoPor: req.user.id,
    });
    res.status(201).json({ ok: true, ...resultado });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}
