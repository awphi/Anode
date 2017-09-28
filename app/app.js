var path = require('path');
var fs = require('fs');

//Load up some intial variables
var emulators = [];

var allowAnimation = false;
var scroll = 'emulator';
var currentRom = 0;

var emulatorQueue;

//Wait till page has loaded by waiting for jQuery then allow usage
$(function() {
	reloadFiles();
	var topVal = 20;
	for(var i = 0; i < 3; i ++) {
		var newEm  = newemulatorBlock(topVal + '%',emulatorQueue[i]);
		if(i == 1) {
			newEm.style.height = '30%';
			newEm.style.width = '60%';
		};
		$(newEm).css('background-image', 'url(./Emulators/' + emulators[emulatorQueue[i]] + '/media.png)');
		topVal += 30;
	}
	//Let's goooooo
	allowAnimation = true;
});

//Reads in emulators/roms/all that jazz above - add in option to define Emulator files separately and DL them if they're not there
//Syncronous so it should be run before allowing the user to begin interacting
function reloadFiles() {
	emulators = fs.readdirSync('./Emulators');
	for(var i = 0; i < emulators.length; i ++) {
		emulators[i] = new String(emulators[i]);
		var roms = fs.readdirSync('./Emulators/' + emulators[i] + '/roms');
		emulators[i].roms = [];
		for(var j = 0; j < roms.length; j ++) {
			emulators[i].roms[j] = new String(roms[j]);
			emulators[i].roms[j].media = './Emulators/' + emulators[i] + '/roms/' + roms[j] + '/media.png';
			if(fs.existsSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.txt')) {
				var readIn = fs.readFileSync('./Emulators/' + emulators[i] + '/roms/' + roms[j] + '/metadata.txt', 'utf8');
				//Double verify - scraper will only get first 600 chars anyway
				emulators[i].roms[j].metadata = readIn.substring(0,600) + '...';
			} else {
				emulators[i].roms[j].metadata = 'Sorry, no description available for this game currently!';
			}
		};
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
	$(recent).css('background-image', 'url(./Emulators/' + emulators[id] + '/media.png)');
	console.log(emulators[id] + ' ' + id);
	recent.style.top = top;
	return recent;
}

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	};
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
		recentemulatorBlock = newemulatorBlock('-20%', emulatorQueue[0]);
		goal = '20%';
	} else {
		var shifted = emulatorQueue.shift();
		emulatorQueue.push(shifted);
		recentemulatorBlock = newemulatorBlock('120%', emulatorQueue[2]);
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
   };
};

function newromBlock(top, emulator, gameNumber) {
	var div = document.createElement('div');
	div.className = 'romBlock';

	var title = document.createElement('h1');
	title.innerHTML = emulator.roms[gameNumber];
	div.appendChild(title);

	var img = document.createElement('img');
	img.className = 'romMedia';
	$(img).attr("src", emulator.roms[gameNumber].media);
	div.appendChild(img);

	var metadata = document.createElement('p');
	metadata.innerHTML = emulator.roms[gameNumber].metadata;
	div.appendChild(metadata);

	var counter = document.createElement('h2');
	counter.innerHTML = '[' + String(gameNumber + 1) + '/' + String(emulator.roms.length) + ']';
	div.appendChild(counter);

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
		if(currentRom > emulators[emulatorQueue[1]].roms.length - 1) {
			currentRom = 0;
		};
		var newBlock = newromBlock('-85%',emulators[emulatorQueue[1]],currentRom);
		goal = '185%';
	} else if(arg == 'up') {
		currentRom --;
		if(currentRom < 0) {
			currentRom = emulators[emulatorQueue[1]].roms.length - 1;
		};
		var newBlock = newromBlock('185%',emulators[emulatorQueue[1]],currentRom);
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
		var newRom = newromBlock('-85%',emulators[emulatorQueue[1]], 0);
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
