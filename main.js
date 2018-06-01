const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

var currentWindow = 'main';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 1024, height: 768});
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true);

    mainWindow.setMenu(null);

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
                pathname: path.join(__dirname, 'scraper.html'),
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
