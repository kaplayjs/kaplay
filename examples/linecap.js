kaplay();

onDraw(() => {
    // Rectangles
    drawLines({
        pts: [
            vec2(50, 50),
            vec2(200, 50),
            vec2(200, 200),
            vec2(50, 200),
        ],
        join: "bevel",
        cap: "square",
        width: 20,
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
        cap: "square",
        width: 20,
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
        cap: "square",
        width: 20,
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
});
