import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
    userId? : string,
	roles?: Role[]
}

export const requireAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing access token' });
		return;
	}

	const token = authHeader.split(' ')[1];

	try {
		const payload = verifyAccessToken(token);
		req.userId = payload.userId;
		req.roles = payload.roles;
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired access token' });
	}
};

export const authorizeRoles = (...roles: Role[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.roles || !req.roles.some(role => roles.includes(role))) {
			res.status(403).json({ message: "Access denied." });
			return;
		}
		next();
	};
}
