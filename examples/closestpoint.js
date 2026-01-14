// Starts a new game
kaplay();

const poly = createRegularPolygon(70, 9);

const nine = add([
    pos(200),
    polygon(poly, { fill: false }),
    outline(2, WHITE),
    area(),
]);

const circ = add([
    pos(350, 200),
    circle(70, { fill: false }),
    outline(2, WHITE),
    area(),
]);

const rec = add([
    pos(500, 200),
    rect(140, 140, { fill: false }),
    outline(2, WHITE),
    area(),
    anchor("center"),
]);

onDraw(() => {
    const p = toWorld(mousePos());
    let c = nine.worldArea().closestPt(p);

    drawCircle({
        pos: c,
        radius: 5,
        color: RED,
    });

    c = circ.worldArea().closestPt(p);

    drawCircle({
        pos: c,
        radius: 5,
        color: RED,
    });

    c = rec.worldArea().closestPt(p);

    drawCircle({
        pos: c,
        radius: 5,
        color: RED,
    });
});
