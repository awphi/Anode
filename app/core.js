const Core = {
    currentRom: 0,
    emulatorWheel: undefined
}

Core.setCurrentRom = function(val) {
    var visible = 0;
    var selector = $(".rom-box");
    for(var i = 0; i < selector.length; i ++) {
        if(selector[i].style.visibility !== "hidden") {
            visible ++;
        }
    }

    if(visible <= val % 6) {
        return;
    }

    $(selector[Core.currentRom % 6]).css("animation-name", "");
    Core.currentRom = val;
    $(selector[Core.currentRom % 6]).css("animation-name", "rom-box-breathe");
}

Core.refreshRomPreview = function() {
    $(".rom-preview-wrapper").remove();
    Blocks.newRomPreview(Animation.ROM_BLOCK, Core.emulatorWheel[1], Core.currentRom);
}

Files.reloadConfig(false);

var topVal = 20;
for(var i = 0; i < 3; i ++) {
    var newEm  = Blocks.newEmulatorBlock(topVal + "%", Core.emulatorWheel[i]);
    if(i == 1) {
        Animation.core.animateElement(newEm, Animation.CENTRE_EMULATOR_BOX, null, 0);
    }
    $(newEm).css("background-image", "url(" + Files.emulatorsLocation + "/" + Core.emulatorWheel[i] + "/media.png)");
    topVal += 30;
}

Animation.allowAnimation = true;
require("electron").remote.getCurrentWindow().setAlwaysOnTop(true);