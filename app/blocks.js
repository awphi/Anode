const Blocks = {
    core: {}
}

Blocks.core.createClassedElement = function(clazz, element = "div") {
    var div = document.createElement(element);
    div.className = clazz;
    return div;
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
    var div = Blocks.core.createClassedElement("emulator-block");
    $(div).css("background-image", "url(" + Files.emulatorsLocation + "/" + gameConsole + "/media.png)");
    div.style.top = top;
    $("#body").append(div);
    return div;
}

Blocks.newRomPreview = function(style, emulator, gameNumber) {
    const wrapper = Blocks.core.applyStyle(Blocks.core.createClassedElement("rom-preview-wrapper"), style);

    const div = Blocks.core.createClassedElement("rom-preview");

    var meta;
    if(emulator.roms[gameNumber].metadata != null) {
        meta = JSON.parse(fs.readFileSync(emulator.roms[gameNumber].metadata));
    } else {
        meta = {description:"No description available...", developer:"???", release:"???", players:"???", genres:"???", title:"???"}
    }

    const title = document.createElement("h1");
    title.innerHTML = meta.title;
    div.appendChild(title);

    const subtitle = document.createElement("h1");
    $(subtitle).css("color","rgba(0,0,0,0.5)");
    subtitle.innerHTML = meta.developer + " - " + emulator;
    div.appendChild(subtitle);

    if(emulator.roms[gameNumber].media != null) {
        const img = Blocks.core.createClassedElement("rom-media", "img");
        $(img).attr("src", emulator.roms[gameNumber].media);
        div.appendChild(img);
    }

    const prop = document.createElement("p");
    prop.innerHTML = "<b>Players:</b> " + meta.players + "<br><b>Release:</b> " + meta.release + "<br><b>Genres:</b> " + meta.genres;
    div.appendChild(prop);

    const metadata = document.createElement("p");
    metadata.innerHTML = meta.description.substring(0,240) + "...";
    div.appendChild(metadata);

    const counter = Blocks.core.createClassedElement("romCounter", "h2");
    counter.innerHTML = String(gameNumber + 1) + "/" + String(emulator.roms.length);
    div.appendChild(counter);

    wrapper.appendChild(div);

    $("#body").append(wrapper);
    return wrapper;
}

Blocks.newRomBox = function(emulator, gameNumber) {
    const div = Blocks.core.createClassedElement("rom-box flex-center");
    div.setAttribute("index", gameNumber);

    if(emulator == null) {
        $(div).css("visibility", "hidden");
    } else {
        if(emulator.roms[gameNumber].media != null) {
            // Apostrephes are not escaped properly in encodeURI so I added this to do it manually.
            var str = encodeURI(emulator.roms[gameNumber].media).replace("'", "%27");
            div.style.backgroundImage = "url(" + str + ")";
        } else {
            var h2 = document.createElement("h2");
            h2.innerHTML = emulator.roms[gameNumber].metadata  == null ? "???" : JSON.parse(fs.readFileSync(emulator.roms[gameNumber].metadata)).title;
            $(div).append(h2);
        }
    }

    return div;
}

// Generates a new rom box container with the first 6 roms
Blocks.newRomBoxContainer = function(style, emulator, start) {
    const wrapper = Blocks.core.applyStyle(Blocks.core.createClassedElement("rom-box-container-wrapper"), style);
    const div = Blocks.core.createClassedElement("rom-box-container");

    for(var i = start; i < start + 6; i ++) {
        if(i < emulator.roms.length) {
            div.appendChild(Blocks.newRomBox(emulator, i));
        } else {
            div.appendChild(Blocks.newRomBox(null, i));
        }
    }

    // TODO check if arrows are needed on each side then adjust vis as needed
    const arrow1 = Blocks.core.createClassedElement("arrow-wrapper");
    const img = Blocks.core.createClassedElement("arrow", "img");
    img.src = "./app/images/arrow.svg";
    arrow1.appendChild(img);

    const arrow2 = arrow1.cloneNode(true);
    arrow1.childNodes[0].style.transform = "translate(-50%, -50%) rotate(180deg)";

    arrow1.style.visibility = start > 0 ? '' : 'hidden';
    arrow2.style.visibility = start + 6 < emulator.roms.length ? '' : 'hidden';

    wrapper.appendChild(arrow1);
    wrapper.appendChild(div);
    wrapper.appendChild(arrow2);

    $("#body").append(wrapper);
    return wrapper;
}