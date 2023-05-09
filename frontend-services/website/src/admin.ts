import { Request, Response, NextFunction } from "express";
import { renderPageType } from "./utils";
import winston from "winston";
import { DeviceServiceTypes } from "@cross-lab-project/api-client";

export function handle_admin(language: string, renderPage: renderPageType, _logger: winston.Logger){
    async function devices(req: Request, res: Response, _next: NextFunction) {
        const devices=await req.apiClient.listDevices()
        const users=await req.apiClient.listUsers()
        const userMap=Object.fromEntries(users.map(user=>[user.url, user]))
        const deviceDetails=await Promise.all(devices.map(device=>req.apiClient.getDevice(device.url)))
        const deviceDetailsMap=Object.fromEntries(deviceDetails.map(device=>[device.url, device]))
        return renderPage('admin/devices/index', language, res, req.user, {devices, users, userMap, deviceDetailsMap});
    }

    async function createDevice(req: Request, res: Response, _next: NextFunction) {
        if (req.method==='POST'){
            console.log(req.body)
            const device = await req.apiClient.createDevice(req.body)
            res.redirect(303, '/'+language+'/admin/devices/details?url='+encodeURIComponent(device.url))
            return;
        }
        return renderPage('admin/devices/details', language, res, req.user, {create: true});
    }

    async function deviceDetails(req: Request, res: Response, _next: NextFunction) {
        const device = await req.apiClient.getDevice(req.query.url as string);
        return renderPage('admin/devices/details', language, res, req.user, {device});
    }

    async function deviceDelete(req: Request, res: Response, _next: NextFunction) {
        await req.apiClient.deleteDevice(req.query.url as string);
        res.redirect(303, '/'+language+'/admin/devices');
    }

    async function groups(req: Request, res: Response, _next: NextFunction) {
        const devices=(await req.apiClient.listDevices()).filter(device=>device.type==='group')
        const users=await req.apiClient.listUsers()
        const userMap=Object.fromEntries(users.map(user=>[user.url, user]))
        const deviceDetails=(await Promise.all(devices.map(device=>req.apiClient.getDevice(device.url))))
        const deviceDetailsMap=Object.fromEntries(deviceDetails.map(device=>[device.url, device]))
        return renderPage('admin/groups/index', language, res, req.user, {devices, users, userMap, deviceDetailsMap});
    }

    async function createGroup(req: Request, res: Response, _next: NextFunction) {
        if (req.method==='POST'){
            req.body.devices=req.body.devices.map((device:string)=>({url: device}))
            console.log(req.body)
            const device = await req.apiClient.createDevice({type: 'group', devices:[], ...req.body})
            res.redirect(303, '/'+language+'/admin/groups/details?url='+encodeURIComponent(device.url))
            return;
        }
        const devices=(await req.apiClient.listDevices())
        return renderPage('admin/devices/details', language, res, req.user, {devices, create: true, type:'group'});
    }

    async function groupDetails(req: Request, res: Response, _next: NextFunction) {
        if (req.method==='POST'){
            req.body.devices=req.body.devices.map((device:string)=>({url: device}))
            console.log(req.body)
            const rep=await req.apiClient.updateDevice(req.query.url as string, req.body)
            console.log(rep)
        }
        const device = await req.apiClient.getDevice(req.query.url as string) as DeviceServiceTypes.DeviceGroup;
        console.log(device)
        const devices=(await req.apiClient.listDevices())
        const includedDevices=devices.filter((d)=>device.devices.find((dd)=>dd.url===d.url))
        const excludedDevices=devices.filter((d)=>!device.devices.find((dd)=>dd.url===d.url))
        return renderPage('admin/devices/details', language, res, req.user, {device, type:'group', includedDevices, excludedDevices});
    }

    return async function handle_admin(req: Request, res: Response, _next: NextFunction) {
        if (!req.user) {
            res.redirect(303, '/'+language+'/login.html?redirect='+encodeURIComponent(req.path));
            return;
        }
        switch (req.path) {
            case '/devices':
                await devices(req, res, _next);
                break;
            case '/devices/create':
                await createDevice(req, res, _next);
                break;
            case '/devices/delete':
                await deviceDelete(req, res, _next);
                break;
            case '/devices/details':
                await deviceDetails(req, res, _next);
                break;
            case '/groups':
                await groups(req, res, _next);
                break;
            case '/groups/create':
                await createGroup(req, res, _next);
                break;
            case '/groups/details':
                await groupDetails(req, res, _next);
                break;
            default:
                return renderPage('admin/index', language, res, req.user);
        }
    }
}