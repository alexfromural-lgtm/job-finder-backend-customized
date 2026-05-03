import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const signupJobSeeker = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.signupJobSeeker(
      name,
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ accessToken });
  } catch (error: Error | any) {
    res.status(400).json({ error: error.message });
  }
};

export const signupRecruitor = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.signupRecruitor({
      name,
      email,
      password,
      ...req.body,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ accessToken });
  } catch (error: Error | any) {
    res.status(400).json({ error: error.message });
  }
};

export const upgradeToRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const upgradedUser = await AuthService.upgradeToRecruiter(userId, req.body);

    res.status(201).json({ data: upgradedUser });
  } catch (error: Error | any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.login(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error: Error | any) {
    res.status(400).json({ error: error.message });
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ error: "No refresh token provided" });
      return;
    }

    const { accessToken, refreshToken } = await AuthService.refreshTokens(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error: Error | any) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err: Error | any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await AuthService.getCurrentUser(userId);
    res.json({ user });
  } catch (err: Error | any) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
