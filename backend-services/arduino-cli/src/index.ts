import { configuration } from "./configuration.js";
import { ArduinoCliCompilationServer } from "./server.js";

const arduinoCliCompilationServer = new ArduinoCliCompilationServer();
arduinoCliCompilationServer.start(configuration);
