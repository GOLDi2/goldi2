import { NextFunction, Request, Response, Router } from "express";

import asyncHandler from "express-async-handler";
import winston from "winston";
import { renderPageType } from "./utils";

export function thk_router(
  language: string,
  renderPage: renderPageType,
  _logger: winston.Logger
) {
  async function thk(req: Request, res: Response, _next: NextFunction) {
    req.apiClient.accessToken = req.query.t as string;
    console.log(req.apiClient.accessToken);
    try {
      const { thkGroup } = await getThkGroup();
      const thks = await Promise.all(
        thkGroup.devices.map((d) => req.apiClient.getDevice(d.url))
      );
      return renderPage("thk", language, res, req.user, {
        thks,
      });
    } catch {
      return renderPage("thk", language, res, req.user, {
        thks: [],
      });
    }

    async function getThkGroup() {
      const devices = await req.apiClient.listDevices();
      const deviceGroups = devices.filter((d) => d.type === "group");
      console.log(deviceGroups);
      const thkGroupUrl = deviceGroups.find(
        (d) => d.name.toLowerCase() === "thk"
      )?.url;
      if (!thkGroupUrl) {
        throw new Error("Could not find thk group");
      }
      const thkGroup = await req.apiClient.getDevice(thkGroupUrl);
      if (thkGroup.type !== "group") {
        throw new Error("Device is not a group");
      }
      return { thkGroup };
    }
  }

  const router = Router();
  router.get("/thk", asyncHandler(thk));
  return router;
}
