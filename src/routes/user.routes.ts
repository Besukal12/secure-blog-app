import { Request, Response, Router } from "express";
import requireAuth from "../middleware/requireAuth";
import { fetchBlogs } from "../controller/blog.controller";

const router = Router();

router.get("/Profile", requireAuth, (req: Request, res: Response) => {
  const authReq = req as any;
  const authUser = authReq.user;

  return res.status(200).json({
    message: "User profile",
    user: authUser,
  });
});
router.get("/blogs", requireAuth, fetchBlogs)

export default router