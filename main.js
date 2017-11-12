const electron = require('electron')
// Module to control application life.
const app = electron.app
const {globalShortcut} = require('electron')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const electronLocalShortcut = require('electron-localshortcut')

var currentWindow = 'main';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, fullscreen: true})

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
  }))

  mainWindow.webContents.toggleDevTools();

  //Can register global hotkeys here for the window
  electronLocalShortcut.register(mainWindow, 'F12', function(){
	  mainWindow.webContents.toggleDevTools();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
	// Dereference the window object, usually you would store windows
	// in an array if your app supports multi windows, this is the time
	// when you should delete the corresponding element.
	mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
	createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('ready', () => {
  globalShortcut.register('F2', () => {
	  mainWindow.webContents.send('childProc', 'KILL')
  })

  globalShortcut.register('F5', () => {
	  mainWindow.webContents.reload();
  })

  globalShortcut.register('F3', () => {
	  if(currentWindow == 'main') {
		  currentWindow='scraper';
		  mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'scraper.html'),
			protocol: 'file:',
			slashes: true
		  }))
	  } else {
		  mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true
		  }))
	  }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
