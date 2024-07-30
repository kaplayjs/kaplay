kaplay();

setGravity(300);

add([
    pos(100, 300),
    rect(200, 20),
    area(),
    body({ isStatic: true }),
    surfaceEffector({ speed: 20 }),
    {
        draw() {
            drawPolygon({
                pts: [
                    vec2(2, 2),
                    vec2(12, 10),
                    vec2(2, 18),
                ],
                color: RED,
            });
        },
    },
]);

add([
    pos(80, 400),
    rect(250, 20),
    area(),
    body({ isStatic: true }),
    surfaceEffector({ speed: -20 }),
    {
        draw() {
            drawPolygon({
                pts: [
                    vec2(12, 2),
                    vec2(2, 10),
                    vec2(12, 18),
                ],
                color: RED,
            });
        },
    },
]);

add([
    pos(20, 320),
    rect(50, 300),
    area(),
    areaEffector({ forceAngle: -90, forceMagnitude: 10 }),
    {
        draw() {
            drawPolygon({
                pts: [
                    vec2(25, 2),
                    vec2(48, 12),
                    vec2(2, 12),
                ],
                color: RED,
            });
        },
    },
]);

add([
    pos(35, 35),
    rect(60, 60),
    anchor("center"),
    area(),
    pointEffector({ forceMagnitude: 10 }),
    {
        draw() {
            drawCircle({
                pos: vec2(0, 0),
                radius: 5,
                color: RED,
            });
        },
    },
]);

loop(5, () => {
    add([
        pos(100, 100),
        rect(20, 20),
        color(RED),
        area(),
        body(),
        offscreen({ destroy: true }),
    ]);
});
