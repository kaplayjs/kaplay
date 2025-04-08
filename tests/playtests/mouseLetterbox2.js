kaplay({
    width: 200,
    height: 400,
    letterbox: true,
});

const redDot = add([
    anchor("center"),
    circle(3),
    color(RED),
    pos(),
]);

onMouseMove(pos => {
    redDot.pos = toWorld(pos);
});

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});
