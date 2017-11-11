//Creates a new emulatorBlock at the top or bottom by giving it's 'top' style text
//	\-> Good values I found are -20% for top and 120% for bottom!
function newEmulatorBlock(top, id) {
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

function newRomBlock(top, emulator, gameNumber) {
	var div = document.createElement('div');
	div.className = 'romBlock';

	var title = document.createElement('h1');
	title.innerHTML = emulator.roms[gameNumber];
	div.appendChild(title);

	var img = document.createElement('img');
	img.className = 'romMedia';
	$(img).attr('src', emulator.roms[gameNumber].media);
	div.appendChild(img);

	var metadata = document.createElement('p');
	metadata.innerHTML = emulator.roms[gameNumber].metadata;
	div.appendChild(metadata);

	var counter = document.createElement('h2');
	counter.innerHTML = '[' + String(gameNumber + 1) + '/' + String(emulator.roms.length) + ']';
	div.appendChild(counter);

	div.style.top = top;
	document.getElementById('body').appendChild(div);
	var els = document.getElementsByClassName('romBlock');
	return els[els.length - 1];
}
