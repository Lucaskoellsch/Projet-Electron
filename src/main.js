const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  nativeTheme,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("node:child_process");
const pngquant = require("pngquant-bin");

const targetFolder = path.normalize(`${app.getPath("temp")}/compressed-files`);

function accessOrCreateFolder(folderPath, mode = fs.constants.W_OK) {
  return new Promise((resolve, reject) => {
    const normalizePath = path.normalize(folderPath);
    fs.access(normalizePath, mode, (err) => {
      if (err) {
        fs.mkdir(normalizePath, (err) => {
          if (err) {
            reject();
            return;
          }
          resolve();
        });
        return;
      }
      resolve();
    });
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("ping", (event) => {
    console.log("ping\n\n");
    event.reply("pong");
  });

  ipcMain.on("openFile", () => {
    let progress = 0;
    mainWindow.setProgressBar(progress);
    dialog
      .showOpenDialog(mainWindow, {
        filters: [{ name: "Images", extensions: ["png"] }],
        properties: ["openFile", "multiSelections"],
      })
      .then((result) => {
        accessOrCreateFolder(targetFolder).then(() => {
          Promise.all(
            result.filePaths.map(
              (filePath, i) =>
                new Promise((resolve) => {
                  const fileName = path.basename(filePath);
                  execFile(
                    pngquant,
                    [
                      "--quality=90-100",
                      "-o",
                      `${targetFolder}/${fileName}`,
                      filePath,
                    ],
                    () => {
                      setTimeout(() => {
                        progress += 100 / result.filePaths.length / 100;
                        mainWindow.setProgressBar(progress);
                        resolve();
                      }, i * 1000);
                    },
                    () => {
                      resolve();
                    }
                  );
                })
            )
          ).then(() => {
            new Notification({
              title: "Compresseur PNG",
              body: "Compression finit",
            }).show();
            shell.openPath(targetFolder);
            mainWindow.setProgressBar(-1);
          });
        });
      });
  });

  mainWindow.loadFile("./src/index.html");
  // active maximize size window
  mainWindow.maximize();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});