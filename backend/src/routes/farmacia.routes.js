import { Router } from "express";
import * as controller from "../controllers/farmacia.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 6: Farmacia (inventario y ventas propias). Actor: Farmacia.
const router = Router();

router.use(requireAuth);

const soloFarmacia = requireRole(ROLES.FARMACIA, ROLES.ADMIN);

router.get("/", controller.listar); // RF-22
router.get("/:id", controller.obtenerUno);
router.post("/", soloFarmacia, controller.crear);
router.put("/:id", soloFarmacia, controller.actualizar);
router.post("/:id/entradas", soloFarmacia, controller.registrarEntrada); // RF-23
router.post("/:id/salidas", soloFarmacia, controller.registrarSalida); // RF-24/RF-20/RF-27

export default router;
