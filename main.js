const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Config = require('electron-config');

const path = require('path');
const url = require('url');

var currentWindow = 'main';
const config = new Config();

let mainWindow;

function createWindow() {
    const isDev = (process.env.NODE_ENV == null ? false : process.env.NODE_ENV.trim() === "dev") || config.get('dev') == true;

    mainWindow = new BrowserWindow({width: 1024, height: 768});
    mainWindow.setFullScreen(!isDev);
    mainWindow.setAlwaysOnTop(true);

    mainWindow.setMenu(null);

    if(isDev) {
        mainWindow.toggleDevTools();
    }

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //mainWindow.webContents.toggleDevTools();

    mainWindow.on('closed', function () {
        electron.globalShortcut.unregisterAll()
        app.quit()
        mainWindow = null
    });
}

app.on('ready', createWindow);

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('ready', () => {
    electron.globalShortcut.register('F2', () => {
        mainWindow.webContents.send('childProc', 'KILL')
    });

    electron.globalShortcut.register('F5', () => {
        mainWindow.webContents.reload();
    });

    electron.globalShortcut.register('F3', () => {
        if(currentWindow == 'main') {
            currentWindow = 'scraper';
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'dev.html'),
                protocol: 'file:',
                slashes: true
            }));
        } else {
            currentWindow = 'main';
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    });
});
