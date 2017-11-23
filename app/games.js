var emulatorProc;

const {ipcRenderer} = require('electron');
const child = require('child_process');
const processWindows = require('node-process-windows');


//Starts emulator for given game
function openGame(gameConsole, game) {
	if(emulatorProc != null) {
		return;
	}

	//Get paths
	var emulatorPath = getEmulatorPath(gameConsole);
	var gamePath = getRomPath(gameConsole, game);
	if(gamePath == null || emulatorPath == null) {
		return;
	}

	//Read in emu config to be used in childProc
	var config = getConfig(gameConsole, game);
	console.log(config);

	emulatorProc = child.execFile(emulatorPath, [gamePath].concat(config.cliArgs), (error, stdout, stderr) => {
	  if (error) {
		throw error;
	  }
	});

	//Wait configured time
	window.setTimeout(function() {
		app.remote.getCurrentWindow().setAlwaysOnTop(false);
	},config.waitTime);
}

//Listener for the press of the kill button which will kill the proc in its tracks
ipcRenderer.on('childProc', (event, arg) => {
	console.log(arg);
	if(emulatorProc != null) {
		emulatorProc.kill();
	}
	//Refocus on close
	emulatorProc = null;
	processWindows.focusWindow('Annode');
	app.remote.getCurrentWindow().setAlwaysOnTop(true);
});
