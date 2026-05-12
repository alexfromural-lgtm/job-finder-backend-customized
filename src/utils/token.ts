import { Role } from '@prisma/client';
import jwt, { type SignOptions } from 'jsonwebtoken';

export const generateAccessToken = (userId: string, roles: Role[]) => {
	return jwt.sign({ userId , roles}, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
	});
};

export const generateRefreshToken = (userId: string, roles: Role[]) => {
	return jwt.sign({ userId , roles}, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
	});
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
		userId: string;
		roles: Role[];
	};
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
		userId: string;
		roles: Role[]
	};
};

