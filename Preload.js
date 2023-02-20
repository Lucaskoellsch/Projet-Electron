// https://www.electronjs.org/docs/latest/tutorial/ipc
// this file creates the relationship between front and back
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // send "ping"
  ping: () => {
    ipcRenderer.send("ping");
  },
  // listen "pong" and execute function callback
  onPong: (callback) => {
    ipcRenderer.on("pong", callback);
  },
  // send "openFile"
  openFile: () => {
    ipcRenderer.send("openFile");
  },
});