import { APIClient } from "@cross-lab-project/api-client";
import { logger } from "@crosslab/service-common/logging";
import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { config } from "./config";

export async function handle_login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let loggedIn = false;
  for (const method of ["tui", "local"] as const) {
    try {
      await req.apiClient.login(req.body.username, req.body.password, {
        method,
      });
      res.cookie("token", req.apiClient.accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      loggedIn = true;
      break;
    } catch (error) {
      logger.log("info", `Could not login with method '${method}`);
    }
  }
  if (loggedIn) {
    try {
      req.user = await req.apiClient.getIdentity();
      if (req.query.redirect) {
        res.redirect(303, req.query.redirect as string);
      } else {
        res.redirect(303, "index.html" as string);
      }
    } catch (e) {
      logger.warn(e);
      res.clearCookie("token");
      next();
    }
  } else {
    res.clearCookie("token");
    logger.warn("user could not be logged in!");
    next();
  }
}

export async function handle_logout(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.clearCookie("token");
  if (req.query.redirect) {
    res.redirect(303, req.query.redirect as string);
  } else {
    res.redirect(303, "/index.html" as string);
  }
}

export function auth_router() {
  const router = Router();

  router.use(
    "/",
    asyncHandler(async (req: Request, res, next) => {
      req.apiClient = new APIClient(config.API_URL);
      req.user = undefined;

      req.initApiClient = async (token?: string) => {
        if (!token) {
          res.clearCookie("token");
        } else {
          req.apiClient.accessToken = token;
          try {
            req.user = {
              ...(await req.apiClient.getIdentity()),
              token: req.cookies.token,
            };
            //res.cookie("token", token, {
            //  sameSite: "strict",
            //  secure: true,
            //  httpOnly: true,
            //});
          } catch (e) {
            logger.info("Could not get identity, token seems invalid.");
            //res.clearCookie("token");
          }
        }
      };

      // handle token query parameter
      if (req.query.token && typeof req.query.token === "string") {
        await req.initApiClient(req.query.token);
      } else if (req.cookies.token) {
        await req.initApiClient(req.cookies.token);
      }
      next();
    })
  );

  return router;
}
