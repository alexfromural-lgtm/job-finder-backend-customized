import { Router } from "express";

import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { jobSchema } from "../validators/job.schema";
import * as JobController from "../controllers/job.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  authorizeRoles("RECRUITER"),
  validate(jobSchema),
  JobController.createJob
);

router.get("/all", JobController.getAllJobs);

router.get(
  "/recruiter",
  requireAuth,
  authorizeRoles("RECRUITER"),
  JobController.getJobsByRecruiter
);

router.get(
  "/:id",
  JobController.getJobById
);

router.put(
  "/:id",
  requireAuth,
  authorizeRoles(),
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
