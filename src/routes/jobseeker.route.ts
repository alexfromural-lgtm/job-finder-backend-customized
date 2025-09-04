import { Router } from "express";

import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import {getProfile } from "../controllers/jobseeker.controller";

const router = Router();

router.get("/profile", requireAuth, authorizeRoles("JOB_SEEKER"), getProfile);

export default router;
