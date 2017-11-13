const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

var platformDict;
var processQueue = [];
var current = 0;

function gamesDBSearch(term) {
	var ret = [];
	$.ajax({
		url: 'http://thegamesdb.net/api/GetGamesList.php?name=' + term,
		success: function (result) {
			var results = result.getElementsByTagName('Game');
			for(var i = 0; i < results.length; i ++) {
				ret.push({id:results[i].getElementsByTagName('id')[0].innerHTML, title:results[i].getElementsByTagName('GameTitle')[0].innerHTML, release:results[i].getElementsByTagName('ReleaseDate')[0].innerHTML, platform:results[i].getElementsByTagName('Platform')[0].innerHTML});
			}
			loadResultsToTable(ret, current);
		}
	});
}

//TODO: Split this into at least 2 functions
function gamesDBFetchGame(id, procObj) {
	$.ajax({
		url: 'http://thegamesdb.net/api/GetGame.php?id=' + id,
		success: function (result) {
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

			//-- Download boxart --

			//-- Copy rom file over, rename it and delete this one! --
			fs.createReadStream(procObj.path).pipe(fs.createWriteStream(dir + '/rom.' + procObj.fullfilename.split('.')[1]));
			fs.unlink(procObj.path);
		}
	});
}

//TODO: Deal with nulls & edge cases
function getPlatformDir(id) {
	if(platformDict == null) {
		platformDict = {}
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
			//Do stuff with filename i.e. remove punctuation & stuff
			processQueue.push({filename:filename, path:'./in/' + roms[i], fullfilename:roms[i]});
		}
		current = 0;
		gamesDBSearch(processQueue[current].filename);
	} else {
		alert('New roms directory is empty!');
	}
}

function confirmChoice(skip) {
	console.log($('input[name=optradio]:checked').length + ' ' + skip);
	if(!skip && $('input[name=optradio]:checked').length == 0) {
		return;
	}
	if(!skip) {
		const id = $('input[name=optradio]:checked')[0].parentElement.parentElement.childNodes[0].innerHTML;
		gamesDBFetchGame(id,processQueue[current]);
		//Make API req w/ ID of chosen game then make, copy, delete and rename all nec. files to the right places
	}
	current++;
	if(current == processQueue.length) {
		//End of queue reached
		document.getElementById('results').hidden = true;
		return;
	}
	gamesDBSearch(processQueue[current].filename);
}

function loadResultsToTable(results, number) {
	if(number >= 0 || number < processQueue.length) {
		document.getElementById('scrapeTitle').innerHTML = 'Scrape results for: ' + processQueue[number].fullfilename;
		if(results.length == 0) {
			var row = table.insertRow(table.rows.length);
			for(var i = 0; i < 5; i ++) {
				cell = row.insertCell(i);
				cell.innerHTML = 'No results found!';
			}
		} else {
			const table = document.getElementById('tableBody');
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
}

function isDirEmpty(dir) {
	var files = fs.readdirSync(dir);
	return !files.length;
}

processRoms();
