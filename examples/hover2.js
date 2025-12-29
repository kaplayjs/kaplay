/**
 * @file Hover
 * @description Understand the different hover methods
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 * @category basics
 */

// Differeces between onHover and onHoverUpdate

kaplay({
    scale: 2,
});

loadSprite("bean", "/sprites/bean.png");

add([
    text("onHover()\nonHoverEnd()"),
    pos(80, 80),
]);

add([
    text("onHoverUpdate()"),
    pos(340, 80),
]);

const redBean = add([
    sprite("bean"),
    color(RED),
    pos(130, 180),
    anchor("center"),
    area(),
]);

const blueBean = add([
    sprite("bean"),
    color(BLUE),
    pos(380, 180),
    anchor("center"),
    area(),
]);

// Only runs once when bean is hovered, and when bean is unhovered
redBean.onHover(() => {
    debug.log("red bean hovered");

    redBean.color = GREEN;
});
redBean.onHoverEnd(() => {
    debug.log("red bean unhovered");

    redBean.color = RED;
});

// Runs every frame when blue bean is hovered
blueBean.onHoverUpdate(() => {
    const t = time() * 10;
    blueBean.color = rgb(
        wave(0, 255, t),
        wave(0, 255, t + 2),
        wave(0, 255, t + 4),
    );

    debug.log("blue bean on hover");
});

let cameraScale = 1;

onScroll((delta) => {
    cameraScale = cameraScale * (1 - 0.1 * Math.sign(delta.y));
    setCamScale(cameraScale);
});
