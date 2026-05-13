import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import jobseekerRoutes from "./routes/jobseeker.route";
import recruiterRoutes from "./routes/recruiter.route";
import jobRoutes from "./routes/job.route";
import queueRoutes from "./routes/queue.route";
import "./queue/worker"; // start the worker on server boot
import { ENV, IS_PRODUCTION, IS_DEVELOPMENT } from "./config/env";

dotenv.config();

// ── Environment constants ──────────────────────────────────────────────────────
// In development the frontend dev-server runs on localhost:3000 by default.
// In production CORS_ORIGIN must be explicitly set via an env variable.
const CORS_ORIGIN =
  ENV.CORS_ORIGIN ?? (IS_DEVELOPMENT ? "http://localhost:3000" : undefined);

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

// Security: set secure HTTP headers (should be first)
app.use(helmet());

// Performance: gzip compression in production
if (IS_PRODUCTION) {
  app.use(compression());
}

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/jobseeker", jobseekerRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/queue", queueRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
});
