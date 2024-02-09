import { Request, Response, NextFunction, Router } from "express"

import { renderPageType } from "../utils";
import winston from "winston";
import asyncHandler from 'express-async-handler';

export function user_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    async function users(req: Request, res: Response, _next: NextFunction) {
        const users = await req.apiClient.listUsers()
        return renderPage('admin/users/index', language, res, req.user, { users });
    }

    async function createUser(req: Request, res: Response, _next: NextFunction) {
        const type = req.query.type as string || 'user'
        if (req.method === 'POST') {
            if (req.body.type === 'group') {
                req.body.users = req.body.users.map((user: string) => ({ url: user }))
            }
            console.log(req.body)
            const user = await req.apiClient.createUser({ username: req.body.username, password: req.body.password })
            res.redirect(303, '/' + language + '/admin/users/details?url=' + encodeURIComponent(user.url))
            return;
        }
        const users = type === 'group' ? (await req.apiClient.listUsers()) : undefined
        const roles: any = []//await req.apiClient.listRoles()
        return renderPage('admin/users/details', language, res, req.user, { users, roles, create: true, type });
    }

    async function userDetails(req: Request, res: Response, _next: NextFunction) {
        if (req.method === 'POST') {
            if (req.body.password === '') {
                delete req.body.password
            }
            /*const user = await req.apiClient.updateUser(req.query.url as string, req.body)
            const userRoles = await req.apiClient.getRolesOfUser(user.id)
            const rolesToDelete = userRoles.filter((ur) => !req.body.roles.find((r: string) => r === ur.id))
            await req.apiClient.addRolesToUser(req.body.roles, user.id)
            await req.apiClient.removeRolesFromUser(rolesToDelete.map(r => r.id), user.id)*/
        }
        const user = await req.apiClient.getUser(req.query.url as string);
        //const userRoles: any = [];//await req.apiClient.getRolesOfUser(user.id)
        //const roles: any = [] //await req.apiClient.listRoles()
        const includedRoles: any  = []//roles.filter((r) => userRoles.find((ur) => ur.url === r.url))
        const excludedRoles: any  = [] //roles.filter((r) => !userRoles.find((ur) => ur.url === r.url))

        return renderPage('admin/users/details', language, res, req.user, { user, includedRoles, excludedRoles });
    }

    async function userDelete(req: Request, res: Response, _next: NextFunction) {
        await req.apiClient.deleteUser(req.query.url as string);
        res.redirect(303, '/' + language + '/admin/users');
    }

    const router = Router();
    router.get('/', asyncHandler(users));
    router.get('/create', asyncHandler(createUser));
    router.post('/create', asyncHandler(createUser));
    router.get('/delete', asyncHandler(userDelete));
    router.get('/details', asyncHandler(userDetails));
    router.post('/details', asyncHandler(userDetails));

    return router;
}