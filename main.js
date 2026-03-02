const { app, BrowserWindow, screen, dialog, shell, ipcMain, safeStorage, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const ptp = require('pdf-to-printer');
Object.assign(console, log.functions);
const userDataPath = app.getPath('userData');
const credentialsPath = path.join(userDataPath, 'user_credentials.enc');
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function createMenu(win) {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        { label: 'Salir', role: 'quit' }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Vista de Desarrollador',
          accelerator: 'F12',
          click: () => { win.webContents.toggleDevTools(); }
        },
        { type: 'separator' },
        { label: 'Recargar', role: 'reload' }
      ]
    },
    {
      label: 'Actualizaciones',
      submenu: [
        {
          label: 'Buscar actualizaciones...',
          click: () => { 
            autoUpdater.checkForUpdates();
            // Opcional: Avisar que empezó la búsqueda
            log.info('Busqueda manual iniciada');
          }
        },
        { type: 'separator' },
        { label: `Versión actual: ${app.getVersion()}`, enabled: false }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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
  createMenu(win);
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

ipcMain.handle('print-pdf', async (event, pdfBase64) => {
  try {
    console.log('Iniciando proceso de impresion nativa...');

    // 1. Crear un buffer desde el string Base64
    const buffer = Buffer.from(pdfBase64, 'base64');

    // 2. Definir una ruta temporal para el archivo
    // Usamos app.getPath('temp') para que funcione en cualquier PC
    const filePath = path.join(app.getPath('temp'), `ticket_${Date.now()}.pdf`);

    // 3. Escribir el archivo físicamente
    fs.writeFileSync(filePath, buffer);

    // 4. Mandar a imprimir a la impresora PREDETERMINADA
    // Si quisieras una específica, podrías pasar { printer: "Nombre" }
    await ptp.print(filePath);

    console.log('Documento enviado a la cola de impresion.');

    // 5. Limpieza: Borrar el archivo temporal después de 5 segundos
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 5000);

    return { success: true };

  } catch (error) {
    console.error('Error en el sistema de impresion:', error);
    return { success: false, error: error.message };
  }
});

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'question',
    title: 'Actualización encontrada',
    message: `Hay una versión nueva (${info.version}).`,
    detail: '¿Quieres descargarla ahora? La descarga se realizará en segundo plano.',
    buttons: ['Descargar e instalar', 'Cancelar'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate(); // Inicia la descarga manual
      
      // Opcional: Avisar que empezó
      dialog.showMessageBox({ message: 'La descarga ha comenzado. Te avisaremos al terminar.' });
    }
  });
});

// 2. SEGUIMIENTO DEL PROGRESO
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidad: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Descargado ' + progressObj.percent + '%';
  
  // Mostramos el progreso en la barra de tareas de Windows (el icono verde que se llena)
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    mainWindow.setProgressBar(progressObj.percent / 100);
  }
  
  console.log(log_message);
});

// 3. CUANDO TERMINA
autoUpdater.on('update-downloaded', () => {
  // Quitamos la barra de progreso del icono
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) mainWindow.setProgressBar(-1);

  dialog.showMessageBox({
    type: 'info',
    title: '¡Listo!',
    message: 'Actualización descargada.',
    detail: 'La aplicación debe reiniciarse para aplicar los cambios.',
    buttons: ['Reiniciar ahora', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// 4. SI NO HAY NADA (Para el botón manual)
autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'Sin actualizaciones',
    message: 'Ya tienes la última versión instalada.'
  });
});

app.whenReady().then(() => {
createWindow();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});