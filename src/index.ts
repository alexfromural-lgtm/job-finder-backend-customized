import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import jobseekerRoutes from "./routes/jobseeker.route";
import recruiterRoutes from "./routes/recruiter.route";
import jobRoutes from "./routes/job.route";
import queueRoutes from "./routes/queue.route";
import "./queue/worker"; // start the worker on server boot

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/jobseeker", jobseekerRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/queue", queueRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
