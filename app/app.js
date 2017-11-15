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

	//Allow user interaction after all the sync loading
	allowAnimation = true;
});

//Returns array w/ length 3 - 1st, 2nd, 3rd
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
	console.log(ret);
	return ret;
}

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	//Retrieving all the currently shown emulatorBlocks and storing them in vars to animate - need to get a better way of doing this
	var emBlocks = getEmulatorBlocks();

	var goal, newBlock;
	if(arg == 'down') {
		emulatorQueue.unshift(emulatorQueue.pop());
		//Once we've got the new high,principle & bottom we can move the emulatorBlocks
		newBlock = newEmulatorBlock('-20%', emulatorQueue[0]);
		goal = '20%';

		$(emBlocks.top).animate({
		   top: '50%', width: '60vw', height: '30vw'
		}, { duration: 200, queue: false });

		$(emBlocks.middle).animate({
		   top: '80%', width: '30vw', height: '15vw'
		}, { duration: 200, queue: false });

		$(emBlocks.bottom).animate({
		   top: '120%'
	   }, { duration: 200, queue: false, done: function() {
		   $(emBlocks.bottom).remove();
		   allowAnimation = true;
	   } });
	} else if(arg == 'up') {
		emulatorQueue.push(emulatorQueue.shift());
		newBlock = newEmulatorBlock('120%', emulatorQueue[2]);
		goal = '80%';

		$(emBlocks.top).animate({
			top: '-20%'
		 }, { duration: 200, queue: false });

		$(emBlocks.middle).animate({
		   top: '20%', width: '30vw', height: '15vw'
		}, { duration: 200, queue: false });

		$(emBlocks.bottom).animate({
		   top: '50%', width: '60vw', height: '30vw'
		}, { duration: 200, queue: false, done: function() {
		  $(emBlocks.top).remove();
		  allowAnimation = true;
		} });
	}

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
	$(current).animate({
	   top: goal
   }, { duration: 200, queue: false, done: function() {
	   $(current).remove();
	   allowAnimation = true;
   } });

   //New one in
   $(newBlock).animate({
	  top: '50%'
  }, { duration: 200, queue: false });
}

$('.emulatorBlock').observe('change', function(e) {
	console.log(e);
});

//Opens or closes the rom menu - arg is either 'open' or 'close'
function openRomsMenu(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	scroll = 'roms';
	currentRom = 0;
	//Move emulator menu to left
	$('.emulatorBlock').animate({
		   left: '25%', width: '30vw', height: '15vw'
	   }, { duration: 200, queue: false, done: function() {
		   allowAnimation = true;
	   } });

	//Bring in rom menu
	var newRom = newRomBlock('-85%',emulators[emulatorQueue[1]], 0);
	$(newRom).animate({
	   top: '50%'
   }, { duration: 200, queue: false });
}

function closeRomsMenu() {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	scroll = 'emulator';
	//Refocus emulator menu
	$('.emulatorBlock').animate({
		   left: '50%'
	   }, { duration: 200, queue: false });
	$(getEmulatorBlocks().middle).animate({
		   left: '50%', width: '60vw', height: '30vw'
	   }, { duration: 200, queue: false });

	 //Move & destroy rom menus
	 $('.romBlock').animate({
		 left: '150%'
	 }, { duration: 200, queue: false, done: function() {
		 $('.romBlock').remove();
		 allowAnimation = true;
	 } });
}
