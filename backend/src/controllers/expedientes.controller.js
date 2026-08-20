// Controlador: Expediente Clinico / Diagnostico confidencial (Modulo 2)
// Acceso protegido por el middleware requireTempToken (RF-11, RF-33, RF-34):
// solo el Administrador o un usuario con token de acceso temporal vigente
// puede ver o modificar el contenido de este controlador.
import { prisma } from "../config/prisma.js";
import { encrypt, decrypt } from "../utils/crypto.util.js";
import { ROLES } from "../utils/roles.util.js";

const KEY = process.env.ENCRYPTION_KEY;

// Lista solo metadatos (sin el contenido del diagnostico) para saber si
// un paciente ya tiene expediente registrado, sin exponer datos sensibles.
export async function listar(req, res) {
  const diagnosticos = await prisma.diagnostico.findMany({
    select: { id: true, pacienteId: true, codigoCie: true, creadoEn: true },
    orderBy: { creadoEn: "desc" },
    take: 50,
  });
  res.json(diagnosticos);
}

// RF-10/RF-11: obtener el diagnostico de un paciente, descifrado
export async function obtenerUno(req, res) {
  const diagnostico = await prisma.diagnostico.findFirst({
    where: { pacienteId: Number(req.params.id) },
    orderBy: { creadoEn: "desc" },
  });
  if (!diagnostico) return res.status(404).json({ error: "Este paciente no tiene diagnostico registrado" });

  const texto = decrypt(
    { encrypted: diagnostico.textoCifrado, iv: diagnostico.iv, authTag: diagnostico.authTag },
    KEY
  );

  // RNF-08: deja constancia de quien vio el diagnostico y cuando
  await prisma.accesoDiagnostico.create({
    data: {
      pacienteId: diagnostico.pacienteId,
      usuarioId: req.user.id,
      accion: "ver",
      viaToken: req.user.rol !== ROLES.ADMIN,
      tokenId: req.tempToken?.id ?? null,
    },
  });

  res.json({
    id: diagnostico.id,
    pacienteId: diagnostico.pacienteId,
    codigoCie: diagnostico.codigoCie,
    diagnostico: texto,
    registradoPor: diagnostico.registradoPor,
    creadoEn: diagnostico.creadoEn,
  });
}

// RF-10: registrar el diagnostico, cifrado antes de guardarse
export async function crear(req, res) {
  const { texto, codigoCie } = req.body;
  const pacienteId = Number(req.params.id ?? req.body.pacienteId);
  if (!texto || !pacienteId) {
    return res.status(400).json({ error: "pacienteId y texto son requeridos" });
  }

  const { encrypted, iv, authTag } = encrypt(texto, KEY);
  const diagnostico = await prisma.diagnostico.create({
    data: { pacienteId, textoCifrado: encrypted, iv, authTag, codigoCie, registradoPor: req.user.id },
  });

  // RNF-08: deja constancia de quien registro/edito el diagnostico y cuando
  await prisma.accesoDiagnostico.create({
    data: {
      pacienteId,
      usuarioId: req.user.id,
      accion: "registrar",
      viaToken: req.user.rol !== ROLES.ADMIN,
      tokenId: req.tempToken?.id ?? null,
    },
  });

  res.status(201).json({ ok: true, id: diagnostico.id, pacienteId, codigoCie, creadoEn: diagnostico.creadoEn });
}
