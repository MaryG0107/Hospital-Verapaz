import { Router } from "express";
import * as controller from "../controllers/referidos.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 4: Clientes Referidos. Actores: Recepcion/Administrador.
const router = Router();

router.use(requireAuth);

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", requireRole(ROLES.RECEPCION, ROLES.ADMIN), controller.crear);
router.put("/:id", requireRole(ROLES.RECEPCION, ROLES.ADMIN), controller.actualizar);

export default router;
