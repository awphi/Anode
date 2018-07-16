const child = require("child_process");
const processWindows = require("./process-windows/index");
const app = require("electron");

const Games = {
    emulatorProc: null
}

//Starts emulator for given game
Games.openGame = function(gameConsole, game) {
    if(Games.emulatorProc != null) return;

    //Get paths
    var emulatorPath = Files.getEmulatorPath(gameConsole);
    var gamePath = Files.getRomPath(gameConsole, game);
    if(gamePath == null || emulatorPath == null) return;

    //Read in emu config to be used in childProc
    var config = Files.getConfig(gameConsole, game);

    Animation.pause();

    if(gameConsole == "MAME") {
        config.cliArgs.unshift("default");
        config.cliArgs.unshift("-ctrlr");

        config.cliArgs.unshift(emulatorPath.split("MAME")[0] + "MAME/emulator/ctrlr");
        config.cliArgs.unshift("-ctrlrpath");

        config.cliArgs.unshift(emulatorPath.split("MAME")[0] + "MAME/roms");
        config.cliArgs.unshift("-rp");
    }

    Games.emulatorProc = child.execFile(emulatorPath, [gamePath].concat(config.cliArgs), (error, stdout, stderr) => {
        if (error) throw error;
    });

    if(gameConsole != "MAME") {
        Games.focusAnode();
    }

    //Wait configured time
    window.setTimeout(function() {
        app.remote.getCurrentWindow().setAlwaysOnTop(false);

        Games.focusChild();
    }, config.waitTime);
}

Games.focusChild = function() {
    processWindows.getProcesses(function(err, processes) {
        var focuses = processes.filter(p => String(p.pid).indexOf(String(Games.emulatorProc.pid)) >= 0);
        if(focuses.length > 0) {
    		processWindows.focusWindow(focuses[0].pid);
        }
    });
}

Games.focusAnode = function() {
    processWindows.getProcesses(function(err, processes) {
        var focuses = processes.filter(p => p.mainWindowTitle.indexOf("Anode") >= 0);
        focuses = focuses.filter(p => p.processName.indexOf("electron") >= 0);

        if(focuses.length > 0) {
            processWindows.focusWindow(focuses[0]);
        }
    });
}

//Listener for the press of the kill button which will kill the proc in its tracks
app.ipcRenderer.on("childProc", (event, arg) => {
    if(Games.emulatorProc != null) {
        Games.emulatorProc.kill();
    }
    //Refocus on close
    Games.focusAnode();
    Games.emulatorProc = null; 
    app.remote.getCurrentWindow().setAlwaysOnTop(true);
    Animation.unpause();
});
