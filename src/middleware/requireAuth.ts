import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/token";
import User from "../models/user.model";

async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Unauthorized request",
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        message: "Invalid token version.",
      });
    }

    const authReq = req as any;
    authReq.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Unauthorized request",
    });
  }
}

export default requireAuth;