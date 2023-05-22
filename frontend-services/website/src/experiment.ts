import { Request, Response, NextFunction, Router } from "express"

import { renderPageType } from "./utils";
import winston from "winston";
import asyncHandler from 'express-async-handler';
import { DeviceServiceTypes, ExperimentServiceTypes } from "@cross-lab-project/api-client";

export function experiment_router(language: string, renderPage: renderPageType, _logger: winston.Logger) {
    async function experiment(req: Request, res: Response, _next: NextFunction) {
        let experiment: ExperimentServiceTypes.Experiment = {}
        if (req.method === 'GET') {
            try{
            experiment = await buildSimpleExperiment(req)
            }catch(e){
                //ignore
            }
        }

        if (req.method === 'POST') {
            experiment = JSON.parse(req.body.experiment)
            experiment.status = 'running'
            console.log(JSON.stringify(experiment, null, 2))
            const response = await req.apiClient.createExperiment(experiment)
            experiment = response
        }


        const pspuGroup = await req.apiClient.getDevice('https://api.goldi-labs.de/devices/16148f37-9f90-4b4e-91a0-963faf6571eb')
        if (pspuGroup.type !== 'group') {
            throw new Error('Device is not a group')
        }

        const pspus = await Promise.all(pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url)))
        return renderPage('experiment', language, res, req.user, { experiment, pspus });
    }

    const router = Router();
    router.get('/', asyncHandler(experiment));
    router.post('/', asyncHandler(experiment));
    return router;
}

const ecpServiceDescription:DeviceServiceTypes.ServiceDescription[] = [{'serviceType': 'http://api.goldi-labs.de/serviceTypes/electrical', 'serviceId': 'electrical', 'serviceDirection': 'prosumer', 'interfaces': [{'interfaceType': 'gpio', 'availableSignals': {'gpio': ['_ANY_']}}]}, {'serviceId': 'webcam', 'serviceType': 'http://api.goldi-labs.de/serviceTypes/webcam', 'serviceDirection': 'consumer'}]

async function buildSimpleExperiment(req: Request): Promise<ExperimentServiceTypes.Experiment> {
    const pspu = req.query.pspu as string
    const bpu = req.query.bpu as string
    const ecp = 'https://api.goldi-labs.de/devices/cc1de37e-1a6a-4470-affd-12eb41a3231e'

    const devices = [
        { device: pspu, role: 'pspu' },
        { device: bpu, role: 'bpu' },
        { device: ecp, role: 'ecp' },
    ].filter(({ device: url }) => url !== undefined && url !== '')

    const roles: ExperimentServiceTypes.Role[] = devices.map(d=>({name: d.role}))

    const roleServices=await Promise.all(devices.map(({device: url, role} )=>
        req.apiClient.getDevice(url).then((device)=>({
            role,
            services: role==="ecp" ? ecpServiceDescription : (device as DeviceServiceTypes.ConcreteDevice).services!
        }))
    ))

    const serviceConfigurations: ExperimentServiceTypes.ServiceConfiguration[] = []
    const serviceTypes = new Set<string>()
    roleServices.flatMap(({services})=>services.map(({serviceType})=>serviceType!)).forEach((t)=>serviceTypes.add(t))
    for (const serviceType of serviceTypes) {
        let participants: (ExperimentServiceTypes.Participant &{description: any})[] = []
        for (const {role, services} of roleServices) {
            for (const service of services.filter((s)=>s.serviceType===serviceType)){
                participants.push({role, serviceId: service.serviceId, description: service})
            }
        }
        if (participants.length >=1) {
            if (serviceType === 'http://api.goldi-labs.de/serviceTypes/electrical') {
                const interfaces = participants.flatMap((p)=>{
                    if (p.description.interfaces)
                        return p.description.interfaces.map((i: any)=>({role: p.role, interface: i}))
                    else
                        return []
                    })
                const gpioInterfaces = interfaces.filter((i)=>i.interface.interfaceType==='gpio')
                const buses = gpioInterfaces.flatMap(i=>{
                    if (i.role==='ecp') return []
                    return i.interface.availableSignals.gpio.filter((s: string)=>s.length>4).map((s: string)=>[s])
                })
                for (const i of gpioInterfaces) {
                    if (i.role==='ecp') continue
                    const freeSignals = i.interface.availableSignals.gpio.filter((s: string)=>s.length<=4)
                    for (const bus of buses) {
                        const signal = freeSignals.shift()
                        if (signal) {
                            bus.push(signal)
                        }
                    }
                }
                let id=0
                for (const participant of participants) {
                    if (participant.role==='ecp'){
                        participant.config={
                            interfaces: buses.map((bus)=>({
                                interfaceId: (++id).toString(),
                                interfaceType: 'gpio',
                                signals: {gpio: bus.join(' / ')},
                                busId: bus[0],
                                direction: 'inout',
                                driver: participant.role
                            })),
                        }
                    }else{
                        const interfaces = [participant].flatMap((p)=>{
                            if (p.description.interfaces)
                                return p.description.interfaces.map((i: any)=>({role: p.role, interface: i}))
                            else
                                return []
                            })
                        const gpioInterfaces = interfaces.filter((i)=>i.interface.interfaceType==='gpio')
                        const signals = gpioInterfaces.flatMap((i)=>i.interface.availableSignals.gpio)
                        const mappedSignals = signals.filter((s)=>buses.find((b)=>b.includes(s)))
                        participant.config={
                            interfaces: mappedSignals.map((signal)=>({
                                interfaceId: (++id).toString(),
                                interfaceType: 'gpio',
                                signals: {gpio: signal},
                                busId: buses.find((b)=>b.includes(signal))![0],
                                direction: 'inout',
                                driver: participant.role
                            })),
                        }
                    }
                }
            }else{
                participants=participants.map((p)=>({...p, config: {}}))
            }
            participants=participants.map((p)=>({...p, description: undefined}))
            serviceConfigurations.push({serviceType, configuration: {}, participants})
        }
    }

    return { devices, roles, serviceConfigurations }

}