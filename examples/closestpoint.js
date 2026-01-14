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
    /*drawPolygon({
        pos: vec2(100),
        pts: poly,
        fill: false,
        outline: {
            width: 2,
            color: WHITE
        }
    });

    const p = toWorld(mousePos()).sub(100, 100);
    let p1 = poly.at(-1);
    let p2, v1 = new Vec2(), v2 = new Vec2(), pp;
    let c, cd;
    for (let i = 0; i < poly.length; i++) {
        p2 = poly[i];
        Vec2.sub(p, p1, v1);
        Vec2.sub(p2, p1, v2);
        const t = v1.dot(v2) / v2.dot(v2);
        if (t >= 0 && t <= 1) {
            pp = p1.add(v2.scale(t));
            const d = Vec2.sdist(p, pp);
            if (c === undefined || d < cd) {
                c = pp;
                cd = d;
            }
        }
        else {
            const d = Vec2.sdist(p, p2);
            if (c === undefined || d < cd) {
                c = p2;
                cd = d;
            }
        }
        p1 = p2;
    }
    if (c)
        drawCircle({
            pos: c.add(100, 100),
            radius: 5
        });
        */

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
