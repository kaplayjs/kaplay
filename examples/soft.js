kaplay({
    broadPhaseCollisionAlgorithm: "grid",
});
loadBean();

onLoad(() => {
    const poly = createRegularPolygon(50, 16, 0);

    const data = getSprite("bean").data;
    const frame = data.frames[0];

    add([
        pos(0, 300),
        rect(500, 50),
        area(),
    ]);
    add([
        pos(100, 300),
        circle(20),
        area(),
    ]);
    add([
        pos(0, 300),
        circle(20),
        area(),
    ]);
    add([
        pos(200, 300),
        circle(20),
        area(),
    ]);

    const obj = add([
        pos(100, 100),
        polygon(poly, {
            uv: projectUV(frame, poly),
            tex: data.tex,
        }),
        soft(),
    ]);
});
