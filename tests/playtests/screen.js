kaplay({
    // 16:9
    width: 640,
    height: 360,
    pixelDensity: 1,
    scale: 1,
    letterbox: true,
});

loadBean();

add([
    sprite("bean"),
]);

const redDot = add([
    anchor("center"),
    circle(3),
    color(RED),
    pos(),
    fakeMouse(),
]);

onMouseMove(pos => {
    redDot.pos = toWorld(pos);
});

let cameraScale = 1;

onScroll((delta) => {
    cameraScale = cameraScale * (1 - 0.1 * Math.sign(delta.y));
    setCamScale(cameraScale);
});
