const electron = require('electron')
// Module to control application life.
const app = electron.app
const {globalShortcut} = require('electron')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var currentWindow = 'main';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window. - not fullscreen currently for testing purposes
  mainWindow = new BrowserWindow({width: 1024, height: 768})

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
  }))

  mainWindow.webContents.toggleDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
	globalShortcut.unregisterAll()
	app.quit()
	mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
	createWindow()
  }
})

//Global shotcut registration
app.on('ready', () => {
  globalShortcut.register('F2', () => {
	  mainWindow.webContents.send('childProc', 'KILL')
  })

  globalShortcut.register('F5', () => {
	  mainWindow.webContents.reload();
  })

  globalShortcut.register('F3', () => {
	  if(currentWindow == 'main') {
		  currentWindow = 'scraper';
		  mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'scraper.html'),
			protocol: 'file:',
			slashes: true
		  }))
	  } else {
		  currentWindow = 'main';
		  mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true
		  }))
	  }
  })
})
