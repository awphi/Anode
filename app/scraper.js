const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

var processQueue = [];
var current = 0;

function searchGamesDB(term) {
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
			processQueue.push({filename:filename, path:__dirname + '\\' + roms[i]});
		}
		current = 0;
		searchGamesDB(processQueue[current].filename);
	} else {
		alert('New roms directory is empty!');
	}
}

function confirmChoice(skip) {
	if(!skip && $('input[name=optradio]:checked').length == 0) {
		return;
	}
	if(current == processQueue.length - 1) {
		//End of queue reached
		document.getElementById('results').hidden = true;
	} else {
		if(!skip) {
			//Make API req w/ ID of chosen game then make, copy, delete and rename all nec. files to the right places
		}
		current++;
		searchGamesDB(processQueue[current].filename);
	}
}

function loadResultsToTable(results, number) {
	if(number >= 0 || number < processQueue.length) {
		document.getElementById('scrapeTitle').innerHTMl = 'Scrape results for: ' + processQueue[number].filename;
		if(results.length == 0) {
			//Handle no results
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
