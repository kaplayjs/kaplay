// @ts-check

// How kaplay handles collisions with different shapes
kaplay();

// Set the gravity acceleration (pixels per second)
setGravity(300);

// Adds a ground
add([
    pos(0, 400),
    rect(width(), 40),
    area(),
    body({ isStatic: true }),
]);

// Continuous shapes
loop(1, () => {
    // Adds an object with a random shape
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

    // getTreeRoot() gets the root of the game, the object that holds every other object
    // This line basically means that if there are more than 20 objects, we destroy the last one
    if (getTreeRoot().children.length > 20) {
        destroy(getTreeRoot().children[1]);
    }

    /* The previous code can also be written as
    if (get("*").length > 20) {
        destroy(get("*")[1]);
    }
    */
});
