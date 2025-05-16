/**
 * @file Line join
 * @description The different draw options of a line.
 * @difficulty 1
 * @tags effects
 * @minver 4000.0
 * @category concepts
 */

kaplay();

onDraw(() => {
    // Rectangles
    drawLines({
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
            vec2(50, 50),
        ],
        join: "bevel",
        width: 20,
        opacity: 0.75,
    });

    drawLines({
        pos: vec2(200, 0),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
            vec2(50, 50),
        ],
        join: "round",
        width: 20,
        opacity: 0.75,
    });

    drawLines({
        pos: vec2(400, 0),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
            vec2(50, 50),
        ],
        join: "miter",
        width: 20,
        opacity: 0.75,
    });

    // Parallelograms
    drawLines({
        pos: vec2(0, 200),
        pts: [
            vec2(60, 50),
            vec2(210, 50),
            vec2(170, 200),
            vec2(20, 200),
            vec2(60, 50),
        ],
        join: "bevel",
        width: 20,
        opacity: 0.75,
    });

    drawLines({
        pos: vec2(200, 200),
        pts: [
            vec2(60, 50),
            vec2(210, 50),
            vec2(170, 200),
            vec2(20, 200),
            vec2(60, 50),
        ],
        join: "round",
        width: 20,
        opacity: 0.75,
    });

    drawLines({
        pos: vec2(400, 200),
        pts: [
            vec2(60, 50),
            vec2(210, 50),
            vec2(170, 200),
            vec2(20, 200),
            vec2(60, 50),
        ],
        join: "miter",
        width: 20,
        opacity: 0.75,
    });
});

add([
    pos(0, 400),
    polygon([vec2(125, 50), vec2(200, 200), vec2(50, 200)]),
    outline(20, RED, 0.75, "bevel"),
]);

add([
    pos(200, 400),
    polygon([vec2(125, 50), vec2(200, 200), vec2(50, 200)]),
    outline(20, RED, 0.75, "round"),
]);

add([
    pos(400, 400),
    polygon([vec2(125, 50), vec2(200, 200), vec2(50, 200)]),
    outline(20, RED, 0.75, "miter"),
]);

add([
    pos(125, 700),
    circle(75),
    outline(20, RED, 0.75, "bevel"),
]);

add([
    pos(325, 700),
    circle(75),
    outline(20, RED, 0.75, "round"),
]);

add([
    pos(525, 700),
    circle(75),
    outline(20, RED, 0.75, "miter"),
]);
