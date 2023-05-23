import { Request, Response, NextFunction, Router } from "express"

import { renderPageType } from "./utils";
import winston from "winston";
import asyncHandler from 'express-async-handler';
import { DeviceServiceTypes, ExperimentServiceTypes } from "@cross-lab-project/api-client";

export function experiment_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    async function experiment(req: Request, res: Response, _next: NextFunction) {
        let experiment: ExperimentServiceTypes.Experiment = {}
        if (req.method === 'GET') {
            try {
                experiment = await buildSimpleExperiment(req)
            } catch (e) {
                //ignore
            }
        }

        if (req.method === 'POST') {
            experiment = JSON.parse(req.body.experiment)
            experiment.status = 'running'
            console.log(JSON.stringify(experiment, null, 2))
            const response = await req.apiClient.createExperiment(experiment)
            if (response.status === 'setup' && response.url) {
                return experimentSetup(req, res, _next, response)
            }
        }


        const pspuGroup = await req.apiClient.getDevice('https://api.goldi-labs.de/devices/16148f37-9f90-4b4e-91a0-963faf6571eb')
        if (pspuGroup.type !== 'group') {
            throw new Error('Device is not a group')
        }

        const bpuGroup = await req.apiClient.getDevice('https://api.goldi-labs.de/devices/ab6c9737-a022-448d-b8a6-e0a6c46919fd')
        if (bpuGroup.type !== 'group') {
            throw new Error('Device is not a group')
        }

        console.log({ pspuGroup, bpus: bpuGroup })

        const pspus = await Promise.all(pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url)))
        const bpus = await Promise.all(bpuGroup.devices.map((d) => req.apiClient.getDevice(d.url)))
        return renderPage('experiment', language, res, req.user, { experiment, pspus, bpus });
    }

    async function experimentSetup(req: Request, res: Response, _next: NextFunction, experiment: ExperimentServiceTypes.Experiment) {
        if (experiment.status !== 'setup') {
            throw new Error('Experiment is not in setup phase')
        }
        const instances: { codeUrl: string, instanceUrl: string, deviceToken: string }[] = []
        for (const device of experiment.devices ?? []) {
            if (device.device) {
                const setupProps = device.additionalProperties as { instanceUrl?: string, deviceToken?: string }
                const deviceDetails = await req.apiClient.getDevice(device.device)
                console.log({ deviceDetails, setupProps })
                if (deviceDetails.type === 'edge instantiable' && setupProps.instanceUrl && setupProps.deviceToken && deviceDetails.codeUrl) {
                    device.device = setupProps.instanceUrl
                    instances.push({ codeUrl: deviceDetails.codeUrl, instanceUrl: setupProps.instanceUrl, deviceToken: setupProps.deviceToken })
                }
            }
        }
        await req.apiClient.updateExperiment(experiment.url!, { devices: experiment.devices })
        return renderPage('experiment-setup', language, res, req.user, { experiment, instances });
    }

    async function runExperiment(req: Request, res: Response, _next: NextFunction) {
        const resp = await req.apiClient.updateExperiment(req.query.url as string, { status: 'running' })
        res.send(resp)
        //res.redirect(303, '/' + language + '/index.html');
    }

    const router = Router();
    router.get('/experiment', asyncHandler(experiment));
    router.post('/experiment', asyncHandler(experiment));
    router.get('/run-experiment', asyncHandler(runExperiment));
    return router;
}

const ecpServiceDescription: DeviceServiceTypes.ServiceDescription[] = [{ 'serviceType': 'http://api.goldi-labs.de/serviceTypes/electrical', 'serviceId': 'electrical', 'serviceDirection': 'prosumer', 'interfaces': [{ 'interfaceType': 'gpio', 'availableSignals': { 'gpio': ['_ANY_'] } }] }, { 'serviceId': 'webcam', 'serviceType': 'http://api.goldi-labs.de/serviceTypes/webcam', 'serviceDirection': 'consumer' }]

async function buildSimpleExperiment(req: Request): Promise<ExperimentServiceTypes.Experiment> {
    const pspu = req.query.pspu as string
    const bpu = req.query.bpu as string
    const ecp = 'https://api.goldi-labs.de/devices/cc1de37e-1a6a-4470-affd-12eb41a3231e'

    const devices = [
        { device: pspu, role: 'pspu' },
        { device: bpu, role: 'bpu' },
        { device: ecp, role: 'ecp' },
    ].filter(({ device: url }) => url !== undefined && url !== '')

    const roles: ExperimentServiceTypes.Role[] = devices.map(d => ({ name: d.role }))

    const roleServices = await Promise.all(devices.map(({ device: url, role }) =>
        req.apiClient.getDevice(url).then((device) => ({
            role,
            services: role === "ecp" ? ecpServiceDescription : (device as DeviceServiceTypes.ConcreteDevice).services!
        }))
    ))

    const serviceConfigurations: ExperimentServiceTypes.ServiceConfiguration[] = []
    const serviceTypes = new Set<string>()
    roleServices.flatMap(({ services }) => services.map(({ serviceType }) => serviceType!)).forEach((t) => serviceTypes.add(t))
    for (const serviceType of serviceTypes) {
        let participants: (ExperimentServiceTypes.Participant & { description: any })[] = []
        for (const { role, services } of roleServices) {
            for (const service of services.filter((s) => s.serviceType === serviceType)) {
                participants.push({ role, serviceId: service.serviceId, description: service })
            }
        }
        if (participants.length >= 1) {
            if (serviceType === 'http://api.goldi-labs.de/serviceTypes/electrical') {
                const rDI = (s: string) => { try { return s.replace('#', '') } catch (e) { return s } } // remove _DRIVEN_ from signal name
                const interfaces = participants.flatMap((p) => {
                    if (p.description.interfaces)
                        return p.description.interfaces.map((i: any) => ({ role: p.role, interface: i }))
                    else
                        return []
                })
                const gpioInterfaces = interfaces.filter((i) => i.interface.interfaceType === 'gpio')
                const buses = gpioInterfaces.flatMap(i => {
                    const isDriven = ['inout', 'out'].includes(i.interface.direction)
                    if (i.role === 'ecp') return []
                    if (isDriven) {
                        return i.interface.availableSignals.gpio.filter((s: string) => s.length > 4).map((s: string) => ['#' + s])
                    } else {
                        return i.interface.availableSignals.gpio.filter((s: string) => s.length > 4).map((s: string) => [s])
                    }
                })
                for (const i of gpioInterfaces) {
                    if (i.role === 'ecp') continue
                    const freeSignals = i.interface.availableSignals.gpio.filter((s: string) => s.length <= 4)
                    for (const bus of buses) {
                        const signal = freeSignals.shift()
                        if (signal) {
                            bus.push(signal)
                        }
                    }
                }
                let id = 0
                for (const participant of participants) {
                    if (participant.role === 'ecp') {
                        participant.config = {
                            interfaces: buses.map((bus) => ({
                                interfaceId: (++id).toString(),
                                interfaceType: 'gpio',
                                signals: { gpio: bus.map(rDI).join(' / ') },
                                busId: rDI(bus[0]),
                                direction: bus.some((s: string) => s.startsWith('#')) ? 'in' : 'inout',
                                driver: participant.role
                            })),
                        }
                    } else {
                        const interfaces = [participant].flatMap((p) => {
                            if (p.description.interfaces)
                                return p.description.interfaces.map((i: any) => ({ role: p.role, interface: i }))
                            else
                                return []
                        })

                        const gpioInterfaces = interfaces.filter((i) => i.interface.interfaceType === 'gpio')
                        const signals = gpioInterfaces.flatMap((i) => i.interface.availableSignals.gpio.map((s: string) => {
                            const isDriven = ['inout', 'out'].includes(i.interface.direction)
                            if (isDriven) {
                                return '#' + s
                            }else{
                                return s
                            }
                        }))
                        const mappedSignals = signals.filter((s) => buses.find((b) => b.includes(s)))
                        participant.config = {
                            interfaces: mappedSignals.map((signal) => ({
                                interfaceId: (++id).toString(),
                                interfaceType: 'gpio',
                                signals: { gpio: rDI(signal) },
                                busId: rDI(buses.find((b) => b.includes(signal))![0]),
                                direction: signal.startsWith('#') ? 'out' : 'in',
                                driver: participant.role
                            })),
                        }
                    }
                }
            } else {
                participants = participants.map((p) => ({ ...p, config: {} }))
            }
            participants = participants.map((p) => ({ ...p, description: undefined }))
            serviceConfigurations.push({ serviceType, configuration: {}, participants })
        }
    }

    return { devices, roles, serviceConfigurations }

}