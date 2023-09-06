import { Request, Response, NextFunction, Router } from "express";

import { renderPageType } from "./utils";
import winston from "winston";
import asyncHandler from "express-async-handler";
import {
  DeviceServiceTypes,
  ExperimentServiceTypes,
} from "@cross-lab-project/api-client";

export function experiment_router(
  language: string,
  renderPage: renderPageType,
  _logger: winston.Logger
) {
  async function experiment(req: Request, res: Response, _next: NextFunction) {
    // TODO: maybe check somewhere else and return a specific page experiment_401.html
    if (!req.user) {
      return renderPage("experiment", language, res, req.user);
    }

    let experiment: Partial<ExperimentServiceTypes.Experiment<"request">> = {};

    if (req.method === "GET") {
      try {
        experiment = await buildSimpleExperiment(req);
      } catch (e) {
        //ignore
      }
    }

    if (req.method === "POST") {
      experiment = JSON.parse(req.body.experiment);
      experiment.status = "running";
      console.log(JSON.stringify(experiment, null, 2));
      const response = await req.apiClient.createExperiment(
        experiment as ExperimentServiceTypes.Experiment<"request">
      );
      if (response.status === "setup" && response.url) {
        return experimentSetup(req, res, _next, response);
      }
    }

    try {
      const { pspuGroup, bpuGroup } = await getPspuBpuGroup();
      const pspus = await Promise.all(
        pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      const bpus = await Promise.all(
        bpuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      return renderPage("experiment", language, res, req.user, {
        experiment,
        pspus,
        bpus,
      });
    } catch {
      return renderPage("experiment", language, res, req.user, {
        experiment,
        pspus: [],
        bpus: [],
      });
    }

    async function getPspuBpuGroup() {
      const devices = await req.apiClient.listDevices();
      const deviceGroups = devices.filter((d) => d.type === "group");
      const pspuGroupUrl = deviceGroups.find((d) => d.name === "pspu")?.url;
      const bpuGroupUrl = deviceGroups.find((d) => d.name === "bpu")?.url;
      if (!pspuGroupUrl) {
        throw new Error("Could not find pspu group");
      }
      if (!bpuGroupUrl) {
        throw new Error("Could not find bpu group");
      }
      const pspuGroup = await req.apiClient.getDevice(pspuGroupUrl);
      if (pspuGroup.type !== "group") {
        throw new Error("Device is not a group");
      }

      const bpuGroup = await req.apiClient.getDevice(bpuGroupUrl);
      if (bpuGroup.type !== "group") {
        throw new Error("Device is not a group");
      }
      return { pspuGroup, bpuGroup };
    }
  }

  async function experimentSetup(
    req: Request,
    res: Response,
    _next: NextFunction,
    experiment: ExperimentServiceTypes.Experiment<"response">
  ) {
    if (experiment.status !== "setup") {
      throw new Error("Experiment is not in setup phase");
    }
    const instances: {
      codeUrl: string;
      instanceUrl: string;
      deviceToken: string;
    }[] = [];
    for (const device of experiment.instantiatedDevices ?? []) {
      const deviceDetails = await req.apiClient.getDevice(device.instanceOf);
      if (
        deviceDetails.type === "edge instantiable" &&
        device.url &&
        device.token &&
        deviceDetails.codeUrl
      ) {
        instances.push({
          codeUrl: deviceDetails.codeUrl,
          instanceUrl: device.url,
          deviceToken: device.token,
        });
      }
    }
    //await req.apiClient.updateExperiment(experiment.url!, { devices: experiment.devices })
    return renderPage("experiment-setup", language, res, req.user, {
      experiment,
      instances,
    });
  }

  async function runExperiment(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const resp = await req.apiClient.updateExperiment(req.query.url as string, {
      status: "running",
    });
    res.send(resp);
    //res.redirect(303, '/' + language + '/index.html');
  }

  const router = Router();
  router.get("/experiment", asyncHandler(experiment));
  router.post("/experiment", asyncHandler(experiment));
  router.get("/run-experiment", asyncHandler(runExperiment));
  return router;
}

const ecpServiceDescription: DeviceServiceTypes.ServiceDescription[] = [
  {
    serviceType: "http://api.goldi-labs.de/serviceTypes/electrical",
    serviceId: "electrical",
    serviceDirection: "prosumer",
    interfaces: [
      { interfaceType: "gpio", availableSignals: { gpio: ["_ANY_"] } },
    ],
  },
  {
    serviceId: "webcam",
    serviceType: "http://api.goldi-labs.de/serviceTypes/webcam",
    serviceDirection: "consumer",
  },
  {
    serviceId: "file",
    serviceType: "https://api.goldi-labs.de/serviceTypes/file",
    serviceDirection: "producer",
  },
];

async function buildSimpleExperiment(
  req: Request
): Promise<ExperimentServiceTypes.Experiment<"request">> {
  const pspu = req.query.pspu as string;
  const bpu = req.query.bpu as string;
  const ecp =
    "https://api.goldi-labs.de/devices/cc1de37e-1a6a-4470-affd-12eb41a3231e";

  const devices = [
    { device: pspu, role: "pspu" },
    { device: bpu, role: "bpu" },
    { device: ecp, role: "ecp" },
  ].filter(({ device: url }) => url !== undefined && url !== "");

  const roles: ExperimentServiceTypes.Role[] = devices.map((d) => ({
    name: d.role,
  }));

  const roleServices = await Promise.all(
    devices.map(({ device: url, role }) =>
      req.apiClient.getDevice(url).then((device) => ({
        role,
        services:
          role === "ecp"
            ? ecpServiceDescription
            : (device as DeviceServiceTypes.ConcreteDevice).services!,
      }))
    )
  );

  const serviceConfigurations: ExperimentServiceTypes.ServiceConfiguration[] =
    [];
  const serviceTypes = new Set<string>();
  roleServices
    .flatMap(({ services }) => services.map(({ serviceType }) => serviceType!))
    .forEach((t) => serviceTypes.add(t));
  console.log({ serviceTypes });
  for (const serviceType of serviceTypes) {
    let participants: (ExperimentServiceTypes.Participant & {
      description: any;
    })[] = [];
    for (const { role, services } of roleServices) {
      for (const service of services.filter(
        (s) => s.serviceType === serviceType
      )) {
        participants.push({
          role,
          serviceId: service.serviceId,
          description: service,
        });
      }
    }
    if (participants.length >= 2) {
      if (serviceType === "http://api.goldi-labs.de/serviceTypes/electrical") {
        const rDI = (s: string) => {
          try {
            return s.replace("#", "");
          } catch (e) {
            return s;
          }
        }; // remove _DRIVEN_ from signal name
        const interfaces = participants.flatMap((p) => {
          if (p.description.interfaces)
            return p.description.interfaces.map((i: any) => ({
              role: p.role,
              interface: i,
            }));
          else return [];
        });
        const gpioInterfaces = interfaces.filter(
          (i) => i.interface.interfaceType === "gpio"
        );
        const buses = gpioInterfaces.flatMap((i) => {
          const isDriven = ["inout", "out"].includes(i.interface.direction);
          if (i.role === "ecp") return [];
          if (isDriven) {
            return i.interface.availableSignals.gpio
              .filter((s: string) => s.length > 4)
              .map((s: string) => ["#" + s]);
          } else {
            return i.interface.availableSignals.gpio
              .filter((s: string) => s.length > 4)
              .map((s: string) => [s]);
          }
        });
        for (const i of gpioInterfaces) {
          if (i.role === "ecp") continue;
          const isDriven = ["inout", "out"].includes(i.interface.direction);
          const freeSignals = i.interface.availableSignals.gpio.filter(
            (s: string) => s.length <= 4
          );
          for (const bus of buses) {
            const signal = freeSignals.shift();
            const isBusDriven = bus.some((s: string) => s.startsWith("#"));
            if (signal) {
              if (isDriven && !isBusDriven) {
                bus.push("#" + signal);
              } else {
                bus.push(signal);
              }
            }
          }
        }
        let id = 0;
        for (const participant of participants) {
          if (participant.role === "ecp") {
            participant.config = {
              interfaces: buses.map((bus) => ({
                interfaceId: (++id).toString(),
                interfaceType: "gpio",
                signals: { gpio: bus.map(rDI).join(" / ") },
                busId: rDI(bus[0]),
                direction: bus.some((s: string) => s.startsWith("#"))
                  ? "in"
                  : "inout",
                driver: participant.role,
              })),
            };
          } else {
            const interfaces = [participant].flatMap((p) => {
              if (p.description.interfaces)
                return p.description.interfaces.map((i: any) => ({
                  role: p.role,
                  interface: i,
                }));
              else return [];
            });

            const gpioInterfaces = interfaces.filter(
              (i) => i.interface.interfaceType === "gpio"
            );
            const signals = gpioInterfaces.flatMap((i) =>
              i.interface.availableSignals.gpio.map((s: string) => {
                const isDriven = ["inout", "out"].includes(
                  i.interface.direction
                );
                if (isDriven) {
                  return "#" + s;
                } else {
                  return s;
                }
              })
            );
            const mappedSignals = signals.filter((s) =>
              buses.find((b) => b.map(rDI).includes(rDI(s)))
            );
            // check if signals are driven in bus:
            const mappedBusSignals = mappedSignals.map((s) =>
              buses
                .find((b) => b.map(rDI).includes(rDI(s)))
                .find((bs: string) => rDI(bs) === rDI(s))
            );
            console.log({ signals, mappedBusSignals, buses });
            participant.config = {
              interfaces: mappedBusSignals.map((signal) => ({
                interfaceId: (++id).toString(),
                interfaceType: "gpio",
                signals: { gpio: rDI(signal) },
                busId: rDI(
                  buses.find((b) => b.map(rDI).includes(rDI(signal)))![0]
                ),
                direction: signal.startsWith("#") ? "out" : "in",
                driver: participant.role,
              })),
            };
          }
        }
      } else {
        participants = participants.map((p) => ({ ...p, config: {} }));
      }
      participants = participants.map((p) => ({
        ...p,
        description: undefined,
      }));
      serviceConfigurations.push({
        serviceType,
        configuration: {},
        participants,
      });
    }
  }

  return { status: "created", devices, roles, serviceConfigurations };
}
