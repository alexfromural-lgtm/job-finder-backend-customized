import { Router } from "express";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateRecruiterProfileSchema } from "../validators/recruiter-profile.schema";
import * as RecruiterController from "../controllers/recruiter.controller";

const router = Router();

// Profile
router.get("/profile", requireAuth, authorizeRoles("RECRUITER"), RecruiterController.getProfile);
router.patch("/profile", requireAuth, authorizeRoles("RECRUITER"), validate(updateRecruiterProfileSchema), RecruiterController.updateProfile);

// Applications management
router.get("/jobs/:jobId/applications", requireAuth, authorizeRoles("RECRUITER"), RecruiterController.getApplicationsForJob);
router.patch("/applications/:id/status", requireAuth, authorizeRoles("RECRUITER"), RecruiterController.updateApplicationStatus);

export default router;
