import { Router } from "express";
import * as controller from "../controllers/recetas.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Recetas medicas (Modulo 3). Actores: Medico/Consulta y Administrador.
const router = Router();

router.use(requireAuth);

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", requireRole(ROLES.CONSULTA, ROLES.ADMIN), controller.crear);

export default router;
