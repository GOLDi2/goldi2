import dotenv from 'dotenv'
dotenv.config()

export const config = {
    PORT: process.env.GOLDI_HARDWARE_ADMIN_PORT ? parseInt(process.env.GOLDI_HARDWARE_ADMIN_PORT) : 80,
    DEFAULT_LANGUAGE: process.env.GOLDI_HARDWARE_ADMIN_DEFAULT_LANGUAGE || 'en',
    NODE_ENV: process.env.NODE_ENV || "development",
}