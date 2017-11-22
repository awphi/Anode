const app = require('electron');

//Global vars needed by other scripts too - keep on window scope
var emulators, emulatorQueue;
var currentRom = 0;

//Move into Animation.* scope
var allowAnimation = false;
var scroll = 'emulator';

//Animation object for the script - everything animation related is to be moved into here
// \-> This is to declutter the window obj
const Animation = new Object();
Animation.NORMAL_EMULATOR_BOX = {width:'30vh', height:'15vh'};
Animation.CENTRE_EMULATOR_BOX = {width:'60vh', height:'30vh'};

//Wait till page has loaded by waiting for jQuery then begin
$(function() {
	emulators = getEmulators();
	emulatorQueue = getQueue();

	app.remote.getCurrentWindow().setAlwaysOnTop(true);
	var topVal = 20;
	for(var i = 0; i < 3; i ++) {
		var newEm  = newEmulatorBlock(topVal + '%', emulatorQueue[i]);
		if(i == 1) {
			newEm.style.height = '30vh';
			newEm.style.width = '60vh';
		}
		$(newEm).css('background-image', 'url(./Emulators/' + emulators[emulatorQueue[i]] + '/media.png)');
		topVal += 30;
	}
	allowAnimation = true;
});

//Returns object w/ properties - top, middle and all. Names fit what they contain...
function getEmulatorBlocks() {
	var els = document.getElementsByClassName('emulatorBlock');
	var ret = {top:null, middle:null, bottom:null};
	for(var i = 0; i < els.length; i ++) {
		//Floating point inaccuracies are fun
		var num = Math.round(els[i].style.top.split('%')[0] / 10) * 10;
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

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	var emBlocks = getEmulatorBlocks();
	var toKill;

	if(arg == 'down') {
		emulatorQueue.unshift(emulatorQueue.pop());
		newEmulatorBlock('-10%', emulatorQueue[0]);

		animateElement(emBlocks.all, {top:'+=30%'});
		animateElement(emBlocks.top, Animation.CENTRE_EMULATOR_BOX);
		toKill = emBlocks.bottom;
	} else if(arg == 'up') {
		emulatorQueue.push(emulatorQueue.shift());
		newEmulatorBlock('110%', emulatorQueue[2]);

		animateElement(emBlocks.all, {top:'-=30%'});
		animateElement(emBlocks.bottom, Animation.CENTRE_EMULATOR_BOX);
		toKill = emBlocks.top;
	}
	animateElement(emBlocks.middle, Animation.NORMAL_EMULATOR_BOX, () => {
		$(toKill).remove();
		allowAnimation = true;
	});
}

function scrollRoms(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	var current = document.getElementsByClassName('romBlock')[0];
	var goal, newBlock;

	//Logic for scrolling
	if(arg == 'down') {
		currentRom ++;
		if(currentRom > emulators[emulatorQueue[1]].roms.length - 1) {
			currentRom = 0;
		}
		newBlock = newRomBlock('-85%', emulators[emulatorQueue[1]], currentRom);
		goal = '185%';
	} else if(arg == 'up') {
		currentRom --;
		if(currentRom < 0) {
			currentRom = emulators[emulatorQueue[1]].roms.length - 1;
		}
		newBlock = newRomBlock('185%', emulators[emulatorQueue[1]], currentRom);
		goal = '-85%';
	}

	//Old one out first
	animateElement(current, {top:goal}, () => $(current).remove());

	//New one in
	animateElement(newBlock, {top:'50%'}, () => allowAnimation = true);
}

/*
	animateElement -> takes:
	 - block (element we are animating)
	 - props (an (anonymous) object representing the css properties we are animating to)
	 - callback (a (potentinally anonymous) function to be executed on animation completion)
	 - duration and queue are self-explanatory
*/
function animateElement(block, props, callback, duration = 200, queue = false) {
	var req = $(block).animate(props, { duration: duration, queue: queue}).promise();
	req.done(function() {
		if(typeof(callback) == 'function') {
			callback();
		}
	});
}

function openRomsMenu() {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	scroll = 'roms';
	currentRom = 0;

	//Move emulator menu to left
	animateElement($('.emulatorBlock'), {left: '20%'});
	animateElement($('.emulatorBlock'), Animation.NORMAL_EMULATOR_BOX);

	//Bring in rom menu
	animateElement(newRomBlock('-85%', emulators[emulatorQueue[1]], 0), {top: '50%'}, () => allowAnimation = true);
}

function closeRomsMenu() {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;
	scroll = 'emulator';

	//Refocus emulator menu
	animateElement($('.emulatorBlock'), {left:'50%'});
	animateElement(getEmulatorBlocks().middle, Animation.CENTRE_EMULATOR_BOX);

	 //Move & destroy rom menus
	 animateElement($('.romBlock'), {left:'150%'}, () => {
		 $('.romBlock').remove();
		 allowAnimation = true;
	 });
}
