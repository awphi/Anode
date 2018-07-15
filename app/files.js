const path = require("path");
const fs = require("fs");
const Config = require('electron-config');

const Files = {
    emulatorsLocation: "./Emulators",
    config: new Config()
};

Files.getRomPath = function(gameConsole, game) {
    if(gameConsole == "MAME") {
        return game;
    }

    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game)) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game);
    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[0] === "rom") return Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game + "/" + cont[i];
    }
};

Files.reloadConfig = function(scraperMode) {
    if(Files.config.get('emulatorsLocation') == null || Files.config.get('emulatorsLocation') === "") {
        alert('Emulators location is not set please set it in the config section of the F3 dev menu');
    }

    Files.emulatorsLocation = Files.config.get('emulatorsLocation');

    if(!scraperMode) {
        Core.emulatorWheel = Files.getEmulators();
    }
};

Files.getEmulatorPath = function(gameConsole) {
    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator")) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator");
    var path;

    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[1] === "exe" || cont[i] === "emulator.exe") { 
            path = Files.emulatorsLocation + "/" + gameConsole + "/emulator/" + cont[i];
            if(cont[i] === "emulator.exe") {
                break;
            }
        }
    }

    return path;
}

// Used to create Core.emulatorWheel, currently a large memory hog - maybe cut down by dynamically loading metadata etc. by reading files on the fly
// This will: slow runtime, speed up loadtime and reduce ram usage
Files.getEmulators = function() {
    var emulators = fs.readdirSync(Files.emulatorsLocation);

    for(var i = 0; i < emulators.length; i ++) {
        if(emulators[i] === "in") {
            emulators.splice(i, 1);
        }

        emulators[i] = new String(emulators[i]);
        if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms")) {
            // MAME behaves very different to all other emulators so it's FS is different too
            // (this also means the scraper deson't work on mame games)
            var roms = fs.readdirSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms");
            emulators[i].roms = [];
            for(var j = 0; j < roms.length; j ++) {
                if(emulators[i] == "MAME" && roms[j].includes(".zip") || emulators[i] != "MAME") {
                    const obj = new String(roms[j]);

                    var resDir = emulators[i] == "MAME" ? obj.split(".")[0] + "-res" : obj;

                    obj.media = Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + resDir + "/media.png";

                    if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + resDir + "/metadata.json")) {
                        obj.metadata = Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + resDir + "/metadata.json";
                    } else {
                        //Return default object in case of deleted metadata.json for whatever reason
                       obj.metadata = null;
                    }

                    emulators[i].roms.push(obj);
                }
            }
        }
    }
    return emulators;
};

Files.getConfig = function(gameConsole) {
    var path = Files.getEmulatorPath(gameConsole);
    if(path != null) {
        path = path.split(gameConsole)[0] + gameConsole + "/config.json";
        try {
            return JSON.parse(fs.readFileSync(path));
        } catch (e) {
            //Returns a default object
            return {cliArgs:[], waitTime:500};
        }
    }
};
