import { Router } from "express";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { jobSchema } from "../validators/job.schema";
import * as JobController from "../controllers/job.controller";

const router = Router();

// Public
router.get("/all", JobController.getAllJobs);

// Recruiter only
router.post(
  "/",
  requireAuth,
  authorizeRoles("RECRUITER"),
  validate(jobSchema),
  JobController.createJob
);

router.get(
  "/recruiter",
  requireAuth,
  authorizeRoles("RECRUITER"),
  JobController.getJobsByRecruiter
);

// Must be AFTER specific routes to prevent wildcard from catching /recruiter
router.get("/:id", JobController.getJobById);

router.put(
  "/:id",
  requireAuth,
  authorizeRoles("RECRUITER"),
  validate(jobSchema.partial()),
  JobController.updateJob
);

router.delete(
  "/:id",
  requireAuth,
  authorizeRoles("RECRUITER"),
  JobController.deleteJob
);

export default router;
