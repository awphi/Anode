const ScrollEnum = Object.freeze({
    ROMS: 0,
    EMULATORS: 1
});

const ScrollDirEnum = Object.freeze({
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
});

const Animation = {
    core: {},
    NORMAL_EMULATOR_BOX: {width:"30vh", height:"15vh", borderRadius:"15px"},
    CENTRE_EMULATOR_BOX: {width:"70vh", height:"35vh", borderRadius:"30px"},
    ROM_BLOCK: {left: "75%"},
    scroll: ScrollEnum.EMULATORS,
    allowAnimation: false
}

/*
    animateElement -> takes:
     - block (element we are animating)
     - props (an (anonymous) object representing the css properties we are animating to)
     - callback (a (potentinally anonymous) function to be executed on animation completion)
     - duration and queue are self-explanatory
*/
Animation.core.animateElement = function(block, props, callback, duration = 200, queue = false) {
    var req = $(block).animate(props, { duration: duration, queue: queue}).promise();
    req.done(function() {
        if(typeof(callback) == "function") {
            callback();
        }
    });
}

//Returns object w/ properties - top, middle and all. Names fit what they contain...
Animation.getEmulatorBlocks = function() {
    var els = $(".emulator-block").sort(function(a, b) {
        return $(a).css("top") > $(b).css("top");
    });
    return {top: els[0], middle: els[1], bottom: els[2], all: document.getElementsByClassName("emulator-block")};
}

Animation.scrollEmulator = function(arg) {
    if(!Animation.allowAnimation) return;
    Animation.allowAnimation = false;

    var emBlocks = Animation.getEmulatorBlocks();

    if(arg == ScrollDirEnum.DOWN) {
        Core.emulatorWheel.unshift(Core.emulatorWheel.pop());

        Blocks.newEmulatorBlock("-10%", Core.emulatorWheel[0]);

        Animation.core.animateElement(emBlocks.all, {top:"+=30%"});
        Animation.core.animateElement(emBlocks.top, Animation.CENTRE_EMULATOR_BOX);
        toKill = emBlocks.bottom;
    } else if(arg == ScrollDirEnum.UP) {
        Core.emulatorWheel.push(Core.emulatorWheel.shift());

        Blocks.newEmulatorBlock("110%", Core.emulatorWheel[2]);

        Animation.core.animateElement(emBlocks.all, {top:"-=30%"});
        Animation.core.animateElement(emBlocks.bottom, Animation.CENTRE_EMULATOR_BOX);
        toKill = emBlocks.top;
    }
    
    Animation.core.animateElement(emBlocks.middle, Animation.NORMAL_EMULATOR_BOX, () => {
        $(toKill).remove();
        Animation.allowAnimation = true;
    });
}

Animation.scrollRoms = function(arg) {
    if(!Animation.allowAnimation || !Animation.scroll == ScrollEnum.ROMS) return;

    const selector = $(".rom-box");
    const max = new Number(selector[selector.length - 1].getAttribute("index"));
    const current = new Number(selector[Core.currentRom % 6].getAttribute("index"));

    if(arg == ScrollDirEnum.UP) {
        if(Core.currentRom - 2 >= new Number(selector[0].getAttribute("index"))) {
            Core.setCurrentRom(Core.currentRom - 2);
        } else if(current - 2 >= 0) {
            Animation.allowAnimation = false;
            // Old one out
            var container = $(".rom-box-container-wrapper");
            Animation.core.animateElement(container, {top: "185%"}, () => container.remove());

            // New one in
            Animation.core.animateElement(Blocks.newRomBoxContainer({top: "-185%"}, Core.emulatorWheel[1], (max + 1) - 12), {top: "50%"}, 
                () =>  {
                    var last = new Number($(".rom-box")[5].getAttribute("index"));
                    
                    if(Core.currentRom % 2 == 0) {
                        Core.setCurrentRom(last - 1);
                    } else {
                        Core.setCurrentRom(last);
                    }

                    Animation.allowAnimation = true;
                });
        }
    } else if(arg == ScrollDirEnum.DOWN) {
        if(Core.currentRom + 2 <= max) {
            Core.setCurrentRom(Core.currentRom + 2);
        } else if(Core.currentRom + 2 > max && current + 2 < Core.emulatorWheel[1].roms.length) {
            Animation.allowAnimation = false;
            // Old one out
            var container = $(".rom-box-container-wrapper");
            Animation.core.animateElement(container, {top: "-185%"}, () => container.remove());

            // New one in
            Animation.core.animateElement(Blocks.newRomBoxContainer({top: "185%"}, Core.emulatorWheel[1], max + 1), {top: "50%"}, 
                () =>  {
                    var first = new Number($(".rom-box")[0].getAttribute("index"));
                    
                    if(Core.currentRom % 2 == 0) {
                        Core.setCurrentRom(first);
                    } else {
                        Core.setCurrentRom(first + 1);
                    }

                    Animation.allowAnimation = true;
                });
        }
    } else if(arg == ScrollDirEnum.RIGHT && Core.currentRom % 2 === 0) {
        // Can only move right if currently selected rom is on the left i.e. - its index is even
        Core.setCurrentRom(Core.currentRom + 1);
    } else if(arg == ScrollDirEnum.LEFT) {
        if(Core.currentRom % 2 !== 0) {
            // We're on the right so move left
            Core.setCurrentRom(Core.currentRom - 1);
        } else {
            // We're already on the left so close the menu
            Animation.closeRomsMenu();
            return;
        }
    }

    $(".rom-preview-wrapper").remove();
    Blocks.newRomPreview(Animation.ROM_BLOCK, Core.emulatorWheel[1], Core.currentRom);
}

Animation.openRomsMenu = function(emulator) {
    if(!Animation.allowAnimation || !Core.emulatorWheel.includes(emulator) || Animation.scroll === ScrollEnum.ROMS || emulator.roms.length <= 0) return;

    Animation.allowAnimation = false;

    Animation.scroll = ScrollEnum.ROMS;

    //Move emulator menu off-screen
    Animation.core.animateElement($(".emulator-block"), {left: "-80%"});

    //Bring in rom menu
    Animation.core.animateElement(Blocks.newRomBoxContainer({left: "185%"}, emulator, 0), {left: "25%"});
    Animation.core.animateElement(Blocks.newRomPreview({left: "185%"}, emulator, 0), Animation.ROM_BLOCK, () => Animation.allowAnimation = true);

    Core.setCurrentRom(0);
}

Animation.closeRomsMenu = function() {
    if(!Animation.allowAnimation || Animation.scroll !== ScrollEnum.ROMS) return;

    Animation.allowAnimation = false;
    Animation.scroll = ScrollEnum.EMULATORS;

    //Refocus emulator menu
    Animation.core.animateElement($(".emulator-block"), {left:"50%"});

    //Move & destroy rom menus
    Animation.core.animateElement($(".rom-preview-wrapper"), {left:"150%"}, () => $(".rom-preview-wrapper").remove());

    Animation.core.animateElement($(".rom-box-container-wrapper"), {left:"150%"}, () => {
        $(".rom-box-container-wrapper").remove();
        Animation.allowAnimation = true;
    });
}

Animation.pause = function() {
    //Block animation and show a loading screen
    Animation.allowAnimation = false;
    var div = Blocks.core.createClassedElement("pause");
    var img = document.createElement("img");
    img.src = "./app/images/loading.svg";
    div.appendChild(img);
    $("#body").append(div);
}

Animation.unpause = function() {
    //Re-allow animation and kill the loading screen
    Animation.allowAnimation = true;
    if($(".pause").length > 0) {
        $(".pause").remove();
    }
}
