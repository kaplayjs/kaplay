kaplay({
    scale: 7,
    width: 200,
    height: 400,
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
