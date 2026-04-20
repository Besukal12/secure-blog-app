import { Router } from "express";
import { forgotPassword, googleAuthCallback, googleAuthStarter, login, logout, refreshToken, register, resetPassword, verifyEmail } from "../controller/auth.controller";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router()

router.post("/register", authLimiter, register)
router.get("/verify-email", authLimiter, verifyEmail)
router.post("/login", authLimiter, login)
router.post("/logout", authLimiter, logout)
router.post("/refresh", authLimiter, refreshToken)
router.post("/forgot-password", authLimiter, forgotPassword)
router.post("/reset-password", authLimiter, resetPassword)
router.get("/google", authLimiter, googleAuthStarter)
router.get("/google/callback", authLimiter, googleAuthCallback)

export default router