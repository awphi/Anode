const Config = require("electron-config");
const dialog = require("electron").remote.dialog;

const config = new Config();

function updateCoreSettings() {
    config.set("dev", true);
    console.log($("input"));
}

function selectDirectory() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function(f) {
        console.log(f.toString());
    });
}