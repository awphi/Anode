const ScrollEnum = Object.freeze({
    ROMS: 0,
    EMULATORS: 1
});

const ScrollDirEnum = Object.freeze({
    UP: 0,
    DOWN: 1
});

const Core = {
    emulatorsLocation: "./Emulators",
    currentRom: 0,
    emulatorWheel: undefined
}

const Animation = {
    core: {},
    NORMAL_EMULATOR_BOX: {width:"30vh", height:"15vh", borderRadius:"15px"},
    CENTRE_EMULATOR_BOX: {width:"70vh", height:"35vh", borderRadius:"30px"},
    scroll: ScrollEnum.EMULATORS,
    allowAnimation: false
}

//Returns object w/ properties - top, middle and all. Names fit what they contain...
Animation.getEmulatorBlocks = function() {
    var els = $(".emulatorBlock").sort(function(a, b) {
        return $(a).css("top") > $(b).css("top");
    });
    return {top: els[0], middle: els[1], bottom: els[2], all: document.getElementsByClassName("emulatorBlock")};
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

        Blocks.newEmulatorBlock("110%", Core.emulatorWheel[Core.emulatorWheel.length - 1]);

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
    if(!Animation.allowAnimation || !Animation.scroll == ScrollEnum.ROMS || Core.emulatorWheel[1].roms.length == 0) return;
    Animation.allowAnimation = false;

    var current = document.getElementsByClassName("romBlock")[0];
    var goal, newBlock;

    //Logic for scrolling
    if(arg == ScrollDirEnum.DOWN) {
        Core.currentRom ++;
        if(Core.currentRom > Core.emulatorWheel[1].roms.length - 1) {
            Core.currentRom = 0;
        }
        newBlock = Blocks.newRomBlock({top: "-85%"}, Core.emulatorWheel[1], Core.currentRom);
        goal = "185%";
    } else if(arg == ScrollDirEnum.UP) {
        Core.currentRom --;
        if(Core.currentRom < 0) {
            Core.currentRom = Core.emulatorWheel[1].roms.length - 1;
        }
        newBlock = Blocks.newRomBlock({top: "185%"}, Core.emulatorWheel[1], Core.currentRom);
        goal = "-85%";
    } else {
        newBlock = Blocks.newRomBlock({top: "-85%"}, Core.emulatorWheel[1], arg);
        goal = "185%";
    }

    //Old one out first
    Animation.core.animateElement(current, {top:goal}, () => $(current).remove());

    //New one in
    Animation.core.animateElement(newBlock, {top:"50%"}, () => Animation.allowAnimation = true);
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

Animation.openRomsMenu = function(emulator) {
    if(!Animation.allowAnimation || !Core.emulatorWheel.includes(emulator) || Animation.scroll === ScrollEnum.ROMS) return;

    Animation.allowAnimation = false;

    Animation.scroll = ScrollEnum.ROMS;
    Core.currentRom = 0;

    //Move emulator menu to left
    Animation.core.animateElement($(".emulatorBlock"), {left: "-20%"});
    Animation.core.animateElement($(".emulatorBlock"), Animation.NORMAL_EMULATOR_BOX);

    //Bring in rom menu
    Animation.core.animateElement(Blocks.newRomBlock({left: "185%"}, emulator, 0), {left: "50%"}, () => Animation.allowAnimation = true);
}

Animation.pause = function() {
    //Block animation and show a loading screen
    Animation.allowAnimation = false;
    var div = document.createElement("div");
    div.className = "pause";
    $("body").append(div);
}

Animation.unpause = function() {
    //Re-allow animation and kill the loading screen
    Animation.allowAnimation = true;
    if($(".pause").length > 0) {
        $(".pause").remove();
    }
}

Animation.closeRomsMenu = function() {
    if(!Animation.allowAnimation || Animation.scroll !== ScrollEnum.ROMS) return;

    Animation.allowAnimation = false;
    Animation.scroll = ScrollEnum.EMULATORS;

    //Refocus emulator menu
    Animation.core.animateElement($(".emulatorBlock"), {left:"50%"});
    Animation.core.animateElement(Animation.getEmulatorBlocks().middle, Animation.CENTRE_EMULATOR_BOX);

     //Move & destroy rom menus
     Animation.core.animateElement($(".romBlock"), {left:"150%"}, () => {
         $(".romBlock").remove();
         Animation.allowAnimation = true;
     });
}

/* MAIN BLOCK */
Files.reloadConfig();

var topVal = 20;
for(var i = 0; i < 3; i ++) {
    var newEm  = Blocks.newEmulatorBlock(topVal + "%", Core.emulatorWheel[i]);
    if(i == 1) {
        Animation.core.animateElement(newEm, Animation.CENTRE_EMULATOR_BOX, null, 0);
    }
    $(newEm).css("background-image", "url(" + Core.emulatorsLocation + "/" + Core.emulatorWheel[i] + "/media.png)");
    topVal += 30;
}
Animation.allowAnimation = true;
/* */
