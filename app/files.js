const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

function getRomPath(gameConsole, game) {
	if(fs.existsSync('./Emulators/' + gameConsole + '/roms/' + game)) {
		var cont = fs.readdirSync('./Emulators/' + gameConsole + '/roms/' + game);
		for(var i = 0; i < cont.length; i ++) {
			if(cont[i].split('.')[0] == 'rom') {
				return __dirname + '\\Emulators\\' + gameConsole + '\\roms\\' + game + '\\' + cont[i];
		    	break;
			}
		}
	}
}

function getEmulatorPath(gameConsole) {
	if(fs.existsSync('./Emulators/' + gameConsole + '/emulator')) {
        var cont = fs.readdirSync('./Emulators/' + gameConsole + '/emulator');
        for(var i = 0; i < cont.length; i ++) {
            console.log(cont[i].split('.'));
            if(cont[i].split('.')[1] == 'exe') {
                return __dirname + '\\Emulators\\' + gameConsole + '\\emulator\\' + cont[i];
				break;
            }
        }
    }
}

function getEmulators() {
	emulators = fs.readdirSync('./Emulators');
	for(var i = 0; i < emulators.length; i ++) {
		emulators[i] = new String(emulators[i]);
		if(fs.existsSync('./Emulators/' + emulators[i] + '/roms')) {
			var roms = fs.readdirSync('./Emulators/' + emulators[i] + '/roms');
			emulators[i].roms = [];
			for(var j = 0; j < roms.length; j ++) {
				emulators[i].roms[j] = new String(roms[j]);
				emulators[i].roms[j].media = './Emulators/' + emulators[i] + '/roms/' + roms[j] + '/media.png';
				if(fs.existsSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.yml')) {
					//Double verify - scraper will only get first 600 chars anyway
					emulators[i].roms[j].metadata = yaml.safeLoad(fs.readFileSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.yml', 'utf8'));
				} else {
					emulators[i].roms[j].metadata = {description:"No description available currently!", developer:"Unknown Developer", release:"Unkown",players:"Unknown",genres:"Unknown"};
				}
			}
		}
	}
	return emulators;
}

function getQueue() {
	var ret = [];
	for(var i = 0; i < getEmulators().length; i ++) {
		ret.push(i);
	}
	return ret;
}

function getConfig(gameConsole) {
	var path = getEmulatorPath(gameConsole);
	if(path != null) {
		path = path.split(gameConsole)[0] + gameConsole + '\\config.yml';
		try {
			return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
		} catch (e) {
			//Returns a default object
			return {cliArgs:[], waitTime:500};
		}
	}
}
