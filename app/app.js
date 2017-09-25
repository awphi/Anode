var path = require('path');
var fs = require('fs');

//Load up some intial variables
var emulators = [];

var principle = 1;
var allowAnimation = false;
var scroll = 'emulator';
var currentRom = 0;

//Init emulator queue - reloaded when reloadFIles is called
var emulatorQueue;

//Wait till page has loaded by waiting for jQuery then allow usage
$(function() {
	reloadFiles();
	document.getElementsByClassName('emulatorBlock')[1].style.height = '30%';
	document.getElementsByClassName('emulatorBlock')[1].style.width = '60%';
	var els = document.getElementsByClassName('emulatorBlock');
	for(var i = 0; i < els.length; i ++) {
		$(els[i]).css('background-image', 'url(./Emulators/' + emulators[i] + '/boxart.png)');
	};
	allowAnimation = true;
});

//Reads in emulators/roms/all that jazz above - add in option to define Emulator files separately and DL them if they're not there
function reloadFiles() {
	emulators = fs.readdirSync('./Emulators');
	console.log(emulators);
	for(var i = 0; i < emulators.length; i ++) {
		emulators[i] = new String(emulators[i]);
		emulators[i].roms = fs.readdirSync('./Emulators/' + emulators[i] + '/roms');
	};
	emulatorQueue = [];
	for(var i = 0; i < emulators.length; i ++) {
		emulatorQueue.push(i);
	}
};

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

//Creates a new emulatorBlock at the top or bottom by giving it's 'top' style text
//	\-> Good values I found are -20% for top and 120% for bottom!
function newemulatorBlock(top, id) {
	var div = document.createElement('div');
	div.className = 'emulatorBlock';
	document.getElementById('body').appendChild(div);
	var els = document.getElementsByClassName('emulatorBlock');
	var recent = els[els.length - 1];
	$(recent).css('background-image', 'url(./Emulators/' + emulators[id] + '/boxart.png)');
	recent.style.top = top;
	return recent;
}

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	};
	allowAnimation = false;
	var principleCache = principle;
	var goal = '';
	var recentemulatorBlock;
	var highemulatorBlock, principleemulatorBlock, bottomemulatorBlock;

	//Retrieving all the currently shown emulatorBlocks and storing them in vars to animate
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
		var shifted = emulatorQueue.shift();
		emulatorQueue.push(shifted);
		//Once we've got the new high,principle & bottom we can move the emulatorBlocks
		recentemulatorBlock = newemulatorBlock('-20%', emulatorQueue[0]);
		goal = '20%';
	} else {
		var popped = emulatorQueue.pop();
		emulatorQueue.unshift(popped);
		recentemulatorBlock = newemulatorBlock('120%', emulatorQueue[2]);
		goal = '80%';
	}
	console.log(emulatorQueue);
	//This executes all the animations at once - iss beautiful
	//Clean this code up tho - iss not beautiful
	$(function () {
	    $(recentemulatorBlock).animate({
	       top: goal
	    }, { duration: 200, queue: false });

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
	});
};

function newromBlock(top, emulator, gameNumber) {
	var div = document.createElement('div');
	var title = document.createElement('h1');
	title.innerHTML = emulator.roms[gameNumber];
	div.appendChild(title);
	div.className = 'romBlock';
	document.getElementById('body').appendChild(div);
	var els = document.getElementsByClassName('romBlock');
	var recent = els[els.length - 1];
	recent.style.top = top;
	return recent;
};

function scrollRoms(arg) {
	if(!allowAnimation) {
		return;
	};
	allowAnimation = false;

	var current = document.getElementsByClassName('romBlock')[0];
	var goal = '';

	if(arg == 'down') {
		currentRom ++;
		if(currentRom > emulators[principle].roms.length - 1) {
			currentRom = 0;
		};
		var newBlock = newromBlock('-85%',emulators[principle],currentRom);
		goal = '185%';
	} else if(arg == 'up') {
		currentRom --;
		if(currentRom < 0) {
			currentRom = emulators[principle].roms.length - 1;
		};
		var newBlock = newromBlock('185%',emulators[principle],currentRom);
		goal = '-85%';
	}

	//Old one out first
	$(current).animate({
	   top: goal
   }, { duration: 200, queue: false, done: function() {
	   $(current).remove();
   } });

   //New one in
   $(newBlock).animate({
	  top: '50%'
  }, { duration: 200, queue: false, done: function() {
	  allowAnimation = true;
  } });
};

//Opens or closes the rom menu - arg is either 'open' or 'close'
function romsMenu(arg) {
	if(!allowAnimation) {
		return;
	};
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
		var newRom = newromBlock('-85%',emulators[principle], 0);
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
   };
};

//Starts emulator for given game
function openGame() {

};

window.onkeydown = function(e) {
	var code = e.keyCode ? e.keyCode : e.which;
	if(code == 38 || code == 40) {
		var dir;
		if(code == 38) {
			dir = 'up'
		} else if (code == 40) {
			dir = 'down'
		}
		if(scroll == 'emulator') {
			scrollEmulator(dir);
		} else if (scroll == 'roms') {
			scrollRoms(dir)
		}
	} else if (code == 39) {
		if(scroll == 'emulator') {
			romsMenu('open');
		} else if(scroll == 'roms') {
			openGame();
		};
	} else if (code == 37 && scroll == 'roms') {
		romsMenu('close');
	};
};
