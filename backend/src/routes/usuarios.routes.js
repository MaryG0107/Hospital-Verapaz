import { Router } from "express";
import * as controller from "../controllers/usuarios.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 8: Seguridad y Roles. Gestion de usuarios, solo Administrador (RF-32, RF-34).
const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);

export default router;
