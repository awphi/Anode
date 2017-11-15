const app = require('electron');

var emulators, emulatorQueue;
var allowAnimation = false;
var scroll = 'emulator';
var currentRom = 0;

//Wait till page has loaded by waiting for jQuery then allow usage
$(function() {
	emulators = getEmulators();
	emulatorQueue = getQueue();

	app.remote.getCurrentWindow().setAlwaysOnTop(true);
	var topVal = 20;
	for(var i = 0; i < 3; i ++) {
		var newEm  = newEmulatorBlock(topVal + '%',emulatorQueue[i]);
		if(i == 1) {
			newEm.style.height = '30vw';
			newEm.style.width = '60vw';
		}
		$(newEm).css('background-image', 'url(./Emulators/' + emulators[emulatorQueue[i]] + '/media.png)');
		topVal += 30;
	}
	allowAnimation = true;
});

//Returns array w/ length 3 - 1st, 2nd, 3rd
//TODO: Find a more elegant solution for this - less CSS dependent
function getEmulatorBlocks() {
	var els = document.getElementsByClassName('emulatorBlock');
	var ret = {top:null,middle:null,bottom:null};
	for(var i = 0; i < els.length; i ++) {
		switch(els[i].style.top) {
			case '20%':
				ret.top = els[i];
				break;
			case '50%':
				ret.middle = els[i];
				break;
			case '80%':
				ret.bottom = els[i];
				break;
		}
	}
	return ret;
}

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	//Retrieving all the currently shown emulatorBlocks and storing them in vars to animate - need to get a better way of doing this
	var emBlocks = getEmulatorBlocks();

	var goal, newBlock, topProps, middleProps, bottomProps, callback;
	if(arg == 'down') {
		emulatorQueue.unshift(emulatorQueue.pop());
		newBlock = newEmulatorBlock('-20%', emulatorQueue[0]);
		goal = '20%';

		topProps = {top: '50%', width: '60vw', height: '30vw'};
		middleProps = {top: '80%', width: '30vw', height: '15vw'};
		bottomProps = {top: '120%'};
		callback = function() {
			$(emBlocks.bottom).remove();
			allowAnimation = true;
		}
	} else if(arg == 'up') {
		emulatorQueue.push(emulatorQueue.shift());
		newBlock = newEmulatorBlock('120%', emulatorQueue[2]);
		goal = '80%';

		topProps = {top: '-20%'};
		middleProps = {top: '20%', width: '30vw', height: '15vw'};
		bottomProps = {top: '50%', width: '60vw', height: '30vw'};
		callback = function() {
			$(emBlocks.top).remove();
			allowAnimation = true;
		}
	}

	animateElement(emBlocks.top, topProps);
	animateElement(emBlocks.middle, middleProps);
	animateElement(emBlocks.bottom, bottomProps, callback);

	$(newBlock).animate({
	   top: goal
	}, { duration: 200, queue: false });
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
		newBlock = newRomBlock('-85%',emulators[emulatorQueue[1]],currentRom);
		goal = '185%';
	} else if(arg == 'up') {
		currentRom --;
		if(currentRom < 0) {
			currentRom = emulators[emulatorQueue[1]].roms.length - 1;
		}
		newBlock = newRomBlock('185%',emulators[emulatorQueue[1]],currentRom);
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

//Opens or closes the rom menu - arg is either 'open' or 'close'
function openRomsMenu(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	scroll = 'roms';
	currentRom = 0;

	//Move emulator menu to left
	animateElement($('.emulatorBlock'),{left: '25%', width: '30vw', height: '15vw'});

	//Bring in rom menu
	animateElement(newRomBlock('-85%',emulators[emulatorQueue[1]], 0),{top: '50%'}, () => allowAnimation = true);
}

function closeRomsMenu() {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;
	scroll = 'emulator';

	//Refocus emulator menu
	animateElement($('.emulatorBlock'),{left:'50%'});
	animateElement(getEmulatorBlocks().middle,{width: '60vw', height: '30vw'});

	 //Move & destroy rom menus
	 animateElement($('.romBlock'),{left:'150%'}, () => {
		 $('.romBlock').remove();
		 allowAnimation = true;
	 });
}
