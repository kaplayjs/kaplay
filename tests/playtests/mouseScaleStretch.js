kaplay({
    scale: 3,
    letterbox: true,
    width: 100,
    height: 100,
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
