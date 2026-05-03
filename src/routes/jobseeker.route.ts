import { Router } from "express";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { applicationSchema } from "../validators/application.schema";
import * as JobseekerController from "../controllers/jobseeker.controller";

const router = Router();

// Profile
router.get("/profile", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.getProfile);
router.patch("/profile", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.updateProfile);

// Applications
router.post("/apply/:jobId", requireAuth, authorizeRoles("JOB_SEEKER"), validate(applicationSchema), JobseekerController.applyToJob);
router.get("/applications", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.getApplications);
router.delete("/applications/:id", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.withdrawApplication);

// Saved jobs
router.post("/saved/:jobId", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.saveJob);
router.get("/saved", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.getSavedJobs);
router.delete("/saved/:jobId", requireAuth, authorizeRoles("JOB_SEEKER"), JobseekerController.unsaveJob);

export default router;
