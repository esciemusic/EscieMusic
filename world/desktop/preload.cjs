const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("ESCIE_DESKTOP", Object.freeze({
  app: true,
  version: "0.1.0",
  platform: process.platform
}));
