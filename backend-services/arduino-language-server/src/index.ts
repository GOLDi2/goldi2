import { configuration } from "./configuration.js";
import { ArduinoCliLanguageServer } from "./server.js";

const arduinoCliCompilationServer = new ArduinoCliLanguageServer();
arduinoCliCompilationServer.start(configuration);
