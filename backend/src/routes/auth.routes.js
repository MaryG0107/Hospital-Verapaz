import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ROLES } from "../utils/roles.util.js";

// Modulo 8: Seguridad y Roles (RF-29, RF-30, RF-33, RF-34)
const router = Router();

router.post("/login", controller.login);
router.post("/logout", requireAuth, controller.logout);
router.post("/token", requireAuth, requireRole(ROLES.ADMIN), controller.solicitarTokenTemporal); // RF-33
router.post("/token/auto", requireAuth, controller.autogenerarTokenTemporal); // RF-34

export default router;
