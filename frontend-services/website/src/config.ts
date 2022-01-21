import dotenv from 'dotenv'
dotenv.config()

export const config = {
    PORT: process.env.GOLDI_FRONTEND_PORT ? parseInt(process.env.GOLDI_FRONTEND_PORT) : 9000,
    NODE_ENV: process.env.NODE_ENV || "development",
    API_URL: process.env.GOLDI_API_URL ?? "http://localhost:3000",
    SECURITY_ISSUER: process.env.GOLDI_SECURITY_ISSUER!,
    SECURITY_AUDIENCE: process.env.SECURITY_AUDIENCE,
}