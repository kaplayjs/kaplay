kaplay({
    width: 1280,
    height: 720,
    pixelDensity: 2,
});

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

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});
