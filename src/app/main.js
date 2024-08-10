const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('node:path');
const fs = require("fs");
const axios = require('axios');
const AdmZip = require('adm-zip');
const shortcuts = require('windows-shortcuts');
const os = require('os');
const { exec } = require('child_process');

// Declare `mainWindow` and `isMaximized` outside of the function
let mainWindow;
let isMaximized = false;

const gamesDirectory = path.join(__dirname, 'games');
const zipFileUrl = 'https://www.dropbox.com/scl/fo/93dppy0jdl402y8ln3p4p/AMcDatXZ_Erj0JdXNVjNDQc?rlkey=omhlrcmi5e9ov1nl36c9wlmsg&st=hv51m4k9&dl=1'; // Replace with your actual URL
const zipFilePath = path.join(gamesDirectory, 'game.zip');
const extractedFolderPath = path.join(gamesDirectory, 'extracted');
const exeFilePath = path.join(extractedFolderPath, 'A-Video-Game.exe');

function makePopup(file) {
  // Create the popup window
  let popupWindow = new BrowserWindow({
    width: 400,
    height: 300,
    maxWidth: 400,
    maxHeight: 300,
    minWidth: 400,
    minHeight: 300,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preloadDownload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    frame: false,
    icon: path.join(__dirname, '../img/logo.png')
  });

  popupWindow.loadFile(file);

  let isMaximized = false;

  // IPC Listeners
  const minimizeListener = () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.minimize();
    }
  };

  const toggleMaximizeListener = () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      if (isMaximized) {
        popupWindow.unmaximize();
      } else {
        popupWindow.maximize();
      }
      isMaximized = !isMaximized; // Toggle maximized state
    }
  };

  const closeListener = () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.close();
    }
  };

  ipcMain.on('minimize-windowD', minimizeListener);
  ipcMain.on('toggle-maximize-windowD', toggleMaximizeListener);
  ipcMain.on('close-windowD', closeListener);

  // Handle window close
  popupWindow.on('closed', () => {
    // Remove IPC listeners when the window is closed
    ipcMain.removeListener('minimize-windowD', minimizeListener);
    ipcMain.removeListener('toggle-maximize-windowD', toggleMaximizeListener);
    ipcMain.removeListener('close-windowD', closeListener);
    // Ensure we don't keep a reference to the destroyed window
    popupWindow = null;
  });
}

async function play() {
    try {
        if (!fs.existsSync(gamesDirectory)) {
            fs.mkdirSync(gamesDirectory);
            // Download the zip file
            const response = await axios({
                url: zipFileUrl,
                responseType: 'stream'
            });
            response.data.pipe(fs.createWriteStream(zipFilePath));
            console.log('Downloading the game...');

            makePopup("./src/app/web/popups/downloading.html")
            response.data.on('end', () => {
              console.log('t');
                console.log('Download complete.');
                // Unzip the file
                const zip = new AdmZip(zipFilePath);
                zip.extractAllTo(extractedFolderPath, true);
                console.log('Unzipping complete.');
        
                // Send message to renderer to update button text
                let mainWindow = BrowserWindow.getAllWindows()[0];
                mainWindow.webContents.send('update-button-text', 'Play');

                // Create a shortcut on the desktop
                const targetPath = path.join(__dirname, 'games', 'extracted', 'A-Video-Game.exe');
                const shortcutName = 'A Video Game.lnk';
                const desktopPath = path.join(os.homedir(), 'Desktop');
                const shortcutPath = path.join(desktopPath, shortcutName);

                shortcuts.create(shortcutPath, targetPath, (err) => {
                  if (err) {
                    console.error('Failed to create shortcut:', err);
                  } else {
                    console.log('Shortcut created successfully:', shortcutPath);
                    makePopup("./src/app/web/popups/downloaded.html");
                  }
                });
            });
        } else {
            exec(`"${exeFilePath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing file: ${error}`);
                    return;
                }
            });
        }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 1000,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Ensure this is set for security
      enableRemoteModule: false,
      nodeIntegration: false
    },
    frame: false,
    icon: path.join(__dirname, '../img/logo.png')
  });

  // Updating the website software
  const session = mainWindow.webContents.session;
  session.clearCache(() => {
    console.log('Cache cleared.');
    mainWindow.loadURL('https://smathycosoftware.github.io/');
  });
  session.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Cache-Control'] = 'no-cache';
    callback({ requestHeaders: details.requestHeaders });
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL('https://smathycosoftware.github.io/');
  if (fs.existsSync(gamesDirectory)) {
    mainWindow.webContents.send('uninstall', '<button>Uninstall</button>');
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('update-button-text', 'Play');
    });
  } else {
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('uninstallrm', 'data');
    });
  }

  mainWindow.on('maximize', () => {
    isMaximized = true;
  });

  mainWindow.on('unmaximize', () => {
    isMaximized = false;
  });
};

function relaunchApp() {
    // Construct the path to the Electron executable
    const parentDir = path.resolve(__dirname, '..', '..');
    const appPath = path.join(parentDir, 'src', 'app', 'main.js'); // Path to your main script

    const command = `npx electron .`;

    // Launch the app
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error launching the app: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
    });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('play-game', async () => {
    await play();
  });

  ipcMain.handle('uninstallClick', async () => {
    if (fs.existsSync(gamesDirectory)) {
        // For now it deletes all the games not only one specific.
        fs.rm(gamesDirectory, { recursive: true, force: true }, (err) => {
            if (err) throw err;
            console.log('Directory removed successfully.');
        });

        // Removing the game shortcut
        const shortcutName = 'A Video Game.lnk';
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const shortcutPath = path.join(desktopPath, shortcutName);
        fs.unlink(shortcutPath, (err) => {
          if (err) {
            console.error('Failed to remove shortcut:', err);
          } else {
            console.log('Shortcut removed successfully:', shortcutPath);
          }
        });

        mainWindow.webContents.send('uninstallrm', 'data');
        mainWindow.webContents.send('update-button-text', 'Download');
        console.log('Uninstalled successfully.');
        makePopup("./src/app/web/popups/uninstalled.html");
    }
  });

  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('toggle-maximize-window', () => {
    if (mainWindow) {
      if (isMaximized) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});