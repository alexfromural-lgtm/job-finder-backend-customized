import { Role } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";

export const generateAccessToken = (userId: string, roles: Role[]) => {
  return jwt.sign({ userId, roles }, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (userId: string, roles: Role[]) => {
  return jwt.sign({ userId, roles }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as {
    userId: string;
    roles: Role[];
  };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as {
    userId: string;
    roles: Role[];
  };
};
