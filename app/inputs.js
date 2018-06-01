const Inputs = {
    core: {},
    gamepad: {
        canPress: [],
        poll: setInterval(this.waitForGamepad, 500),
        waitForGamepad: function() {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            if(gamepads[0] != null) {
                window.clearInterval(this.poll);
                console.log("gamepad connected: ", gamepads[0]);
                this.interval = window.setInterval(this.pollInputs, 16);
            }
        }
    }
}

//Generic input handler
// Requires parameters to come in like so:
//    \-> code: 38 = scroll up, 40 = scroll down, 39 = open roms menu/open game, 37 = close roms menu
//    (These are just the keycodes for the arrow keys but to standardise I'll use these numbers)
Inputs.core.handleInputs = function(code) {
    if(code == 38 || code == 40) {
        var dir = code == 38 ? ScrollDirEnum.UP : ScrollDirEnum.DOWN;
        if(Animation.scroll == ScrollEnum.EMULATORS) {
            Animation.scrollEmulator(dir);
        } else if (Animation.scroll == ScrollEnum.ROMS) {
            Animation.scrollRoms(dir)
        }
    } else if (code == 39) {
        if(Animation.scroll == ScrollEnum.EMULATORS) {
            Animation.openRomsMenu(Core.emulatorWheel[1]);
        } else if(Animation.scroll == ScrollEnum.ROMS) {
            Games.openGame(Core.emulatorWheel[1], Core.emulatorWheel[1].roms[Core.currentRom]);
        }
    } else if (code == 37 && Animation.scroll == ScrollEnum.ROMS) {
        Animation.closeRomsMenu();
    }
}

//Keyboard
window.onkeydown = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    Inputs.core.handleInputs(code);
}

//Gamepad
window.addEventListener("gamepaddisconnected", function(e) {
    window.clearInterval(Inputs.gamepad.interval);
    console.log(e);
    //Make a little pop-up w/ main gamepad disconnected error
});

Inputs.gamepad.buttonPressed = function(button) {
    if (typeof(button) == "object") {
        return button.pressed;
    }

    return button == 1.0;
}

Inputs.gamepad.pollInputs = function() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
        window.clearInterval(Inputs.gamepad.interval);
        return;
    }
    var gp = gamepads[0];
    if(Inputs.gamepad.buttonPressed(gp.buttons[0]) && Inputs.gamepad.canPress[0]) {
        Inputs.core.handleInputs(39);
    } else if(Inputs.gamepad.buttonPressed(gp.buttons[1]) && Inputs.gamepad.canPress[1]) {
        Inputs.core.handleInputs(37);
    } else if(Inputs.gamepad.buttonPressed(gp.buttons[12])) {
        Inputs.core.handleInputs(38);
    } else if(Inputs.gamepad.buttonPressed(gp.buttons[13])) {
        Inputs.core.handleInputs(40);
    }
    for(var i = 0; i < gp.buttons.length; i ++) {
        if(Inputs.gamepad.buttonPressed(gp.buttons[i])) {
            Inputs.gamepad.canPress[i] = false;
        } else {
            Inputs.gamepad.canPress[i] = true;
        }
    }
}