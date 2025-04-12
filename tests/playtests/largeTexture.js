/**
 * @file Large Texture
 * @description Test how KAPLAY handles large textures (big sprites).
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay();

// Loads a random 2500px image
loadSprite("bigyoshi", "/sprites/YOSHI.png");

let cameraPosition = getCamPos();

add([
    sprite("bigyoshi"),
]);

// Adds a label
const label = add([
    text("Click and drag the mouse, scroll the wheel"),
    z(1),
]);

add([
    rect(label.width, label.height),
    color(0, 0, 0),
    z(0),
]);

// Mouse handling
onUpdate(() => {
    if (isMouseDown("left") && isMouseMoved()) {
        cameraPosition = cameraPosition.sub(
            mouseDeltaPos().scale(1 / cameraScale),
        );
        setCamPos(cameraPosition);
    }
});

let cameraScale = 1;

onScroll((delta) => {
    cameraScale = cameraScale * (1 - 0.1 * Math.sign(delta.y));
    setCamScale(cameraScale);
});
