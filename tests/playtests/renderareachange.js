kaplay();

const c = add([
    pos(100, 100),
    circle(50),
    area(),
]);

wait(2, () => {
    debug.log("changed radius");
    c.radius = 75;
});
