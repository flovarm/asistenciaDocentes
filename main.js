const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

app.whenReady().then(() => {
  // Comprobar actualizaciones al iniciar
  autoUpdater.checkForUpdatesAndNotify();
});


let configWindow;
let appWin;

const configPath = path.join(app.getPath("userData"), "config.json");

function getConfig() {
  if (!fs.existsSync(configPath)) {
    return { aula: '' };
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config));
}

function createConfigWindow() {
  configWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Configurar Aula",
    resizable: false,
    modal: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  configWindow.loadFile(path.join(__dirname, 'config.html'));
  configWindow.setMenu(null);
}

function createMainWindow() {
  appWin = new BrowserWindow({
    width: 800,
    height: 800,
    title: "Modulo de Docentes",
    resizable: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  appWin.maximize(); // Maximiza al iniciar

  appWin.loadFile(path.join(__dirname, 'dist', 'browser', 'index.html'));
  appWin.setMenu(null);

  if (!app.isPackaged) {
    appWin.webContents.openDevTools();
  }

  appWin.on("closed", () => {
    appWin = null;
  });
}

ipcMain.on("save-aula", (event, aula) => {
  saveConfig({ aula });
  configWindow.close();
  createMainWindow();
});

ipcMain.handle("get-aula", () => {
  return getConfig().aula;
});

app.whenReady().then(() => {
  const config = getConfig();
  if (!config.aula) {
    createConfigWindow();
  } else {
    createMainWindow();
  }
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización disponible",
    message: "Hay una nueva versión disponible. Se descargará en segundo plano.",
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización lista",
    message: "La nueva versión ha sido descargada. ¿Deseas reiniciar ahora?",
    buttons: ["Sí", "Después"]
  }).then(result => {
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});