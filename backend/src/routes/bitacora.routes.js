import { Router } from "express";
import * as controller from "../controllers/bitacora.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 7: Bitacora de Visitas. Actores: Enfermeria/Secretaria (asignable por el Administrador).
const router = Router();

router.use(requireAuth);

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", requireRole(ROLES.ENFERMERIA, ROLES.RECEPCION, ROLES.ADMIN), controller.crear);
router.put("/:id", requireRole(ROLES.ENFERMERIA, ROLES.RECEPCION, ROLES.ADMIN), controller.actualizar);

export default router;
