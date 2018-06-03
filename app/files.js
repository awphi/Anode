const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const Files = {
    emulatorsLocation: "./Emulators"
};

Files.getRomPath = function(gameConsole, game) {
    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game)) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game);
    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[0] == "rom") return Files.emulatorsLocation + "/" + gameConsole + "/roms/" + game + "/" + cont[i];
    }
}

Files.reloadConfig = function(scraperMode) {
    if(Files.getAnnodeConfig() != null) {
        //If undefined OR no config file exists - look for emulator pack in dir of application
        Files.emulatorsLocation = Files.getAnnodeConfig()["emulators-location"] == "" ? "./Emulators" : Files.getAnnodeConfig()["emulators-location"];
    }

    if(!scraperMode) {
        Core.emulatorWheel = Files.getEmulators();
    }
}

Files.getEmulatorPath = function(gameConsole) {
    if(!fs.existsSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator")) return null;

    var cont = fs.readdirSync(Files.emulatorsLocation + "/" + gameConsole + "/emulator");
    for(var i = 0; i < cont.length; i ++) {
        if(cont[i].split(".")[1] == "exe") return Files.emulatorsLocation + "/" + gameConsole + "/emulator/" + cont[i];
    }
}

//Returns array of emulator objects which contain its media, roms, rom media, rom metadata etc. - VITAL global object
// TODO: Remove utter dependency on this object and spread it out
Files.getEmulators = function() {
    var emulators = fs.readdirSync(Files.emulatorsLocation);
    for(var i = 0; i < emulators.length; i ++) {
        emulators[i] = new String(emulators[i]);
        if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms")) {
            var roms = fs.readdirSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms");
            emulators[i].roms = [];
            for(var j = 0; j < roms.length; j ++) {
                emulators[i].roms[j] = new String(roms[j]);
                emulators[i].roms[j].media = Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/media.png";
                if(fs.existsSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.yml")) {
                    emulators[i].roms[j].metadata = yaml.safeLoad(fs.readFileSync(Files.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.yml","utf-8"));
                } else {
                    //Return deafault object in case of deleted metadata.yml for whatever reason
                    emulators[i].roms[j].metadata = {description:"No description available currently!", developer:"Unknown Developer", release:"Unkown",players:"Unknown",genres:"Unknown"};
                }
            }
        }
    }
    return emulators;
}

Files.getAnnodeConfig = function() {
    return yaml.safeLoad(fs.readFileSync("./config.yml"), "utf-8");
}

Files.getConfig = function(gameConsole) {
    var path = Files.getEmulatorPath(gameConsole);
    if(path != null) {
        path = path.split(gameConsole)[0] + gameConsole + "/config.yml";
        try {
            return yaml.safeLoad(fs.readFileSync(path),"utf-8");
        } catch (e) {
            //Returns a default object
            return {cliArgs:[], waitTime:500};
        }
    }
}
