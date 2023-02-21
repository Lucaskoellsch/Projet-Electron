window.addEventListener("DOMContentLoaded", () => {
    const { electronAPI } = window;
    electronAPI.ping();
    electronAPI.onPong(() => {
      console.log("pong");
    });
    document.getElementById("btn-open-image").addEventListener("click", () => {
      electronAPI.openFile();
    });
  });