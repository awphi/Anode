const Files = {};

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

Files.getRomPath = function(gameConsole, game) {
	if(!fs.existsSync(Core.emulatorsLocation + "/" + gameConsole + "/roms/" + game)) return null;

	var cont = fs.readdirSync(Core.emulatorsLocation + "/" + gameConsole + "/roms/" + game);
	for(var i = 0; i < cont.length; i ++) {
		if(cont[i].split(".")[0] == "rom") return Core.emulatorsLocation + "/" + gameConsole + "/roms/" + game + "/" + cont[i];
	}
}

Files.getEmulatorPath = function(gameConsole) {
	if(!fs.existsSync(Core.emulatorsLocation + "/" + gameConsole + "/emulator")) return null;

	var cont = fs.readdirSync(Core.emulatorsLocation + "/" + gameConsole + "/emulator");
	for(var i = 0; i < cont.length; i ++) {
		if(cont[i].split(".")[1] == "exe") return Core.emulatorsLocation + "/" + gameConsole + "/emulator/" + cont[i];
	}
}

//Returns array of emulator objects which contain its media, roms, rom media, rom metadata etc. - VITAL global object
// TODO: Remove utter dependency on this object and spread it out
Files.getEmulators = function() {
	emulators = fs.readdirSync(Core.emulatorsLocation);
	for(var i = 0; i < emulators.length; i ++) {
		emulators[i] = new String(emulators[i]);
		if(fs.existsSync(Core.emulatorsLocation + "/" + emulators[i] + "/roms")) {
			var roms = fs.readdirSync(Core.emulatorsLocation + "/" + emulators[i] + "/roms");
			emulators[i].roms = [];
			for(var j = 0; j < roms.length; j ++) {
				emulators[i].roms[j] = new String(roms[j]);
				emulators[i].roms[j].media = Core.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/media.png";
				if(fs.existsSync(Core.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.yml")) {
					emulators[i].roms[j].metadata = yaml.safeLoad(fs.readFileSync(Core.emulatorsLocation + "/" + emulators[i] + "/roms/" + roms[j] + "/metadata.yml","utf-8"));
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
