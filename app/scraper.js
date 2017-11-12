function searchGamesDB(term) {
	var ret = [];
	$.ajax({
		url: 'http://thegamesdb.net/api/GetGamesList.php?name=' + term,
		async: false,
		success: function (result) {
			var results = result.getElementsByTagName('Game');
			for(var i = 0; i < results.length; i ++) {
				ret.push({id:results[i].getElementsByTagName('id')[0].innerHTML, title:results[i].getElementsByTagName('GameTitle')[0].innerHTML, release:results[i].getElementsByTagName('ReleaseDate')[0].innerHTML, platform:results[i].getElementsByTagName('Platform')[0].innerHTML});
			}
		}
	});
	return ret;
}
