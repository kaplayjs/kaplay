// To test touch, enable touch simulation in dev tools responsive design mode
// then press and hold mouse down and move around
// ensure that red dot follows correctly in fullscreen (F)

kaplay({ width: 600, height: 600 });

const redDot = add([
    anchor("center"),
    circle(3),
    color(RED),
    pos(),
    area(),
]);

onMouseMove(pos => {
    redDot.pos = toWorld(pos);
});

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});
