import { NextFunction, Request, Response, Router } from "express";

import {
  APIClient,
  DeviceServiceTypes,
  ExperimentServiceTypes,
} from "@cross-lab-project/api-client";
import asyncHandler from "express-async-handler";
import winston from "winston";
import { renderPageType } from "./utils";

export function experiment_router(
  language: string,
  renderPage: renderPageType,
  _logger: winston.Logger
) {

  async function getPspuBpuGroup(req: Request) {
    const devices = await req.apiClient.listDevices();
    const deviceGroups = devices.filter((d) => d.type === "group");
    const pspuGroupUrl = deviceGroups.find(
      (d) => d.name.toLowerCase() === "pspu"
    )?.url;
    const bpuGroupUrl = deviceGroups.find(
      (d) => d.name.toLowerCase() === "bpu"
    )?.url;
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

  async function experimentSelection(req: Request, res: Response, _next: NextFunction) {
    if (!req.user) {
      return renderPage("experiment/selection", language, res, req.user);
    }

    if (req.method === "POST") {
      const experiment = await buildSimpleExperiment(req);
      console.log(experiment)
      experiment.status = "running";
      const response = await req.apiClient.createExperiment(
        experiment as ExperimentServiceTypes.Experiment<"request">
      );
      console.log(response)
      if (response.status === "setup" && response.url) {
        return experimentSetup(req, res, _next, response);
      }
    }

    try {
      const { pspuGroup, bpuGroup } = await getPspuBpuGroup(req);
      const pspus = await Promise.all(
        pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      const bpus = await Promise.all(
        bpuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      return renderPage("experiment/selection", language, res, req.user, {
        experiment,
        pspus,
        bpus,
      });
    } catch {
      return renderPage("experiment/selection", language, res, req.user, {
        experiment,
        pspus: [],
        bpus: [],
      });
    }
  }

  async function experiment(req: Request, res: Response, _next: NextFunction) {
    const templateUrl = req.query.template;

    // TODO: maybe check somewhere else and return a specific page experiment_401.html
    if (!req.user) {
      return renderPage("experiment/developer", language, res, req.user);
    }

    let experiment:
      | Partial<ExperimentServiceTypes.Experiment<"request">>
      | undefined;
    if (typeof templateUrl === "string") {
      experiment = {
        ...(await req.apiClient.getTemplate(templateUrl)).configuration,
        status: "running",
      };
    }

    if (req.method === "GET") {
      try {
        if (!experiment) experiment = await buildSimpleExperiment(req);
      } catch (e) {
        //ignore
      }
    }

    if (req.method === "POST") {
      if (req.body.experiment) experiment = JSON.parse(req.body.experiment);
      if (!experiment) throw new Error("No experiment provided");
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
      const { pspuGroup, bpuGroup } = await getPspuBpuGroup(req);
      const pspus = await Promise.all(
        pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      const bpus = await Promise.all(
        bpuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      return renderPage("experiment/developer", language, res, req.user, {
        experiment,
        pspus,
        bpus,
      });
    } catch {
      return renderPage("experiment/developer", language, res, req.user, {
        experiment,
        pspus: [],
        bpus: [],
      });
    }
  }

  async function experimentSetup(
    req: Request,
    res: Response,
    _next: NextFunction,
    experiment: ExperimentServiceTypes.Experiment<"response">
  ) {
    let display = req.query.display ?? "link";

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

    if (instances.length <= 1) {
      display = 'iframe';
    }

    //await req.apiClient.updateExperiment(experiment.url!, { devices: experiment.devices })
    return renderPage("experiment/show", language, res, req.user, {
      experiment,
      instances,
      display,
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

  async function bookExperiment(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    if (!req.user) {
      return renderPage("experiment-reservation", language, res, req.user);
    }

    let experiment:
      | Partial<ExperimentServiceTypes.Experiment<"request">>
      | undefined;
    if (req.method === "GET") {
      try {
        if (!experiment) experiment = await buildSimpleExperiment(req);
      } catch (e) {
        //ignore
      }
    }

    if (req.method === "POST") {
      if (req.body.experiment) experiment = JSON.parse(req.body.experiment);
      if (!experiment) throw new Error("No experiment provided");
      console.log(req.body);
      experiment.status = "booked";
      experiment.bookingTime = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      };
      const response = await req.apiClient.createExperiment(
        experiment as ExperimentServiceTypes.Experiment<"request">
      );
      if (response.status === "booked" && response.url) {
        return res.redirect(`/${language}/reservations`);
      }
    }

    try {
      const { pspuGroup, bpuGroup } = await getPspuBpuGroup(req.apiClient);
      const pspus = await Promise.all(
        pspuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      const bpus = await Promise.all(
        bpuGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      return renderPage("experiment-reservation", language, res, req.user, {
        experiment,
        pspus,
        bpus,
      });
    } catch {
      return renderPage("experiment-reservation", language, res, req.user, {
        experiment,
        pspus: [],
        bpus: [],
      });
    }
  }

  async function experimentReservations(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    if (!req.user) {
      return renderPage("reservations", language, res, req.user);
    }

    if (req.method === "POST") {
      if (!req.body.url) throw new Error("No experiment url provided!");
      const response = await req.apiClient.updateExperiment(req.body.url, {
        status: "running",
      });
      if (response.status === "setup" && response.url) {
        return experimentSetup(req, res, _next, response);
      }
    }

    const experiments = await Promise.all(
      (
        await req.apiClient.listExperiments({
          experimentStatus: "booked",
        })
      )
        .filter((experimentOverview) => experimentOverview.status === "booked")
        .map(async (experimentOverview) => {
          const experiment = await req.apiClient.getExperiment(
            experimentOverview.url
          );
          const devices = await Promise.all(
            experiment.devices.map(async (device) => {
              return {
                ...(await req.apiClient.getDevice(device.device)),
                role: device.role,
              };
            })
          );
          const experimentData = {
            ...experiment,
            bookingTime: {
              startTime: new Date(
                experiment.bookingTime?.startTime!
              ).toISOString(),
              endTime: new Date(experiment.bookingTime?.endTime!).toISOString(),
            },
            devices,
            isStartable:
              Date.now() > Date.parse(experiment.bookingTime?.startTime!) &&
              Date.now() < Date.parse(experiment.bookingTime?.endTime!),
          };
          return experimentData;
        })
    );
    return renderPage("reservations", language, res, req.user, { experiments });
  }

  async function deleteExperiment(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const experimentUrl = req.query["experimentUrl"]?.toString();
    if (!experimentUrl) return res.status(400).send();
    await req.apiClient.deleteExperiment(experimentUrl);
    return res.status(204).send();
  }

  async function configTool(req: Request, res: Response, _next: NextFunction) {
    const templateUrl = req.query.template;

    let experiment:
      | Partial<ExperimentServiceTypes.Experiment<"request">>
      | undefined;
    if (typeof templateUrl === "string") {
      experiment = {
        ...(await req.apiClient.getTemplate(templateUrl)).configuration,
      };
    }

    if (req.method === "POST") {
      if (req.body.experiment) experiment = JSON.parse(req.body.experiment);
      if (!experiment) throw new Error("No experiment provided");
      experiment.status = "running";
      experiment.devices = experiment.devices ?? experiment.roles?.map((r) => ({
        device: r.template_device as string,
        role: r.name,
      }));
      console.log(JSON.stringify(experiment, null, 2));
      const response = await req.apiClient.createExperiment(
        experiment as ExperimentServiceTypes.Experiment<"request">
      );
      if (response.status === "setup" && response.url) {
        return experimentSetup(req, res, _next, response);
      }
    }

    return renderPage("experiment/configtool", language, res, req.user, { token: req.apiClient.accessToken, api: req.apiClient.url, experiment });
  }

  async function configTool(req: Request, res: Response, _next: NextFunction) {
    const templateUrl = req.query.template;

    let experiment:
      | Partial<ExperimentServiceTypes.Experiment<"request">>
      | undefined;
    if (typeof templateUrl === "string") {
      experiment = {
        ...(await req.apiClient.getTemplate(templateUrl)).configuration,
      };
    }

    if (req.method === "POST") {
      if (req.body.experiment) experiment = JSON.parse(req.body.experiment);
      if (!experiment) throw new Error("No experiment provided");
      experiment.status = "running";
      experiment.devices = experiment.devices ?? experiment.roles?.map((r) => ({
        device: r.template_device as string,
        role: r.name,
      }));
      console.log(JSON.stringify(experiment, null, 2));
      const response = await req.apiClient.createExperiment(
        experiment as ExperimentServiceTypes.Experiment<"request">
      );
      if (response.status === "setup" && response.url) {
        return experimentSetup(req, res, _next, response);
      }
    }

    return renderPage("experiment/configtool", language, res, req.user, { token: req.apiClient.accessToken, api: req.apiClient.url, experiment });
  }

  const router = Router();
  router.get("/selection", asyncHandler(experimentSelection));
  router.post("/selection", asyncHandler(experimentSelection));
  router.get("/developer", asyncHandler(experiment));
  router.post("/developer", asyncHandler(experiment));
  router.get("/configtool", asyncHandler(configTool));
  router.post("/configtool", asyncHandler(configTool));
  router.delete("/experiment", deleteExperiment);
  router.get("/book-experiment", asyncHandler(bookExperiment));
  router.post("/book-experiment", asyncHandler(bookExperiment));
  router.get("/run-experiment", asyncHandler(runExperiment));
  router.get("/reservations", asyncHandler(experimentReservations));
  router.post("/reservations", asyncHandler(experimentReservations));
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
  const ecp = (await req.apiClient.listDevices()).find(
    (device) =>
      device.type === "edge instantiable" && device.name.toLowerCase() === "ecp"
  )?.url;

  if (!ecp) {
    throw new Error("Could not find ecp!");
  }

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

async function getPspuBpuGroup(apiClient: APIClient) {
  const devices = await apiClient.listDevices();
  const deviceGroups = devices.filter((d) => d.type === "group");
  const pspuGroupUrl = deviceGroups.find(
    (d) => d.name.toLowerCase() === "pspu"
  )?.url;
  const bpuGroupUrl = deviceGroups.find(
    (d) => d.name.toLowerCase() === "bpu"
  )?.url;
  if (!pspuGroupUrl) {
    throw new Error("Could not find pspu group");
  }
  if (!bpuGroupUrl) {
    throw new Error("Could not find bpu group");
  }
  const pspuGroup = await apiClient.getDevice(pspuGroupUrl);
  if (pspuGroup.type !== "group") {
    throw new Error("Device is not a group");
  }

  const bpuGroup = await apiClient.getDevice(bpuGroupUrl);
  if (bpuGroup.type !== "group") {
    throw new Error("Device is not a group");
  }
  return { pspuGroup, bpuGroup };
}
