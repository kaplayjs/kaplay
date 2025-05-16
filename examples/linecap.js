/**
 * @file Lines
 * @description The different draw options of a line.
 * @difficulty 1
 * @tags effects
 * @minver 4000.0
 * @category concepts
 */

kaplay();

onDraw(() => {
    // No line cap
    drawLines({
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "bevel",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(50, 50),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(50, 200),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(200, 0),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "round",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(250, 50),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(250, 200),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(400, 0),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "miter",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(450, 50),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(450, 200),
        radius: 4,
        color: RED,
    });

    // Square line cap
    drawLines({
        pos: vec2(0, 250),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "bevel",
        cap: "square",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(50, 300),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(50, 450),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(200, 250),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "round",
        cap: "square",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(250, 300),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(400, 300),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(400, 450),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(250, 450),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(400, 250),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "miter",
        cap: "square",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(450, 300),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(450, 450),
        radius: 4,
        color: RED,
    });

    // Round line cap
    drawLines({
        pos: vec2(0, 500),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "bevel",
        cap: "round",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(50, 550),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(50, 700),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(200, 500),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "round",
        cap: "round",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(250, 550),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(250, 700),
        radius: 4,
        color: RED,
    });

    drawLines({
        pos: vec2(400, 500),
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "miter",
        cap: "round",
        width: 20,
        opacity: 0.75,
    });
    drawCircle({
        pos: vec2(450, 550),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(600, 550),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(600, 700),
        radius: 4,
        color: RED,
    });
    drawCircle({
        pos: vec2(450, 700),
        radius: 4,
        color: RED,
    });
});
