import { Router } from "express";
import {signupJobSeeker, signupRecruitor, upgradeToRecruiter, login, getMe, logout} from "../controllers/auth.controller";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { recruiterSignupSchema } from "../validators/recruiter.schema";
import { signupSchema } from "../validators/jobseeker.schema";

const router = Router();

router.post('/signup/jobseeker', validate(signupSchema), signupJobSeeker);
router.post('/signup/recruiter', validate(recruiterSignupSchema),signupRecruitor);
router.post('/upgrade/recruiter', requireAuth, authorizeRoles("JOB_SEEKER"), upgradeToRecruiter);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;