import dotenv from 'dotenv'
dotenv.config()

export const config = {
    PORT: process.env.GOLDI_FRONTEND_PORT ? parseInt(process.env.GOLDI_FRONTEND_PORT) : 9000,
    DEFAULT_LANGUAGE: process.env.GOLDI_FRONTEND_DEFAULT_LANGUAGE || 'en',
    NODE_ENV: process.env.NODE_ENV || "development",
    API_URL: process.env.GOLDI_API_URL ?? "https://api.dev.goldi-labs.de",
    SECURITY_ISSUER: process.env.GOLDI_SECURITY_ISSUER!,
    SECURITY_AUDIENCE: process.env.SECURITY_AUDIENCE,
}