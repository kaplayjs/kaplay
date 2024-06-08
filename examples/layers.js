kaplay();

layers(["bg", "game", "ui"], "game");

// bg layer
add([
    rect(width(), height()),
    layer("bg"),
    color(rgb(64, 128, 255)),
    // opacity(0.5)
]).add([text("BG")]);

// game layer explicit
add([
    pos(width() / 5, height() / 5),
    rect(width() / 3, height() / 3),
    layer("game"),
    color(rgb(255, 128, 64)),
]).add([text("GAME")]);

// game layer implicit
add([
    pos(3 * width() / 5, 3 * height() / 5),
    rect(width() / 3, height() / 3),
    color(rgb(255, 128, 64)),
]).add([pos(width() / 3, height() / 3), text("GAME"), anchor("botright")]);

// ui layer
add([
    pos(center()),
    rect(width() / 2, height() / 2),
    anchor("center"),
    color(rgb(64, 255, 128)),
]).add([text("UI"), anchor("center")]);
