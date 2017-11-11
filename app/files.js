const path = require('path');
const fs = require('fs');

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


//Reads in emulators/roms/all that jazz above - add in option to define Emulator files separately and DL them if they're not there
//Syncronous so it should be run before allowing the user to begin interacting
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
				if(fs.existsSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.txt')) {
					var readIn = fs.readFileSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.txt', 'utf8');
					//Double verify - scraper will only get first 600 chars anyway
					emulators[i].roms[j].metadata = readIn.substring(0,600) + '...';
				} else {
					emulators[i].roms[j].metadata = 'Sorry, no description available for this game currently!';
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
