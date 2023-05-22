import { Request, Response, NextFunction, Router } from "express"

import { renderPageType } from "../utils";
import winston from "winston";
import asyncHandler from 'express-async-handler';

export function role_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    async function roles(req: Request, res: Response, _next: NextFunction) {
        const roles = await req.apiClient.listRoles()
        return renderPage('admin/roles/index', language, res, req.user, { roles });
    }

    async function createRole(req: Request, res: Response, _next: NextFunction) {
        if (req.method === 'POST') {
            req.body.scopes = JSON.parse(req.body.scopes)
            const role = await req.apiClient.createRole(req.body)
            res.redirect(303, '/' + language + '/admin/roles/details?url=' + encodeURIComponent(role.url))
            return;
        }
        return renderPage('admin/roles/details', language, res, req.user, { create: true });
    }

    async function roleDetails(req: Request, res: Response, _next: NextFunction) {
        if (req.method === 'POST') {
            req.body.scopes = JSON.parse(req.body.scopes)
            await req.apiClient.updateRole(req.query.url as string, req.body)
        }
        const role = await req.apiClient.getRole(req.query.url as string);

        return renderPage('admin/roles/details', language, res, req.user, { role });
    }

    async function roleDelete(req: Request, res: Response, _next: NextFunction) {
        await req.apiClient.deleteRole(req.query.url as string);
        res.redirect(303, '/' + language + '/admin/roles');
    }

    const router = Router();
    router.get('/', asyncHandler(roles));
    router.get('/create', asyncHandler(createRole));
    router.post('/create', asyncHandler(createRole));
    router.get('/delete', asyncHandler(roleDelete));
    router.get('/details', asyncHandler(roleDetails));
    router.post('/details', asyncHandler(roleDetails));

    return router;
}