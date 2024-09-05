kaplay();

setGravity(300);

add([
    pos(0, 400),
    rect(width(), 40),
    area(),
    body({ isStatic: true }),
]);

// Continuous shapes
loop(1, () => {
    add([
        pos(width() / 2 + rand(-50, 50), 100),
        choose([
            rect(20, 20),
            circle(10),
            ellipse(20, 10),
            polygon([vec2(-15, 10), vec2(0, -10), vec2(15, 10)]),
        ]),
        color(RED),
        area(),
        body(),
        offscreen({ destroy: true, distance: 10 }),
    ]);
    if (getTreeRoot().children.length > 20) {
        destroy(getTreeRoot().children[1]);
    }
});
