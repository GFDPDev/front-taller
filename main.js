const { app, BrowserWindow, screen, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
Object.assign(console, log.functions);
function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    // Prod build
    const indexPath = path.join(__dirname, 'dist', 'taller_prod', 'browser', 'index.html');
    console.log('File loaded: ', indexPath);  // For debugging
    win.loadFile(indexPath);
    // If the download fails, try again or switch to a local file
    win.webContents.on('did-fail-load', () => {
      win.loadFile(indexPath);  // Try to load file again
    });
  }
}





app.whenReady().then(() => {
createWindow();
});

app.on('ready', function() {
  console.log('App is ready, checking for updates...');
  
  autoUpdater.checkForUpdates();
  
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización disponible',
      message: 'Nueva versión disponible',
      detail: `Versión ${info.version} está lista para descargar.`,
      buttons: ['Descargar ahora', 'Más tarde']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización lista',
      message: 'Se instalará al reiniciar la aplicación',
      buttons: ['Reiniciar ahora', 'Después']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});