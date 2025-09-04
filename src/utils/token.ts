import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, roles: Role[]) => {
	return jwt.sign({ userId , roles}, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '15m',
	});
};

export const generateRefreshToken = (userId: string, roles: Role[]) => {
	return jwt.sign({ userId , roles}, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '7d',
	});
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
		userId: string;
	};
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
		userId: string;
		roles: Role[]
	};
};

