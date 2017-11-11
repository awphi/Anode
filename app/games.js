var emulatorProc;

const {ipcRenderer} = require('electron');
const child = require('child_process');
const processWindows = require('node-process-windows');


//Starts emulator for given game
function openGame(gameConsole, game) {
    if(emulatorProc != null) {
        return;
    }
    console.log(gameConsole + ' ' + game);
	var emulatorPath = getEmulatorPath(gameConsole);
	var gamePath = getRomPath(gameConsole, game);

    if(gamePath == null || emulatorPath == null) {
        return;
    }

    emulatorProc = child.execFile(emulatorPath, [gamePath, "-fullscreen"], (error, stdout, stderr) => {
	  if (error) {
		throw error;
	  }
    });

	//Give it half a second for the window to open
	window.setTimeout(function() {
		app.remote.getCurrentWindow().setAlwaysOnTop(false);
	},0);
}

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
