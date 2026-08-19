import { Router } from "express";
import * as controller from "../controllers/tratamientos.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 3: Tratamiento y Medicamentos Intrahospitalarios. Actores: Enfermeria/Medico.
const router = Router();

router.use(requireAuth);

router.get("/", controller.listar);
router.get("/:id", controller.obtenerUno);
router.post("/", requireRole(ROLES.ENFERMERIA, ROLES.CONSULTA, ROLES.ADMIN), controller.crear);
router.put("/:id", requireRole(ROLES.ENFERMERIA, ROLES.CONSULTA, ROLES.ADMIN), controller.actualizar);

export default router;
