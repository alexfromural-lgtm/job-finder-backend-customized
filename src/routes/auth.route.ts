import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signupJobSeeker,
  signupRecruitor,
  upgradeToRecruiter,
  login,
  logout,
  refreshTokens,
  getMe,
} from "../controllers/auth.controller";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { recruiterSignupSchema } from "../validators/recruiter.schema";
import { signupSchema } from "../validators/jobseeker.schema";

const router = Router();

// Brute-force protection: login & token refresh
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

// Signup spam protection
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many accounts created, please try again later." },
});

router.post("/signup/jobseeker", signupLimiter, validate(signupSchema), signupJobSeeker);
router.post("/signup/recruiter", signupLimiter, validate(recruiterSignupSchema), signupRecruitor);
router.post("/upgrade/recruiter", requireAuth, authorizeRoles("JOB_SEEKER"), upgradeToRecruiter);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", authLimiter, refreshTokens);
router.get("/me", requireAuth, getMe);

export default router;