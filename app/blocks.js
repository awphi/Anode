const Blocks = {};

//Creates a new emulatorBlock at the top or bottom by giving it"s "top" style text
//	\-> Good values I found are -20% for top and 120% for bottom
Blocks.newEmulatorBlock = function(top, id) {
	var div = document.createElement("div");
	div.className = "emulatorBlock";
	$(div).css("background-image", "url(./Emulators/" + emulators[id] + "/media.png)");
	div.style.top = top;
	document.getElementById("body").appendChild(div);
	return div;
}

// TODO: Clean this up w/ jQuery asap
Blocks.newRomBlock = function(top, emulator, gameNumber) {
	const div = document.createElement("div");
	div.className = "romBlock";
	div.style.top = top;
	const title = document.createElement("h1");

	if(emulator.roms[gameNumber] == null) {
		title.innerHTML = "No games available for " + emulator;
		$(title).css("margin","auto");
		$(title).css("padding","5%");
		div.appendChild(title);
		document.getElementById("body").appendChild(div);
		return div;
	}

	title.innerHTML = emulator.roms[gameNumber];
	div.appendChild(title);

	const subtitle = document.createElement("h1");
	$(subtitle).css("color","rgba(0,0,0,0.5)");
	$(subtitle).css("font-size","1.6vw");
	subtitle.innerHTML = emulator.roms[gameNumber].metadata.developer + " - " + emulator;
	div.appendChild(subtitle);

	const img = document.createElement("img");
	img.className = "romMedia";
	$(img).attr("src", emulator.roms[gameNumber].media);
	div.appendChild(img);

	const prop = document.createElement("p");
	prop.innerHTML = "<b>Players:</b> " + emulator.roms[gameNumber].metadata.players + "<br><b>Release:</b> " + emulator.roms[gameNumber].metadata.release + "<br><b>Genres:</b> " + emulator.roms[gameNumber].metadata.genres;;
	div.appendChild(prop);

	const metadata = document.createElement("p");
	metadata.innerHTML = emulator.roms[gameNumber].metadata.description.substring(0,240) + "...";
	div.appendChild(metadata);

	const counter = document.createElement("h2");
	counter.className = "romCounter";
	counter.innerHTML = "[" + String(gameNumber + 1) + "/" + String(emulator.roms.length) + "]";
	div.appendChild(counter);

	document.getElementById("body").appendChild(div);
	return div;
}

function capitaliseFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
