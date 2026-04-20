import ratelimit from 'express-rate-limit'

export const globalLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        messsage: "To many request from this IP, please try again later."
    },
    standardHeaders: "draft-7",
    legacyHeaders: false,
})

export const authLimiter = ratelimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        messsage: "Too many login attempts. Please try again in an hour."
    },
    standardHeaders: "draft-7",
    legacyHeaders: false,
})