import { Request, Response, NextFunction } from "express";

function requireRole(role: "user" | "admin") {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;
    const authUser = authReq.user;

    if (!authUser) {
      return res.status(401).json({
        message: "You are not authenticated. Please Login to Access.",
      });
    }

    if (authUser.role !== role) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }
    next();
  };
}

export default requireRole;