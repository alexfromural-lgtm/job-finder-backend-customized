import { Router } from "express";

import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import * as RecruiterController from "../controllers/recruiter.controller";

const router = Router();

router
  .route("/profile")
  .get(requireAuth, authorizeRoles("RECRUITER"), RecruiterController.getProfile)

export default router;
