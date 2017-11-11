window.onkeydown = function(e) {
	var code = e.keyCode ? e.keyCode : e.which;
	if(code == 38 || code == 40) {
		var dir;
		if(code == 38) {
			dir = 'up'
		} else if (code == 40) {
			dir = 'down'
		}
		if(scroll == 'emulator') {
			scrollEmulator(dir);
		} else if (scroll == 'roms') {
			scrollRoms(dir)
		}
	} else if (code == 39) {
		if(scroll == 'emulator') {
			romsMenu('open');
		} else if(scroll == 'roms') {
			openGame(emulators[emulatorQueue[1]],emulators[emulatorQueue[1]].roms[currentRom]);
		}
	} else if (code == 37 && scroll == 'roms') {
		romsMenu('close');
	}
}
