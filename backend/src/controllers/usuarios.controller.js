// Controlador: gestion de usuarios (Modulo 8 - Seguridad y Roles)
// Solo el Administrador puede listar, crear o reasignar roles/permisos (RF-32, RF-34).
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { ROLES_VALIDOS } from "../utils/roles.util.js";

const SELECT_PUBLICO = {
  id: true, nombre: true, correo: true, rol: true, puedeAutogenerarToken: true, creadoEn: true,
};

export async function listar(req, res) {
  const usuarios = await prisma.usuario.findMany({ select: SELECT_PUBLICO, orderBy: { nombre: "asc" } });
  res.json(usuarios);
}

export async function obtenerUno(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(req.params.id) }, select: SELECT_PUBLICO });
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuario);
}

export async function crear(req, res) {
  const { nombre, correo, password, rol, puedeAutogenerarToken } = req.body;
  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: "nombre, correo, password y rol son requeridos" });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: `rol debe ser uno de: ${ROLES_VALIDOS.join(", ")}` });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, correo, passwordHash, rol, puedeAutogenerarToken: !!puedeAutogenerarToken },
    select: SELECT_PUBLICO,
  });
  res.status(201).json(usuario);
}

// RF-32/RF-34: el Administrador reasigna rol y/o el permiso de autogenerar tokens
export async function actualizar(req, res) {
  const { nombre, rol, puedeAutogenerarToken } = req.body;
  if (rol && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: `rol debe ser uno de: ${ROLES_VALIDOS.join(", ")}` });
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: { nombre, rol, puedeAutogenerarToken },
      select: SELECT_PUBLICO,
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Usuario no encontrado" });
    throw err;
  }
}
