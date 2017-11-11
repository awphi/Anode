/*| app.js |*/
/*
	This is the main script that controls the frontend - everything else in this is just used to run this semi-short script.
	It's pretty easy to understand and could definitely se some optimisation so if you see something and think it could be done
	better just make a pull request and I'll probably approve it - it's all a learning process.
*/

const app = require('electron');
//Load up some intial variables
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
			newEm.style.height = '30%';
			newEm.style.width = '60%';
		}
		$(newEm).css('background-image', 'url(./Emulators/' + emulators[emulatorQueue[i]] + '/media.png)');
		topVal += 30;
	}
	//Let's goooooo
	allowAnimation = true;
});

//Structure of emulators variable
//	emulators:
//		- [.roms]:
//		- N64
//		- SNES
//		- NES
//		- Gamecube:
//			[.games]:
//			- Game #1
//			- Game #2:
//				.boxart = boxart.png
//				.rom = rom.rom
//				.media = media.mp4/png
//				.metadata = metadata string

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;
	var goal = '';
	var recentemulatorBlock;
	var highemulatorBlock, principleemulatorBlock, bottomemulatorBlock;

	//Retrieving all the currently shown emulatorBlocks and storing them in vars to animate - need to get a better way of doing this
	var els = document.getElementsByClassName('emulatorBlock');
	for(var i = 0; i < els.length; i ++) {
		if(els[i].style.top == '20%') {
			highemulatorBlock = els[i];
		} else if(els[i].style.top == '50%') {
			principleemulatorBlock = els[i];
		} else if(els[i].style.top == '80%') {
			bottomemulatorBlock = els[i];
		}
	}

	if(arg == 'down') {
		var popped = emulatorQueue.pop();
		emulatorQueue.unshift(popped);
		//Once we've got the new high,principle & bottom we can move the emulatorBlocks
		recentemulatorBlock = newEmulatorBlock('-20%', emulatorQueue[0]);
		goal = '20%';
	} else {
		var shifted = emulatorQueue.shift();
		emulatorQueue.push(shifted);
		recentemulatorBlock = newEmulatorBlock('120%', emulatorQueue[2]);
		goal = '80%';
	}
	//This executes all the animations at once - iss beautiful
	//Clean this code up tho - iss not beautiful
    $(recentemulatorBlock).animate({
       top: goal
    }, { duration: 200, queue: false });

	//Do this using class selectors & assigning element property to emulatorQueue because this is DESGUSTIN'
	if(arg == 'down') {
	    $(highemulatorBlock).animate({
	       top: '50%', width: '60%', height: '30%'
	    }, { duration: 200, queue: false });

		$(principleemulatorBlock).animate({
	       top: '80%', width: '30%', height: '15%'
	    }, { duration: 200, queue: false });

		$(bottomemulatorBlock).animate({
	       top: '120%'
	   }, { duration: 200, queue: false, done: function() {
		   $(bottomemulatorBlock).remove();
		   allowAnimation = true;
	   } });
	} else {
		$(highemulatorBlock).animate({
			top: '-20%'
	 	}, { duration: 200, queue: false, done: function() {
			$(highemulatorBlock).remove();
			allowAnimation = true;
		} });

		$(principleemulatorBlock).animate({
	       top: '20%', width: '30%', height: '15%'
	    }, { duration: 200, queue: false });

		$(bottomemulatorBlock).animate({
	       top: '50%', width: '60%', height: '30%'
	   }, { duration: 200, queue: false });
   }
}

function scrollRoms(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	var current = document.getElementsByClassName('romBlock')[0];
	var goal = '';

	if(arg == 'down') {
		currentRom ++;
		if(currentRom > emulators[emulatorQueue[1]].roms.length - 1) {
			currentRom = 0;
		}
		var newBlock = newRomBlock('-85%',emulators[emulatorQueue[1]],currentRom);
		goal = '185%';
	} else if(arg == 'up') {
		currentRom --;
		if(currentRom < 0) {
			currentRom = emulators[emulatorQueue[1]].roms.length - 1;
		}
		var newBlock = newRomBlock('185%',emulators[emulatorQueue[1]],currentRom);
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

//Opens or closes the rom menu - arg is either 'open' or 'close'
function romsMenu(arg) {
	if(!allowAnimation) {
		return;
	}
	allowAnimation = false;

	var els = document.getElementsByClassName('emulatorBlock');
	var highemulatorBlock, principleemulatorBlock, bottomemulatorBlock;

	for(var i = 0; i < els.length; i ++) {
		if(els[i].style.top == '20%') {
			highemulatorBlock = els[i];
		} else if(els[i].style.top == '50%') {
			principleemulatorBlock = els[i];
		} else if(els[i].style.top == '80%') {
			bottomemulatorBlock = els[i];
		}
	}
	if(arg == 'open') {
		scroll = 'roms';
		currentRom = 0;
		//Move emulator menu to left
		$('.emulatorBlock').animate({
		   	left: '25%', width: '30%', height: '15%'
	   	}, { duration: 200, queue: false, done: function() {
		   	allowAnimation = true;
	   	} });

		//emulators[principle].roms
		//Bring in rom menu
		var newRom = newRomBlock('-85%',emulators[emulatorQueue[1]], 0);
		$(newRom).animate({
		   top: '50%'
	   }, { duration: 200, queue: false });
   } else if (arg == 'close') {
	   scroll = 'emulator';
	   //Refocus emulator menu
	   $('.emulatorBlock').animate({
		  	left: '50%'
	  	}, { duration: 200, queue: false });
	   $(principleemulatorBlock).animate({
		  	left: '50%', width: '60%', height: '30%'
	  	}, { duration: 200, queue: false });

		//Move & destroy rom menus
		$('.romBlock').animate({
			left: '150%'
		}, { duration: 200, queue: false, done: function() {
			$('.romBlock').remove();
			allowAnimation = true;
		} });
   }
}
