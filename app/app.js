const app = require("electron");

//Animation object for the script - everything animation related is to be moved into here
// \-> This is to declutter the window obj
const Animation = new AnimationController();

const Core = {
	emulatorsLocation: "./Emulators",
	currentRom: 0,
	emulatorWheel: undefined
}

function AnimationController() {
	this.core = {};
	this.NORMAL_EMULATOR_BOX = {width:"30vh", height:"15vh"};
	this.CENTRE_EMULATOR_BOX = {width:"70vh", height:"35vh"};
	this.scroll = "emulator";
	this.allowAnimation = false;
}

//Wait till page has loaded by waiting for jQuery then begin
$(function() {
	app.remote.getCurrentWindow().setAlwaysOnTop(true);
	if(Files.getAnnodeConfig() != null) {
		//If undefined OR no config file exists - look for emulator pack in dir of application
		Core.emulatorsLocation = Files.getAnnodeConfig()["emulators-location"] == "" ? "./Emulators" : Files.getAnnodeConfig()["emulators-location"];
	}
	Core.emulatorWheel = Files.getEmulators();

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
});

//Returns object w/ properties - top, middle and all. Names fit what they contain...
Animation.getEmulatorBlocks = function() {
	var els = document.getElementsByClassName("emulatorBlock");
	var ret = {top:null, middle:null, bottom:null};
	for(var i = 0; i < els.length; i ++) {
		//Floating point inaccuracies are fun
		var num = Math.round(els[i].style.top.split("%")[0] / 10) * 10;
		switch(num) {
			case 20:
				ret.top = els[i];
				break;
			case 50:
				ret.middle = els[i];
				break;
			case 80:
				ret.bottom = els[i];
				break;
		}
	}
	ret.all = els;
	return ret;
}

Animation.scrollEmulator = function(arg) {
	if(!Animation.allowAnimation) return;
	Animation.allowAnimation = false;

	var emBlocks = Animation.getEmulatorBlocks();

	if(arg == "down") {
		Core.emulatorWheel.unshift(Core.emulatorWheel.pop());

		Blocks.newEmulatorBlock("-10%", Core.emulatorWheel[0]);

		Animation.core.animateElement(emBlocks.all, {top:"+=30%"});
		Animation.core.animateElement(emBlocks.top, Animation.CENTRE_EMULATOR_BOX);
		toKill = emBlocks.bottom;
	} else if(arg == "up") {
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
	if(!Animation.allowAnimation || !Animation.scroll == "roms" || Core.emulatorWheel[1].roms.length == 0) return;
	Animation.allowAnimation = false;

	var current = document.getElementsByClassName("romBlock")[0];
	var goal, newBlock;

	//Logic for scrolling
	if(arg == "down") {
		Core.currentRom ++;
		if(Core.currentRom > Core.emulatorWheel[1].roms.length - 1) {
			Core.currentRom = 0;
		}
		newBlock = Blocks.newRomBlock("-85%", Core.emulatorWheel[1], Core.currentRom);
		goal = "185%";
	} else if(arg == "up") {
		Core.currentRom --;
		if(Core.currentRom < 0) {
			Core.currentRom = Core.emulatorWheel[1].roms.length - 1;
		}
		newBlock = Blocks.newRomBlock("185%", Core.emulatorWheel[1], Core.currentRom);
		goal = "-85%";
	} else {
		newBlock = Blocks.newRomBlock("-85%", Core.emulatorWheel[1], arg);
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
    console.log(emulator);
	if(!Animation.allowAnimation || !Core.emulatorWheel.includes(emulator) || Animation.scroll === "roms") return;

	Animation.allowAnimation = false;

	Animation.scroll = "roms";
	Core.currentRom = 0;

	//Move emulator menu to left
	Animation.core.animateElement($(".emulatorBlock"), {left: "20%"});
	Animation.core.animateElement($(".emulatorBlock"), Animation.NORMAL_EMULATOR_BOX);

	//Bring in rom menu
	Animation.core.animateElement(Blocks.newRomBlock("-85%", emulator, 0), {top: "50%"}, () => Animation.allowAnimation = true);
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
	if(!Animation.allowAnimation || Animation.scroll !== "roms") return;

	Animation.allowAnimation = false;
	Animation.scroll = "emulator";

	//Refocus emulator menu
	Animation.core.animateElement($(".emulatorBlock"), {left:"50%"});
	Animation.core.animateElement(Animation.getEmulatorBlocks().middle, Animation.CENTRE_EMULATOR_BOX);

	 //Move & destroy rom menus
	 Animation.core.animateElement($(".romBlock"), {left:"150%"}, () => {
		 $(".romBlock").remove();
		 Animation.allowAnimation = true;
	 });
}
