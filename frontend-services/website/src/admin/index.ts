import { Router } from "express";
import { renderPageType } from "../utils";
import winston from "winston";
import { device_router } from "./devices";
import { user_router } from "./users";
//import { role_router } from "./roles";

export function admin_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    const router = Router();
    router.use('/devices', device_router(language, renderPage, _logger))
    router.use('/users', user_router(language, renderPage, _logger))
    //router.use('/roles', role_router(language, renderPage, _logger))

    return router;
}