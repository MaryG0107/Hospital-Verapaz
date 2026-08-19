import { Router } from "express";
import * as controller from "../controllers/pacientes.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 1: Registro y Admision. Actor principal: Recepcion/Admision.
const router = Router();

router.use(requireAuth);

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", requireRole(ROLES.RECEPCION, ROLES.ADMIN), controller.crear);
router.put("/:id", requireRole(ROLES.RECEPCION, ROLES.ADMIN), controller.actualizar);

export default router;
