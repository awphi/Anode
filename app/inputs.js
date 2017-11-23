//Generic input handler
// Requires parameters to come in like so:
//	\-> code: 38 = scroll up, 40 = scroll down, 39 = open roms meny/open game, 37 = close roms menu
//	(These are just the keycodes for the arrow keys but to standardise I'll use these numbers)
function handleInputs(code) {
	if(code == 38 || code == 40) {
		var dir;
		if(code == 38) {
			dir = 'up'
		} else if (code == 40) {
			dir = 'down'
		}
		if(Animation.scroll == 'emulator') {
			Animation.scrollEmulator(dir);
		} else if (Animation.scroll == 'roms') {
			Animation.scrollRoms(dir)
		}
	} else if (code == 39) {
		if(Animation.scroll == 'emulator') {
			Animation.openRomsMenu();
		} else if(Animation.scroll == 'roms') {
			openGame(emulators[emulatorQueue[1]],emulators[emulatorQueue[1]].roms[currentRom]);
		}
	} else if (code == 37 && Animation.scroll == 'roms') {
		Animation.closeRomsMenu();
	}
}

//Keyboard
window.onkeydown = function(e) {
	var code = e.keyCode ? e.keyCode : e.which;
	handleInputs(code);
}

//Gamepad input handling - only uses the first gamepad connected to act like player 1 controlling the menu sort of thing (think wii or arcade machines)
var interval;
const controllerPoll = window.setInterval(waitForGamepad,500);
const canPress = [];

function waitForGamepad() {
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	if(gamepads[0] != null) {
		window.clearInterval(controllerPoll);
		console.log('gamepad connected: ', gamepads[0]);
		interval = window.setInterval(pollGamepadInputs,16);
	}
}

window.addEventListener("gamepaddisconnected", function(e) {
	window.clearInterval(interval);
	console.log(e);
	//Make a little pop-up w/ main gamepad disconnected error
});

function buttonPressed(button) {
	if (typeof(button) == "object") {
		return button.pressed;
	}
	return button == 1.0;
}

function pollGamepadInputs() {
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	if (!gamepads) {
		window.clearInterval(interval);
		return;
	}
	var gp = gamepads[0];
	if(buttonPressed(gp.buttons[0]) && canPress[0]) {
		handleInputs(39);
	} else if(buttonPressed(gp.buttons[1]) && canPress[1]) {
		handleInputs(37);
	} else if(buttonPressed(gp.buttons[12])) {
		handleInputs(38);
	} else if(buttonPressed(gp.buttons[13])) {
		handleInputs(40);
		console.log('x');
	}
	for(var i = 0; i < gp.buttons.length; i ++) {
		if(buttonPressed(gp.buttons[i])) {
			canPress[i] = false;
		} else {
			canPress[i] = true;
		}
	}
}
