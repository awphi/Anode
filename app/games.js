var emulatorProc;

const {ipcRenderer} = require("electron");
const child = require("child_process");
const processWindows = require("node-process-windows");


//Starts emulator for given game
function openGame(gameConsole, game) {
	if(emulatorProc != null) return;

	//Get paths
	var emulatorPath = Files.getEmulatorPath(gameConsole);
	var gamePath = Files.getRomPath(gameConsole, game);
	if(gamePath == null || emulatorPath == null) return;

	//Read in emu config to be used in childProc
	var config = Files.getConfig(gameConsole, game);
	console.log(config);

	Animation.pause();

	emulatorProc = child.execFile(emulatorPath, [gamePath].concat(config.cliArgs), (error, stdout, stderr) => {
		if (error) throw error;
	});

	focusAnnode();

	//Wait configured time
	window.setTimeout(function() {
		app.remote.getCurrentWindow().setAlwaysOnTop(false);
		focusChild();
	}, config.waitTime);
}

function focusChild() {
	processWindows.getProcesses(function(err, processes) {
        var focuses = processes.filter(p => String(p.pid).indexOf(String(emulatorProc.pid)) >= 0);
        if(focuses.length > 0) {
            processWindows.focusWindow(focuses[0]);
        }
    });
}

function focusAnnode() {
	processWindows.getProcesses(function(err, processes) {
        var focuses = processes.filter(p => p.mainWindowTitle.indexOf("Annode") >= 0);
        focuses = focuses.filter(p => p.processName.indexOf("electron") >= 0);

        console.log(focuses);

        if(focuses.length > 0) {
            processWindows.focusWindow(focuses[0]);
        }
    });
}

//Listener for the press of the kill button which will kill the proc in its tracks
ipcRenderer.on("childProc", (event, arg) => {
	if(emulatorProc != null) emulatorProc.kill();
	//Refocus on close
	focusAnnode();
	emulatorProc = null; 
	app.remote.getCurrentWindow().setAlwaysOnTop(true);
	Animation.unpause();
});
