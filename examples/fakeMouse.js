/**
 * @file Fake Mouse
 * @description How to create a fake mouse in-game
 * @difficulty 0
 * @tags ui, input
 * @minver 4000.0
 * @category concepts
 */

kaplay({
    background: "4a3052",
});

loadBean();
loadSprite("door", "/sprites/door.png");
loadSprite("cursor", "/sprites/cursor_default.png");
loadSprite("grab", "/sprites/grab.png");
loadSound("knock", "/sounds/knock.ogg");

const MOUSE_VEL = 200;
const MAX_KNOCKS = 10;
let knocks = 0;
let doorOpened = false;

// Set the layers, the cursor will be on top of everything, "ui"
setLayers([
    "game",
    "ui",
], "game");

// We create the object that will emulate the OS mouse
const cursor = add([
    sprite("cursor"),
    pos(),
    layer("ui"),
    scale(2),
    // The fakeMouse() component will make it movable with a real mouse
    fakeMouse(),
]);

setCursor("none"); // Hide the real mouse

// Mouse press and release with keyboard, this will trigger mouse proper
// events like .onClick, .onHover, etc
cursor.onKeyPress("space", () => {
    cursor.press();
});

cursor.onKeyRelease("space", () => {
    cursor.release();
});

// Mouse movement with the keyboard
cursor.onKeyDown("left", () => {
    cursor.move(-MOUSE_VEL, 0);
});

cursor.onKeyDown("right", () => {
    cursor.move(MOUSE_VEL, 0);
});

cursor.onKeyDown("up", () => {
    cursor.move(0, -MOUSE_VEL);
});

cursor.onKeyDown("down", () => {
    cursor.move(0, MOUSE_VEL);
});

// You can scroll with the keyboard
cursor.onKeyDown("w", () => {
    cursor.scrollBy(vec2(0, 10));
});

cursor.onKeyDown("s", () => {
    cursor.scrollBy(vec2(0, -10));
});

// Example with hovering and click
const door = add([
    sprite("door"),
    pos(center()),
    anchor("center"),
    area(),
    scale(2),
]);

// Trigered thanks to cursor.press(), you can trigger it with a real mouse or
// with the keyboard
door.onClick(() => {
    if (knocks > MAX_KNOCKS) {
        openDoor();
    }
    else {
        knocks++;
        play("knock");
    }
});

door.onHover(() => {
    cursor.sprite = "grab";
});

door.onHoverEnd(() => {
    cursor.sprite = "cursor";
});

// Triggered thanks to cursor.scrollBy()
// Only gets called once per call
door.onScroll((delta) => {
    door.pos.y += delta.y;
});

// Open the door, a friend appears
function openDoor() {
    if (doorOpened) return;
    doorOpened = true;

    door.hidden = true;

    add([
        sprite("bean"),
        scale(2),
        pos(door.pos),
        anchor("center"),
    ]);

    burp();

    debug.log("What happened?");
}
