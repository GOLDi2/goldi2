import { contextBridge, ipcRenderer } from "electron";

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  try {
    contextBridge.exposeInMainWorld("electron", {
      getSourceId: () => {
        return sourceId;
      },
    });
  } catch (error) {
    handleError(error);
  }
});

function handleError(error: unknown) {
  console.log(error);
}
