kaboom();

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
    });

    // Triangles
    drawTriangle({
        pos: vec2(0, 400),
        p1: vec2(125, 50),
        p2: vec2(200, 200),
        p3: vec2(50, 200),
        outline: { color: RED, width: 20, join: "bevel" },
    });

    drawTriangle({
        pos: vec2(200, 400),
        p1: vec2(125, 50),
        p2: vec2(200, 200),
        p3: vec2(50, 200),
        outline: { color: RED, width: 20, join: "round" },
    });

    drawTriangle({
        pos: vec2(400, 400),
        p1: vec2(125, 50),
        p2: vec2(200, 200),
        p3: vec2(50, 200),
        outline: { color: RED, width: 20, join: "miter" },
    });
});
