const { app, BrowserWindow, screen, dialog, shell, ipcMain, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
Object.assign(console, log.functions);
const userDataPath = app.getPath('userData');
const credentialsPath = path.join(userDataPath, 'user_credentials.enc');
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
      partition: 'persist:taller',
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    // Permitir blobs (PDFs, etc) para que se abran normalmente
    if (url.startsWith('blob:')) {
      return { action: 'allow' };
    }
    // Para URLs externas (como wa.me, http, https), abrir con navegador predeterminado
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wa.me')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    // Permitir otras acciones
    return { action: 'allow' };
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




ipcMain.handle('save-credentials', async (event, data) => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const buffer = safeStorage.encryptString(data.password);
      const json = JSON.stringify({
        username: data.username,
        password: buffer.toString('base64') // Guardamos el buffer como base64
      });
      fs.writeFileSync(credentialsPath, json);
      return { success: true };
    }
    return { success: false, error: 'Encryption not available' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-credentials', async () => {
  try {
    if (fs.existsSync(credentialsPath) && safeStorage.isEncryptionAvailable()) {
      const json = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      const buffer = Buffer.from(json.password, 'base64');
      const decryptedPassword = safeStorage.decryptString(buffer);
      return { 
        username: json.username, 
        password: decryptedPassword 
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
});

ipcMain.handle('delete-credentials', async () => {
  try {
    if (fs.existsSync(credentialsPath)) {
      fs.unlinkSync(credentialsPath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

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