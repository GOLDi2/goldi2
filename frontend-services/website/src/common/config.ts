export interface GoldiServiceConfig {
    PORT: number,
    NODE_ENV: "production" | "development" | "install" | string
    API_URL: string,
    SECURITY_ISSUER: string | undefined,
    SECURITY_AUDIENCE: string | undefined
}