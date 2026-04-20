import { Request, Response, Router } from "express";
import User from "../models/user.model";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import upload from "../middleware/upload";
import { createBlog, deleteBlog } from "../controller/blog.controller";

const router = Router();

router.post(
  "/post",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
  createBlog,
);
router.delete(
  "/delete/:id",
  requireAuth,
  requireRole("admin"),
  deleteBlog
)
router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const user = await User.find(
        {},
        {
          name: 1,
          email: 1,
          role: 1,
          isEmailVerified: 1,
          createdAt: 1,
        },
      ).sort({ createdAt: -1 });

      const result = user.map((user) => {
        return {
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        };
      });

      return res.status(200).json({
        message: "Users fetched successfully.",
        users: result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Internal server error occured. Please try again later,",
      });
    }
  },
);

export default router;
