const Config = require("electron-config");
const dialog = require("electron").remote.dialog;

const config = new Config();

function updateCoreSettings() {
    config.set("dev", $("#devMode").prop("checked"));
    config.set("emulatorsLocation", $("#emulatorPack").prop("selected"));

    alert("Settings updated! Press F3 to return to the game screen.");
}

function selectDirectory(id) {
    dialog.showOpenDialog({
        properties: ["openDirectory"]
    }, function(f) {
        const $id = $("#" + id);
        if($id != null) {
            const str = f.toString().replace(/\\/g, "/");
            console.log(str);
            $id.prop("selected", str);
            $("#emulatorPackText").text(str);
        }
    });
}

$("#emulatorPack").prop("selected", config.get("emulatorsLocation"));
$("#emulatorPackText").text(config.get("emulatorsLocation"));
$("#devMode").prop("checked", config.get("dev"));