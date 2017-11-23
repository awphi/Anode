const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');

const platformDict = {};
const processQueue = [];
var current = 0;

function gamesDBSearch(term) {
	var request = $.ajax({
		url: 'http://thegamesdb.net/api/GetGamesList.php?name=' + term
	});

	request.done(function(result) {
		var results = result.getElementsByTagName('Game');
		var ret = [];
		for(var i = 0; i < results.length; i ++) {
			ret.push({id:results[i].getElementsByTagName('id')[0].innerHTML, title:results[i].getElementsByTagName('GameTitle')[0].innerHTML, release:results[i].getElementsByTagName('ReleaseDate')[0].innerHTML, platform:results[i].getElementsByTagName('Platform')[0].innerHTML});
		}
		loadResultsToTable(ret, current);
	});
}

function gamesDBFetchGame(id, procObj) {
	var request = $.ajax({
		url: 'http://thegamesdb.net/api/GetGame.php?id=' + id
	});
	request.done(function (result) {
		//To be used as folder name
		const title = result.getElementsByTagName('GameTitle')[0].innerHTML;

		//To determine emu folder - compares against dict created on load by looking at emu configs
		//make sure to handle nulls
		const plat = getPlatformDir(result.getElementsByTagName('PlatformId')[0].innerHTML);
		if (plat == null) {
			alert('Invalid platform chosen on ' + title + ', please reopen this panel and try again!');
			return;
		}

		const dir = plat + '/roms/' + title;

		//-- Create dir --
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir,null,true);
		}

		//-- Metadata.yml --
		createMetadataFile(result, dir);

		//-- Download boxart --
		const imgUrl = String(result.getElementsByTagName('baseImgUrl')[0].innerHTML) + String($(result).find('boxart[side="front"]').text());
		var file = fs.createWriteStream(dir + "/media.png");
		http.get(imgUrl, function(response) {
			  response.pipe(file);
		});

		//-- Copy rom file over, rename it and delete this one! --
		fs.createReadStream(procObj.path).pipe(fs.createWriteStream(dir + '/rom.' + procObj.fullfilename.split('.')[1]));
		fs.unlink(procObj.path);
	});
}

function createMetadataFile(result, dir) {
	const description = result.getElementsByTagName('Overview')[0].innerHTML;
	const developer = result.getElementsByTagName('Developer')[0].innerHTML;
	const release = result.getElementsByTagName('ReleaseDate')[0].innerHTML;
	const players = result.getElementsByTagName('Players')[0].innerHTML;
	var genres = result.getElementsByTagName('Genres')[0].childNodes[0].innerHTML;
	for(var i = 1; i < result.getElementsByTagName('Genres')[0].childNodes.length; i ++) {
		genres = genres + ', ' + result.getElementsByTagName('Genres')[0].childNodes[i].innerHTML;
	}
	const data = yaml.safeDump({description:description,developer:developer,release:release,players:players,genres:genres});
	fs.writeFile(dir + '/metadata.yml', data, (err) => {
		if (err) throw err;
	});
}

function getPlatformDir(id) {
	if(Object.keys(platformDict).length == 0) {
		var emulators = fs.readdirSync('./Emulators');
		for(var i = 0; i < emulators.length; i ++) {
			platformDict[String(yaml.safeLoad(fs.readFileSync('./Emulators/' + emulators[i] + '/config.yml','utf-8')).platformId)] = './Emulators/' + emulators[i];
		}
	}
	return platformDict[String(id)];
}

//Loads the process queue & sets up the first entry in the table
function processRoms() {
	if(!fs.existsSync('./in')) {
		fs.mkdirSync('./in');
	}

	if(!isDirEmpty('./in')) {
		var roms = fs.readdirSync('./in');
		for(var i = 0; i < roms.length; i ++) {
			var filename = roms[i].split('.')[0];
			processQueue.push({filename:filename, path:'./in/' + roms[i], fullfilename:roms[i]});
		}
		current = 0;
		gamesDBSearch(processQueue[current].filename);
	} else {
		alert('New roms directory is empty!');
		document.getElementsByClassName('tableContainer')[0].hidden = true;
	}
}

function confirmChoice(skip) {
	if(!skip && $('input[name=optradio]:checked').length == 0) {
		return;
	}
	if(!skip) {
		const id = $('input[name=optradio]:checked')[0].parentElement.parentElement.childNodes[0].innerHTML;
		gamesDBFetchGame(id,processQueue[current]);
	}
	current++;
	if(current == processQueue.length) {
		//End of queue reached
		document.getElementsByClassName('tableContainer')[0].hidden = true;
		alert('All done!');
		return;
	}
	gamesDBSearch(processQueue[current].filename);
}

function loadResultsToTable(results, number) {
	if((number >= 0 || number < processQueue.length) && processQueue.length > 0) {
		document.getElementById('scrapeTitle').innerHTML = 'Scrape results for: ' + processQueue[number].fullfilename;

		//Clear old values
		const table = document.getElementById('tableBody');
		while (table.firstChild) {
			table.removeChild(table.firstChild);
		}

		//Deal with no results found
		if(results.length == 0) {
			var row = table.insertRow(table.rows.length);
			for(var i = 0; i < 5; i ++) {
				cell = row.insertCell(i);
				cell.innerHTML = 'No results found!';
			}
			return;
		}

		//Fill in the table with the found results
		var row, cell;
		for(var i = 0; i < results.length; i ++) {
			row = table.insertRow(table.rows.length);
			cell = row.insertCell(0);
			cell.innerHTML = results[i].id;
			cell = row.insertCell(1);
			cell.innerHTML = results[i].title;
			cell = row.insertCell(2);
			cell.innerHTML = results[i].release;
			cell = row.insertCell(3);
			cell.innerHTML = results[i].platform;
			cell = row.insertCell(4);
			cell.innerHTML = '<input type="radio" name="optradio">';
		}
	}
}

function isDirEmpty(dir) {
	var files = fs.readdirSync(dir);
	return !files.length;
}

processRoms();
