import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  setRefreshTokenCookie,
  setAccessTokenCookie,
} from "../utils/auth.utils";
import { IS_PRODUCTION } from "../config/env";

export const signupJobSeeker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.signupJobSeeker(
      name,
      email,
      password
    );

    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.status(201).json({ message: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
};

export const signupRecruiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await AuthService.signupRecruiter(req.body);

    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.status(201).json({ message: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
};

export const upgradeToRecruiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const { user, tokens } = await AuthService.upgradeToRecruiter(userId, req.body);

    // Re-issue cookies so the RECRUITER role is active immediately
    setRefreshTokenCookie(res, tokens.refreshToken);
    setAccessTokenCookie(res, tokens.accessToken);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.login(email, password);

    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    next(err);
  }
};

export const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ error: "No refresh token provided" });
      return;
    }

    const { accessToken, refreshToken } = await AuthService.refreshTokens(token);

    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookieOpts = {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax" as const,
    };
    res.clearCookie("refreshToken", cookieOpts);
    res.clearCookie("accessToken", cookieOpts);

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const user = await AuthService.getCurrentUser(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
