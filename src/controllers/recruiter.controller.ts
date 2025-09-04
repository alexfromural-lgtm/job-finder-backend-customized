import { Request, Response } from "express";
import * as RecruiterService from "../services/recruiter.service";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) res.status(401).json({ error: "Unauthorized" });

    const profile = await RecruiterService.getRecruiterProfile(userId);

    if (!profile) res.status(404).json({ error: "Profile not found" });

    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
