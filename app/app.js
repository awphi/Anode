var path = require('path');
var fs = require('fs');

//Load up some intial variables
var emulators = [{}];
reloadFiles();

var high = 0;
var principle = 1;
var bottom = 2;
var allowAnimation = true;
var scroll = 'emulator';

//Wait till page has loaded by waiting for jQuery then render starting point
$(function() {
	document.getElementsByClassName('block')[1].style.height = '30%';
	document.getElementsByClassName('block')[1].style.width = '60%';
	var els = document.getElementsByClassName('block');
	for(var i = 0; i < els.length; i ++) {
		$(els[i]).css('background-image', 'url(./Emulators/' + emulators[i] + '/boxart.png)');
	};
});

//Reads in emulators/roms/all that jazz above
function reloadFiles() {
	emulators = [];
	fs.readdir('./Emulators', function(err,files) {
		if( err ) {
			console.log('Could not list directory ', err);
			process.exit(1);
		}
		files.forEach(function(file,index) {
			//So it ignores .DS_Store or any other files you want in there
			if(!(String(file).split('')[0] == '.')) {
				var current = emulators.push(new String(file)) - 1;
				fs.readdir('./Emulators/' + file + '/roms', function(errTwo,subFiles) {
					if(errTwo){
						console.log('Could not list directory ', err);
						process.exit(1);
					};
					emulators[current].roms = subFiles;
				});
			}
		});
	});
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

//Creates a new block at the top or bottom by giving it's 'top' style text
//	\-> Good values I found are -20% for top and 120% for bottom!
function newBlock(top) {
	var div = document.createElement('div');
	div.className = 'block';
	document.getElementById('body').appendChild(div);
	var els = document.getElementsByClassName('block');
	var recent = els[els.length - 1];
	$(recent).css('background-image', 'url(./Emulators/' + emulators[high] + '/boxart.png)');
	recent.style.top = top;
}

function scrollEmulator(arg) {
	if(!allowAnimation) {
		return;
	};
	allowAnimation = false;
	var principleCache = principle;
	var goal = '';
	if(arg == 'down') {
		principle = high;
		bottom = principleCache;

		high += 1;
		if(high > emulators.length - 1) {
			high = 0;
		};
		//Once we've got the new high,principle & bottom we can move the blocks
		newBlock('-20%');
		goal = '20%';
	} else {
		principle = bottom;
		high = principleCache;
		bottom -= 1;
		if(bottom < 0) {
			bottom = emulators.length - 1;
		};
		newBlock('120%');
		goal = '80%';
	}
	//Retrieving all the currently shown blocks and storing them in vars to animate
	var els = document.getElementsByClassName('block');
	var recentBlock = els[els.length - 1];
	var highBlock, principleBlock, bottomBlock;
	for(var i = 0; i < els.length; i ++) {
		if(els[i].style.top == '20%') {
			highBlock = els[i];
		} else if(els[i].style.top == '50%') {
			principleBlock = els[i];
		} else if(els[i].style.top == '80%') {
			bottomBlock = els[i];
		}
	}
	//This executes all the animations at once - iss beautiful
	//Clean this code up tho - iss not beautiful
	$(function () {
	    $(recentBlock).animate({
	       top: goal
	    }, { duration: 200, queue: false });

		if(arg == 'down') {
		    $(highBlock).animate({
		       top: '50%', width: '60%', height: '30%'
		    }, { duration: 200, queue: false });

			$(principleBlock).animate({
		       top: '80%', width: '30%', height: '15%'
		    }, { duration: 200, queue: false });

			$(bottomBlock).animate({
		       top: '120%'
		   }, { duration: 200, queue: false, done: function() {
			   $(bottomBlock).remove();
			   allowAnimation = true;
		   } });
		} else {
			$(highBlock).animate({
				top: '-20%'
		 	}, { duration: 200, queue: false, done: function() {
				$(highBlock).remove();
				allowAnimation = true;
			} });

			$(principleBlock).animate({
		       top: '20%', width: '30%', height: '15%'
		    }, { duration: 200, queue: false });

			$(bottomBlock).animate({
		       top: '50%', width: '60%', height: '30%'
		   }, { duration: 200, queue: false });
		}
	});
	console.log('Principle: ' + principle + ', Bottom: ' + bottom + ', High: ' + high);
};

function scrollRoms(arg) {

};

//Opens or closes the rom menu - arg is either 'open' or 'close'
function romsMenu(arg) {
	if(!allowAnimation) {
		return;
	};
	allowAnimation = false;
	var els = document.getElementsByClassName('block');
	var highBlock, principleBlock, bottomBlock;

	for(var i = 0; i < els.length; i ++) {
		if(els[i].style.top == '20%') {
			highBlock = els[i];
		} else if(els[i].style.top == '50%') {
			principleBlock = els[i];
		} else if(els[i].style.top == '80%') {
			bottomBlock = els[i];
		}
	}
	if(arg == 'open') {
		scroll = 'roms';
		//Move emulator menu to left
		$('.block').animate({
		   	left: '25%', width: '30%', height: '15%'
	   	}, { duration: 200, queue: false, done: function() {
		   	allowAnimation = true;
	   	} });

		//Bring in rom menu
   } else if (arg == 'close') {
	   scroll = 'emulator';
	   //Refocus emulator menu
	   $('.block').animate({
		  	left: '50%'
	  	}, { duration: 200, queue: false });
	   $(principleBlock).animate({
		  	left: '50%', width: '60%', height: '30%'
	  	}, { duration: 200, queue: false, done: function() {
		  	allowAnimation = true;
	  	} });

		//Move & destroy rom menus
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
