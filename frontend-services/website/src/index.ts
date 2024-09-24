#!/usr/bin/env node

import { error, logging } from "@crosslab/service-common";
import { logger } from "@crosslab/service-common/logging";
import cookieParser from "cookie-parser";
import express from "express";
import asyncHandler from "express-async-handler";
import { AddressInfo } from "net";
import nunjucks from "nunjucks";
import path from "path";
import { admin_router } from "./admin";
import { auth_router, handle_login, handle_logout } from "./auth";
import { config } from "./config";
import { experiment_router } from "./experiment";
import { lti_router } from "./lti";
import { thk_router } from "./thk";
import { renderPageInit } from "./utils";


logging.init();

const content_path =
  config.NODE_ENV === "development"
    ? "src/content"
    : path.dirname(__filename) + "/content";
const nunjucks_configuration = {
  autoescape: true,
  noCache: config.NODE_ENV === "development",
};
const languages = ["en", "de"];

const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

const app = express();

app.set("etag", config.NODE_ENV !== "development");
app.use((_req, res, next) => {
  res.removeHeader("X-Powered-By");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

nunjucks.configure(content_path + "/templates", {
  ...nunjucks_configuration,
  express: app,
});

app.use("/img", express.static(path.join(content_path, "img")));
app.use("/js", express.static(path.join(content_path, "js")));
if (config.NODE_ENV === "development") {
  // When developing, we dynamically transform the css files with postcss
  const { postcss_transform } = require("./debug_utils");
  app.use("/css", postcss_transform(path.join(content_path, "css")));
} else {
  // For production, we use precompiled css files
  app.use("/css", express.static(path.join(content_path, "css")));
}

app.use(auth_router())

for (const language of languages) {
  app.post("/" + language + "/login.html", asyncHandler(handle_login));
  app.get("/" + language + "/logout.html", asyncHandler(handle_logout));
  app.use(
    "/" + language + "/admin/",
    admin_router(language, renderPage, logger)
  );
  app.use(
    "/" + language + "/",
    experiment_router(language, renderPage, logger)
  );
  app.use("/" + language + "/", thk_router(language, renderPage, logger));
  app.use("/" + language + "/", lti_router(language, renderPage));
  app.get(
    "/" + language + "/",
    asyncHandler(async (req, res) => {
      await renderPage("index", language, res, req.user);
    })
  );
  app.use(
    "/" + language + "/",
    asyncHandler(async (req, res) => {
      await renderPage(req.path, language, res, req.user);
    })
  );
}

app.use("/", function (req, res) {
  const selected_language =
    req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
  res.redirect(307, "/" + selected_language + req.originalUrl);
});

app.use(error.middleware);

if (config.NODE_ENV === "development") {
  // When developing, we start a browserSync server after listen
  const { start_browserSync } = require("./debug_utils");
  const server = app.listen(() =>
    start_browserSync((server.address() as AddressInfo).port)
  );
} else {
  // Just listen on the configured port
  app.listen(config.PORT);
}
