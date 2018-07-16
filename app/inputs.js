const Inputs = {
    core: {},
    gamepad: {
        canPress: [],
        waitForGamepad: function() {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            if(gamepads[0] != null) {
                window.clearInterval(Inputs.gamepad.poll);
                //console.log("gamepad connected: ", gamepads[0]);
                Inputs.gamepad.interval = window.setInterval(Inputs.gamepad.pollInputs, 100);
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

    const gp = gamepads[0];

    // Magic numbers time
    if(gp.axes[1] >= 0.7) {
    	// Right
        Inputs.core.handleInputs(39);
    } else if(gp.axes[1] <= -0.7) {
    	// Left
        Inputs.core.handleInputs(37);
    } else if(gp.axes[0] >= 0.7) {
    	// Up
        Inputs.core.handleInputs(38);
    } else if(gp.axes[0] <= -0.7) {
    	// Down
        Inputs.core.handleInputs(40);
    } else if(Inputs.gamepad.buttonPressed(gp.buttons[12]) && Inputs.gamepad.canPress[12]) {
    	// Start game
    	Inputs.core.handleInputs(32);
    }

    for(var i = 0; i < gp.buttons.length; i ++) {
        if(Inputs.gamepad.buttonPressed(gp.buttons[i])) {
            Inputs.gamepad.canPress[i] = false;
        } else {
            Inputs.gamepad.canPress[i] = true;
        }
    }
};

Inputs.gamepad.poll = setInterval(Inputs.gamepad.waitForGamepad, 500);