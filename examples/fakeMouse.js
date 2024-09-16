// @ts-check

kaplay();

loadSprite("bean", "/sprites/bean.png");
loadSprite("cursor", "/sprites/cursor_default.png");

// set the layers
layers([
    "game",
    "ui",
], "game");

const MOUSE_VEL = 200;

const cursor = add([
    sprite("cursor"),
    fakeMouse(),
    pos(),
    layer("ui"),
]);

// Mouse press and release
cursor.onKeyPress("f", () => {
    cursor.press();
});

cursor.onKeyRelease("f", () => {
    cursor.release();
});

// Mouse movement
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

// Example with hovering and click
const bean = add([
    sprite("bean"),
    area(),
    color(BLUE),
]);

bean.onClick(() => {
    debug.log("ohhi");
});

bean.onHover(() => {
    bean.color = RED;
});

bean.onHoverEnd(() => {
    bean.color = BLUE;
});
