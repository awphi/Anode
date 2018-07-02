const http = require("http");
const app = require("electron");

const platformDict = {};
const processQueue = [];
var current = 0;

function getGameProperty(result, prop, placeholder = "???") {
    var prop = result.getElementsByTagName(prop)[0];
    return prop == null ? placeholder : prop.innerHTML;
}

function gamesDBSearch(term) {
    clearTable();
    singleRowText("Loading...");
    document.getElementById("scrape-title").innerHTML = "<b>Scrape results for:</b> " + processQueue[current].fullfilename;

    var request = $.ajax({
        url: "http://legacy.thegamesdb.net/api/GetGamesList.php?name=" + term
    });

    request.done(function(result) {
        var results = result.getElementsByTagName("Game");
        var ret = [];
        for(var i = 0; i < results.length; i ++) {
            var id = getGameProperty(results[i], "id");
            var title = getGameProperty(results[i], "GameTitle");
            var release = getGameProperty(results[i], "ReleaseDate");
            var platform = getGameProperty(results[i], "Platform");

            ret.push({id: id, title: title, release: release, platform: platform});
        }
        loadResultsToTable(ret, current);
    });
}

function gamesDBFetchGame(id, procObj) {
    var request = $.ajax({
        url: "http://legacy.thegamesdb.net/api/GetGame.php?id=" + id
    });
    request.done(function (result) {
        //To be used as folder name
        const title = result.getElementsByTagName("GameTitle")[0].innerHTML;

        //To determine emu folder - compares against dict created on load by looking at emu configs
        //make sure to handle nulls
        const plat = getPlatformDir(result.getElementsByTagName("PlatformId")[0].innerHTML);
        if (plat == null) {
            alert("Invalid platform chosen on " + title + ", please reopen this panel and try again!");
            return;
        }

        const dir = plat + "/roms/" + title.replace(/[^a-zA-Z0-9-_\.]/g, '');;

        //-- Create dir --
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, null,true);
        }

        //-- Metadata.json --
        createMetadataFile(result, dir);

        //-- Download boxart --
        const imgUrl = String(result.getElementsByTagName("baseImgUrl")[0].innerHTML) + String($(result).find("boxart[side='front']").text());
        var file = fs.createWriteStream(dir + "/media.png");
        http.get(imgUrl, function(response) {
            response.pipe(file);
        });

        //-- Copy rom file over, rename it and delete this one! --
        fs.createReadStream(procObj.path).pipe(fs.createWriteStream(dir + "/rom." + procObj.fullfilename.split(".")[1]));
        fs.unlink(procObj.path);
    });
}

function createMetadataFile(result, dir) {
    const description = getGameProperty(result, "Overview", "No description available...");
    const developer = getGameProperty(result, "Developer");
    const release = getGameProperty(result, "ReleaseDate");
    const players = getGameProperty(result, "Players");
    const title = getGameProperty(result, "GameTitle")

    var genres = "Unkown";

    if(result.getElementsByTagName("Genres")[0] != null) {
        genres = result.getElementsByTagName("Genres")[0].childNodes[0].innerHTML;

        for(var i = 1; i < result.getElementsByTagName("Genres")[0].childNodes.length; i ++) {
            genres = genres + ", " + result.getElementsByTagName("Genres")[0].childNodes[i].innerHTML;
        }
    }

    const data = JSON.stringify({title: title, description: description, developer: developer, release: release, players: players, genres: genres});

    fs.writeFile(dir + "/metadata.json", data, (err) => {
        if (err) throw err;
    });
}

function getPlatformDir(id) {
    if(Object.keys(platformDict).length == 0) {
        var emulators = fs.readdirSync(Files.emulatorsLocation);
        for(var i = 0; i < emulators.length; i ++) {
            const obj = JSON.parse(fs.readFileSync(Files.emulatorsLocation + "/" + emulators[i] + "/config.json"));
            platformDict["" + obj.platformId] = Files.emulatorsLocation + "/" + emulators[i];
        }
    }
    return platformDict["" + id];
}

//Loads the process queue & sets up the first entry in the table
function processRoms() {
    if(!fs.existsSync(Files.emulatorsLocation + "/in")) {
        fs.mkdirSync(Files.emulatorsLocation + "/in");
    }

    if(!isDirEmpty(Files.emulatorsLocation + "/in")) {
        var roms = fs.readdirSync(Files.emulatorsLocation + "/in");
        for(var i = 0; i < roms.length; i ++) {
            var filename = roms[i].split(".")[0];
            processQueue.push({filename: filename, path: Files.emulatorsLocation + "/in/" + roms[i], fullfilename: roms[i]});
        }
        current = 0;
        gamesDBSearch(processQueue[current].filename);
    } else {
        alert("New roms directory is empty!");
        document.getElementsByClassName("table-container")[0].hidden = true;
    }
}

function confirmChoice(skip) {
    if(!skip && $("input[name=optradio]:checked").length == 0) {
        return;
    }

    if(!skip) {
        const id = $("input[name=optradio]:checked")[0].parentElement.parentElement.childNodes[0].innerHTML;
        gamesDBFetchGame(id,processQueue[current]);
    }

    current++;

    if(current == processQueue.length) {
        //End of queue reached
        document.getElementsByClassName("table-container")[0].hidden = true;
        alert("All done!");
        return;
    }

    gamesDBSearch(processQueue[current].filename);
    window.scrollTo(0, 0);
}

function loadResultsToTable(results, number) {
    if((number >= 0 || number < processQueue.length) && processQueue.length > 0) {
        const table = document.getElementById("table-body");
        clearTable();

        //Deal with no results found
        if(results.length == 0) {
            singleRowText("No results found!");
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
            cell.innerHTML = "<input type='radio' name='optradio' onclick='window.scrollTo(0, document.body.scrollHeight);'>";
        }
    }
}

function singleRowText(str) {
    const table = document.getElementById("table-body");
    const row = table.insertRow(table.rows.length);

    for(var i = 0; i < 5; i ++) {
        cell = row.insertCell(i);
        cell.innerHTML = str;
    }
}

function clearTable() {
    const table = document.getElementById("table-body");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
}

function isDirEmpty(dir) {
    var files = fs.readdirSync(dir);
    return !files.length;
}

app.remote.getCurrentWindow().setAlwaysOnTop(false);
Files.reloadConfig(true);
processRoms();
