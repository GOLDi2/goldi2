import { NextFunction, Request, Response, Router } from "express";

import asyncHandler from 'express-async-handler';
import winston from "winston";
import { renderPageType } from "../utils";

export function device_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    async function devices(req: Request, res: Response, _next: NextFunction) {
        const devices = await req.apiClient.listDevices()
        return renderPage('admin/devices/index', language, res, req.user, { devices });
    }

    async function createDevice(req: Request, res: Response, _next: NextFunction) {
        const type = req.query.type as string || 'device'
        if (req.method === 'POST') {
            if (req.body.type === 'group') {
                req.body.devices = req.body.devices?.map((device: string) => ({ url: device })) ?? []
            }
            if (req.body.services === ''){
                delete req.body.services
            }
            req.body.isPublic = req.body.isPublic === 'Yes'
            console.log(req.body)
            try{
                const device = await req.apiClient.createDevice({...req.body, isPublic: true})
            res.redirect(303, '/' + language + '/admin/devices/details?url=' + encodeURIComponent(device.url))
            } catch (e){
                console.log(e)
            }
            return;
        }
        const devices = type === 'group' ? (await req.apiClient.listDevices()) : undefined
        return renderPage('admin/devices/details', language, res, req.user, { devices, create: true, type });
    }

    async function deviceDetails(req: Request, res: Response, _next: NextFunction) {
        if (req.method === 'POST') {
            if (req.body.type === 'group') {
                req.body.devices = req.body.devices?.map((device: string) => ({ url: device })) ?? []
            }
            if (req.body.type === 'device') {
                req.body.services = JSON.parse(req.body.services)
            }
            req.body.isPublic = req.body.isPublic === 'Yes'
            await req.apiClient.updateDevice(req.query.url as string, req.body)
        }
        const device = await req.apiClient.getDevice(req.query.url as string);
        let params = {}
        if (device.type === 'group') {
            const devices = (await req.apiClient.listDevices())
            const includedDevices = devices.filter((d) => device.devices.find((dd) => dd.url === d.url))
            const excludedDevices = devices.filter((d) => !device.devices.find((dd) => dd.url === d.url))

            params = { includedDevices, excludedDevices }
        }   
        return renderPage('admin/devices/details', language, res, req.user, { device, type: device.type, ...params });
    }

    async function deviceDelete(req: Request, res: Response, _next: NextFunction) {
        await req.apiClient.deleteDevice(req.query.url as string);
        res.redirect(303, '/' + language + '/admin/devices');
    }

    async function deviceToken(req: Request, res: Response, _next: NextFunction) {
        const url = req.query.url as string;
        const token = req.user?.username ? await req.apiClient.createToken({
            username: req.user?.username,
            claims: { device_token: true },
        }) : "";
        return renderPage('admin/devices/token', language, res, req.user, { token, url });
    }

    const router = Router();
    router.get('/', asyncHandler(devices));
    router.get('/create', asyncHandler(createDevice));
    router.post('/create', asyncHandler(createDevice));
    router.get('/delete', asyncHandler(deviceDelete));
    router.get('/details', asyncHandler(deviceDetails));
    router.post('/details', asyncHandler(deviceDetails));
    router.post('/token', asyncHandler(deviceToken));

    return router;
}