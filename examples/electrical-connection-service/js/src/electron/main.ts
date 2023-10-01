import { app, BrowserWindow, desktopCapturer } from "electron";
import path from "path";

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  await win.loadFile(path.join(__dirname, "index.html"));

  const sources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  for (const source of sources) {
    if (source.name === "CrossLab Test Device") {
      win.webContents.send("SET_SOURCE", source.id);
      return;
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
