const Blocks = {
    core: {}
}

Blocks.core.applyStyle = function(div, style) {
    if(typeof(style) !== "object") {
        return div;
    }

    for (var property in style) {
        if (style.hasOwnProperty(property)) {
            var str = '' + property;
            div.style[str] = style[str];
        }
    }

    return div;
}

//Creates a new emulator description block at the top or bottom by giving it"s "top" style text
Blocks.newEmulatorBlock = function(top, gameConsole) {
    var div = document.createElement("div");
    div.className = "emulatorBlock";
    $(div).css("background-image", "url(" + Files.emulatorsLocation + "/" + gameConsole + "/media.png)");
    div.style.top = top;
    document.getElementById("body").appendChild(div);
    return div;
}

Blocks.newRomBlock = function(style, emulator, gameNumber) {
    const wrapper = Blocks.core.applyStyle(document.createElement("div"), style);
    wrapper.className = "romBlockWrapper";

    const div = document.createElement("div");
    div.className = "romBlock";

    const title = document.createElement("h1");
    title.innerHTML = emulator.roms[gameNumber];
    div.appendChild(title);

    const subtitle = document.createElement("h1");
    $(subtitle).css("color","rgba(0,0,0,0.5)");
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
    counter.innerHTML = String(gameNumber + 1) + "/" + String(emulator.roms.length);
    div.appendChild(counter);

    wrapper.appendChild(div);

    $("body").append(wrapper);
    return wrapper;
}

Blocks.core.newRomBox = function(emulator, gameNumber) {
    const div = document.createElement("div");
    div.className = "romBox";
    div.setAttribute("index", gameNumber);

    if(emulator == null) {
        $(div).css("visibility", "hidden");
    } else {
        // Apostrephes are not escaped properly in encodeURI so I added this to do it manually.
        var str = encodeURI(emulator.roms[gameNumber].media).replace("'", "%27");
        div.style.backgroundImage = "url(" + str + ")";
    }

    return div;
}

// Generates a new rom box container with the first 6 roms
Blocks.newRomBoxContainer = function(style, emulator, start) {
    const div = Blocks.core.applyStyle(document.createElement("div"), style);
    div.className = "romBoxContainer";
    for(var i = start; i < start + 6; i ++) {
        if(i < emulator.roms.length) {
            div.appendChild(Blocks.core.newRomBox(emulator, i));
        } else {
            div.appendChild(Blocks.core.newRomBox(null, i));
        }
    }

    $("body").append(div);
    return div;
}