// Datos iniciales para poder probar el sistema de punta a punta.
// Ejecutar con: npm run prisma:seed
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../src/utils/roles.util.js";

const prisma = new PrismaClient();

async function usuario(nombre, correo, password, rol, puedeAutogenerarToken = false) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.usuario.upsert({
    where: { correo },
    update: {},
    create: { nombre, correo, passwordHash, rol, puedeAutogenerarToken },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@hospitalverapaz.gt";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "CambiarEsta123";

  await usuario("Administrador General", adminEmail, adminPassword, ROLES.ADMIN);
  await usuario("Recepción / Admisión", "recepcion@hospitalverapaz.gt", "Recepcion123", ROLES.RECEPCION);
  await usuario("Dra. Ana Choc", "aChoc@hospitalverapaz.gt", "Consulta123", ROLES.CONSULTA, true); // RF-34
  await usuario("Enfermería Turno Mañana", "enfermeria@hospitalverapaz.gt", "Enfermeria123", ROLES.ENFERMERIA);
  await usuario("Facturación", "facturacion@hospitalverapaz.gt", "Facturacion123", ROLES.FACTURACION);
  await usuario("Farmacia", "farmacia@hospitalverapaz.gt", "Farmacia123", ROLES.FARMACIA);

  await prisma.medicamentoInventario.createMany({
    data: [
      { nombre: "Paracetamol 500mg", tipo: "Analgésico", stock: 320, stockMinimo: 50, precioVenta: 2.5, proveedor: "Farmaquímica S.A." },
      { nombre: "Amoxicilina 500mg", tipo: "Antibiótico", stock: 8, stockMinimo: 20, precioVenta: 4.0, proveedor: "Distribuidora Cobán" },
      { nombre: "Insulina Glargina", tipo: "Hormona", stock: 15, stockMinimo: 10, precioVenta: 85.0, proveedor: "MedSupply GT", fechaVencimiento: new Date("2026-09-01") },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completado.");
  console.log(`Administrador: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
