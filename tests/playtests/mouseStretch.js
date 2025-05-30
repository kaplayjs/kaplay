kaplay();

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
