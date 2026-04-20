import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import adminRoutes from "./routes/admin.routes"
import { globalLimiter } from "./middleware/rateLimiter";
import helmet from "helmet";
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'

const app= express()

app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))

app.use(express.json())

app.use(cookieParser())
app.use(globalLimiter)

app.use(mongoSanitize())

app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/admin", adminRoutes)

export default app;