var path = require('path');
var fs = require('fs');

var emulators = [];
emulators.roms = [];

reloadFiles();
var high = 0;
var principle = 1;
var bottom = 2;

//Renders the principle as larger on start - from then on it's animated in scrollEmulator();
$(function() {
	document.getElementsByClassName('block')[1].style.height = "30%";
	document.getElementsByClassName('block')[1].style.width = "60%";
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

//Creates a new block at the top or bottom by giving it's "top" style text
//	\-> Good values I found are -20% for top and 120% for bottom!
function newBlock(top) {
	var div = document.createElement("div");
	div.className = "block";
	document.getElementById('body').appendChild(div);
	var els = document.getElementsByClassName('block');
	var recent = els[els.length - 1];
	recent.style.top = top;
}

function scrollEmulator(arg) {
	var principleCache = principle;
	var goal = "";
	if(arg == "down") {
		principle = high;
		bottom = principleCache;

		high += 1;
		if(high > emulators.length - 1) {
			high = 0;
		};
		//Once we've got the new high,principle & bottom we can move the blocks
		newBlock("-20%");
		goal = "20%";
	} else {
		principle = bottom;
		high = principleCache;
		bottom -= 1;
		if(bottom < 0) {
			bottom = emulators.length - 1;
		};
		newBlock("120%");
		goal = "80%";
	}
	//Retrieving all the currently shown blocks and storing them in vars to animate
	var els = document.getElementsByClassName('block');
	var recentBlock = els[els.length - 1];
	var highBlock, principleBlock, bottomBlock;
	for(var i = 0; i < els.length; i ++) {
		if(els[i].style.top == "20%") {
			highBlock = els[i];
		} else if(els[i].style.top == "50%") {
			principleBlock = els[i];
		} else if(els[i].style.top == "80%") {
			bottomBlock = els[i];
		}
	}
	//This executes all the animations at once - iss beautiful
	//Clean this code up tho - iss not beautiful
	$(function () {
	    $(recentBlock).animate({
	       top: goal
	    }, { duration: 200, queue: false });

		if(arg == "down") {
		    $(highBlock).animate({
		       top: '50%', width: '60%', height: '30%'
		    }, { duration: 200, queue: false });

			$(principleBlock).animate({
		       top: '80%', width: '30%', height: '15%'
		    }, { duration: 200, queue: false });

			$(bottomBlock).animate({
		       top: '120%'
		   }, { duration: 200, queue: false });
		} else {
			$(highBlock).animate({
				top: '-20%'
		 	}, { duration: 200, queue: false });

			$(principleBlock).animate({
		       top: '20%', width: '30%', height: '15%'
		    }, { duration: 200, queue: false });

			$(bottomBlock).animate({
		       top: '50%', width: '60%', height: '30%'
		   }, { duration: 200, queue: false });
		}
	});
	console.log("Principle: " + principle + ", Bottom: " + bottom + ", High: " + high);
	//Collect garbage (blocks with 120 or -20 top values)
};

//Reads in emulators/roms/all that jazz above
function reloadFiles() {
	emulators = [];
	fs.readdir("./Emulators", function( err, files ) {
		if( err ) {
			alert("Could list directory ", err);
			process.exit(1);
		}
		files.forEach(function(file,index) {
			//So it ignores .DS_Store or any other files you want in there
			if(!(String(file).split("")[0] == ".")) {
				emulators.push(file);
			}
		});
	});
};

window.onkeyup = function(e) {
	var code = e.keyCode ? e.keyCode : e.which;
	if(code == 38) {
		scrollEmulator("up");
	} else if (code == 40) {
		scrollEmulator("down");
	}
};
