// Adding game objects to screen

// Start a kaboom game
kaplay();

add([
    rect(100, 100, { radius: 20 }),
    pos(100, 100),
    rotate(0),
    anchor("center"),
]);

add([
    rect(100, 100, { radius: [10, 20, 30, 40] }),
    pos(250, 100),
    rotate(0),
    anchor("center"),
]);

add([
    rect(100, 100, { radius: [0, 20, 0, 20] }),
    pos(400, 100),
    rotate(0),
    anchor("center"),
]);

add([
    rect(100, 100, { radius: 20 }),
    pos(100, 250),
    rotate(0),
    anchor("center"),
    outline(4, BLACK),
]);

add([
    rect(100, 100, { radius: [10, 20, 30, 40] }),
    pos(250, 250),
    rotate(0),
    anchor("center"),
    outline(4, BLACK),
]);

add([
    rect(100, 100, { radius: [0, 20, 0, 20] }),
    pos(400, 250),
    rotate(0),
    anchor("center"),
    outline(4, BLACK),
]);
