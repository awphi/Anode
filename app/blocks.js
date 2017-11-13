//Creates a new emulatorBlock at the top or bottom by giving it's 'top' style text
//	\-> Good values I found are -20% for top and 120% for bottom
function newEmulatorBlock(top, id) {
	var div = document.createElement('div');
	div.className = 'emulatorBlock';
	$(div).css('background-image', 'url(./Emulators/' + emulators[id] + '/media.png)');
	div.style.top = top;
	document.getElementById('body').appendChild(div);
	return div;
}

// TODO: Clean this up w/ jQuery asap
function newRomBlock(top, emulator, gameNumber) {
	var div = document.createElement('div');
	div.className = 'romBlock';

	var title = document.createElement('h1');
	title.innerHTML = emulator.roms[gameNumber];
	div.appendChild(title);

	var subtitle = document.createElement('h1');
	$(subtitle).css('color','rgba(0,0,0,0.5)');
	$(subtitle).css('font-size','14pt');
	subtitle.innerHTML = emulator.roms[gameNumber].metadata.developer + ' - ' + emulator;
	div.appendChild(subtitle);

	var img = document.createElement('img');
	img.className = 'romMedia';
	$(img).attr('src', emulator.roms[gameNumber].media);
	div.appendChild(img);

	var prop = document.createElement('p');
	prop.innerHTML = '<b>Players:</b> ' + emulator.roms[gameNumber].metadata.players + '<br><b>Release:</b> ' + emulator.roms[gameNumber].metadata.release + '<br><b>Genres:</b> ' + emulator.roms[gameNumber].metadata.genres;;
	div.appendChild(prop);

	var metadata = document.createElement('p');
	metadata.innerHTML = emulator.roms[gameNumber].metadata.description;
	div.appendChild(metadata);

	var counter = document.createElement('h2');
	counter.className = 'romCounter';
	counter.innerHTML = '[' + String(gameNumber + 1) + '/' + String(emulator.roms.length) + ']';
	div.appendChild(counter);

	div.style.top = top;
	document.getElementById('body').appendChild(div);
	return div;
}

function capitaliseFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
