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
};

/*
    -- Generic input handler --
    Requires parameters to come in like so: 
        37 = move left (left arrow key)
        38 = move up (up arrow key)
        39 = move right (right arrow key)
        40 = move down (down arrow key)
        32 = start game (space key)
        75 = toggle search/sort panel (K key)   
*/
Inputs.core.handleInputs = function(code) {
    if(code === 75 && Animation.scroll === ScrollEnum.ROMS) {
        if(Animation.allowAnimation && !SearchSort.open) {
            SearchSort.openPanel();
        } else if(SearchSort.open) {
            SearchSort.closePanel();
        }
    }

    //If the search sort panel is open we want to 'hijack' key presses to use in that menu
    if(SearchSort.open) {
        // Handle inputs
        return;
    }

    // Starting a game in necessary
    if(Animation.scroll === ScrollEnum.ROMS && code === 32) {
        Games.openGame(Core.emulatorWheel[1], Core.emulatorWheel[1].roms[Core.currentRom]);
        return;
    }    

    // Arrow keys
    var dir;
    switch(code) {
        case 38: 
            dir = ScrollDirEnum.UP;
            break;
        case 40:
            dir = ScrollDirEnum.DOWN;
            break;
        case 37:
            dir = ScrollDirEnum.LEFT;
            break;
        case 39:
            dir = ScrollDirEnum.RIGHT;
            break;
    }

    if (Animation.scroll === ScrollEnum.ROMS) {
        Animation.scrollRoms(dir);
    } else if(Animation.scroll === ScrollEnum.EMULATORS) {
        if(dir === ScrollDirEnum.UP || dir === ScrollDirEnum.DOWN) {
            Animation.scrollEmulator(dir);
        } else if(dir === ScrollDirEnum.RIGHT) {
            Animation.openRomsMenu(Core.emulatorWheel[1]);
        }
    }
};

//Keyboard
window.onkeydown = function(e) {
    Inputs.core.handleInputs(e.which);
};

//Gamepad
window.addEventListener("gamepaddisconnected", function(e) {
    window.clearInterval(Inputs.gamepad.interval);
    //Make a little pop-up w/ main gamepad disconnected error
});

Inputs.gamepad.buttonPressed = function(button) {
    if (typeof(button) === "object") {
        return button.pressed;
    }

    return button === 1.0;
};

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
};