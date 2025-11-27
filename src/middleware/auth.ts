import type { Response, NextFunction } from "express";
import type { IRequest, IJwtPayload } from "../types/index.ts";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticate = (req: IRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
        status: "Error",
        message: "Unauthorized"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as IJwtPayload;
    req.user_id = Number(decoded?.user_id);
    next();
  } catch (err) {
    return res.status(401).json({
        status: "Error",
        message: "Invalid token"
    });
  }
};