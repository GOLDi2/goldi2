import { logger } from "@crosslab/service-common";
import { Handler, Router } from "express";
import asyncHandler from "express-async-handler";
import { config } from "./config";
import { renderPageType } from "./utils";

export function post_form_message(url: string, message: object): string {
  return `<html><body><form id="form" action="${url}" method="post">${Object.entries(
    message
  )
    .map(
      ([key, value]) => `<input type="hidden" name="${key}" value="${value}">`
    )
    .join(
      ""
    )}</form><script>document.getElementById("form").submit()</script></body></html>`;
}

export function lti_router(language: string, renderPage: renderPageType) {
  const router = Router();
  router.get(
    "/lti/platforms",
    asyncHandler(async (req, res) => {
      const platforms = await req.apiClient.listPlatform();
      renderPage(req.path, language, res, req.user, { platforms });
    })
  );

  router.post(
    "/lti/registration",
    asyncHandler(async (req, res) => {
      const platform = await req.apiClient.registerPlatform();
      const tool = {
        icon_url: config.BASE_URL + "/img/icon/android-chrome-512x512.png",
        base_url: config.BASE_URL + "/lti/launch?api=" + platform.launch_uri,
        jwks_url: config.BASE_URL + "/lti/jwks?api=" + platform.jwks_uri,
        login_url: config.BASE_URL + "/lti/login?api=" + platform.login_uri,
        redirect_urls: [
          config.BASE_URL + "/lti/launch?api=" + platform.launch_uri,
        ],
        parameters: [`registration_token=${platform.registration.token}`],
      };
      renderPage(req.path, language, res, req.user, { platform, tool });
    })
  );

  router.get(
    "/lti/registration/status",
    asyncHandler(async (req, res) => {
      const platform = await req.apiClient.getPlatform(
        req.query.platform as string
      );
      res.send(platform.registration.state);
    })
  );

  router.get(
    "/lti/jwks",
    asyncHandler(async (req, res) => {
      res.send(await req.apiClient.ltiJwks(req.query.api as string));
    })
  );

  router.post(
    "/lti/login",
    asyncHandler(async (req, res) => {
      const login = await req.apiClient.ltiLogin(
        req.query.api as string,
        req.body
      );
      res.status(302);
      res.header("Location", login.authentication_request_url);
      res.send();
    })
  );

  router.post(
    "/lti/launch",
    asyncHandler(async (req, res) => {
      logger.info(req.query);
      const message = await req.apiClient.ltiLaunch(
        req.query.api as string,
        req.body
      );
      logger.info(message);
      req.lti = {
        isInstructor: (message.session.roles as any).includes("instructor"),
        isStudent: message.session.roles.includes("student"),
        session: message.session!,
        token: message.access_token!,
      };
      renderPage("/lti/launch", language, res, req.user, { req });
    })
  );

  router.use(
    "/lti",
    asyncHandler(async (req, _res, next) => {
      if (req.body.lti_session) {
        const session = JSON.parse(req.body.lti_session);
        req.lti = {
          session: session,
          isInstructor: session.roles.includes("instructor"),
          isStudent: session.roles.includes("student"),
          token: req.body.token,
        };
        req.initApiClient(req.lti.token);
      }

      next();
    })
  );

  const handle_experiment: Handler = async (req, res) => {
    if (!req.lti) {
      throw new Error("No LTI session found");
    }
    if (req.lti.session.experiment_uri) {
      const exp = await req.apiClient.updateExperiment(
        req.lti.session.experiment_uri,
        { status: "running" }
      );
      const instances: {
        codeUrl: string;
        instanceUrl: string;
        deviceToken: string;
      }[] = [];
      for (const device of exp.instantiatedDevices ?? []) {
        if (device.url && device.token && device.codeUrl) {
          instances.push({
            codeUrl: device.codeUrl,
            instanceUrl: device.url,
            deviceToken: device.token,
          });
        }
      }
      renderPage("/lti/experiment-show", language, res, req.user, {
        req,
        instances,
      });
    } else {
      renderPage("/lti/experiment-no-experiment", language, res, req.user, {
        req,
      });
    }
  };

  router.post(
    "/lti/experiment_select",
    asyncHandler(async (req, res, next) => {
      if (!req.lti) {
        throw new Error("No LTI session found");
      }
      if (!req.lti.session.experiment_change_uri) {
        throw new Error("Experiment Change URI was not given - is the user an instructor?");
      }
      const resource = await req.apiClient.getResource(
        req.lti.session.resource_uri
      );

      if(req.body['action'] === 'start'){
        const _roles = Object.keys(req.body)
        .filter((k) => k.startsWith(`role_`))
        .map((k) => k.split("_")[1]);
        const _devices = _roles.map((r) => req.body[`role_${r}`]);
        const mapping: { role: string; device: string }[] = _devices.map(
          (d, i) => ({ role: _roles[i], device: d })
        );
        const impersonate = req.body['impersonate'];
        if (impersonate) {
          await req.apiClient.updateLtiExperiment(req.lti.session.experiment_change_uri, {impersonate})
        }else if(mapping.length > 0){
          await req.apiClient.updateLtiExperiment(req.lti.session.experiment_change_uri, {mapping})
        }

        return handle_experiment(req, res, next);
      }

      const template = await req.apiClient.getTemplate(
        resource.experiment_template_uri!
      );
      const groupDevices = await Promise.all(
        template.configuration.devices.map((d) =>
          req.apiClient.getDevice(d.device)
        )
      );
      const students = resource.students_uri?await req.apiClient.listResourceStudents(resource.students_uri): [];
      const roles: { role: string; devices: string[] }[] = [];
      const selectable_devices = new Set<string>();
      for (let i = 0; i < groupDevices.length; i++) {
        const device = groupDevices[i];
        if (device.type === "group") {
          roles.push({
            role: template.configuration.devices[i].role,
            devices: device.devices.map((d) => d.url),
          });
          device.devices.forEach((d) => selectable_devices.add(d.url));
        }
      }
      const devices = Object.fromEntries(
        await Promise.all(
          Array.from(selectable_devices).map(async (d) => [
            d,
            await req.apiClient.getDevice(d),
          ])
        )
      );
      renderPage(req.path, language, res, req.user, {
        req,
        resource,
        students: students.map((s) => ({...s, role_mapping: Object.fromEntries(s.role_mapping.map((r) => [r.role, r.device]))})),
        role_mapping: Object.fromEntries((req.lti.session.role_mapping ?? []).map((r) => [r.role, r.device])),
        roles,
        devices,
      });
    })
  );

  router.post(
    "/lti/experiment",
    asyncHandler(handle_experiment)
  );

  router.post(
    "/lti/settings",
    asyncHandler(async (req, res) => {
      if (!req.lti) {
        throw new Error("No LTI session found");
      }
      const resource = await req.apiClient.getResource(
        req.lti.session.resource_uri
      );
      let experiment_template:
        | Awaited<ReturnType<typeof req.apiClient.getTemplate>>
        | undefined = undefined;
      try {
        experiment_template = await req.apiClient.getTemplate(
          resource.experiment_template_uri!
        );
      } catch {
        // do nothing
      }
      renderPage(req.path, language, res, req.user, {
        req,
        resource,
        experiment_template,
      });
    })
  );

  router.post(
    "/lti/settings_experiment",
    asyncHandler(async (req, res) => {
      if (!req.lti) {
        throw new Error("No LTI session found");
      }
      if (req.body.experiment_template_uri) {
        await req.apiClient.updateResource(req.lti.session.resource_uri, {
          experiment_template_uri: req.body.experiment_template_uri,
        });
      }

      const resource = await req.apiClient.getResource(
        req.lti.session.resource_uri
      );
      let experiment_template:
        | Awaited<ReturnType<typeof req.apiClient.getTemplate>>
        | undefined = undefined;
      try {
        experiment_template = await req.apiClient.getTemplate(
          resource.experiment_template_uri!
        );
      } catch {
        // do nothing
      }
      const experiment_templates = await req.apiClient.listTemplate();
      renderPage(req.path, language, res, req.user, {
        req,
        resource,
        experiment_template,
        experiment_templates,
      });
    })
  );

  router.post(
    "/lti/settings_device_map",
    asyncHandler(async (req, res) => {
      if (!req.lti) {
        throw new Error("No LTI session found");
      }
      const resource = await req.apiClient.getResource(
        req.lti.session.resource_uri
      );

      const studentUpdates = [];
      for (const key in req.body) {
        const match = key.match(/^student_uri_(.*)$/);
        if (match) {
          const student = match[1];
          const uri = req.body[key];
          const roles = Object.keys(req.body)
            .filter((k) => k.startsWith(`student_${student}_`))
            .map((k) => k.split("_")[2]);
          const devices = roles.map((r) => req.body[`student_${student}_${r}`]);
          const mapping: { role: string; device: string }[] = devices.map(
            (d, i) => ({ role: roles[i], device: d })
          );
          console.log(uri, mapping);
          studentUpdates.push({ uri, data: { role_mapping: mapping } });
          //promises.push(req.apiClient.updateResourceStudent(uri, {role_mapping: mapping}))
        }
      }
      let students: Awaited<
        ReturnType<typeof req.apiClient.listResourceStudents>
      >;
      if (studentUpdates.length > 0) {
        students = await req.apiClient.updateResourceStudents(
          resource.students_uri!,
          studentUpdates
        );
      } else {
        students = await req.apiClient.listResourceStudents(
          resource.students_uri!
        );
      }
      console.log(students);

      const template = await req.apiClient.getTemplate(
        resource.experiment_template_uri!
      );
      const groupDevices = await Promise.all(
        template.configuration.devices.map((d) =>
          req.apiClient.getDevice(d.device)
        )
      );
      const roles: { role: string; devices: string[] }[] = [];
      const selectable_devices = new Set<string>();
      for (let i = 0; i < groupDevices.length; i++) {
        const device = groupDevices[i];
        if (device.type === "group") {
          roles.push({
            role: template.configuration.devices[i].role,
            devices: device.devices.map((d) => d.url),
          });
          device.devices.forEach((d) => selectable_devices.add(d.url));
        }
      }
      const devices = Object.fromEntries(
        await Promise.all(
          Array.from(selectable_devices).map(async (d) => [
            d,
            await req.apiClient.getDevice(d),
          ])
        )
      );
      renderPage(req.path, language, res, req.user, {
        req,
        resource,
        students: students.map((s) => ({...s, role_mapping: Object.fromEntries(s.role_mapping.map((r) => [r.role, r.device]))})),
        roles,
        devices,
      });
    })
  );

  return router;
}
