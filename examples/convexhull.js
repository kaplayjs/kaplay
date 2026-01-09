kaplay();

const custompoly = [
    vec2(100, 100),
    vec2(200, 90),
    vec2(150, 150),
    vec2(200, 200),
    vec2(80, 200),
];
const customhull = buildConvexHull(custompoly);

const cogpoly = createCogPolygon(40, 80, 16);
const coghull = buildConvexHull(cogpoly.slice(1));

const starpoly = createStarPolygon(40, 80, 16);
const starhull = buildConvexHull(starpoly.slice(1));

onDraw(() => {
    drawPolygon({
        pos: vec2(100, 100),
        pts: custompoly,
        opacity: 0.5,
    });
    drawPolygon({
        pts: customhull,
        pos: vec2(100, 100),
        fill: false,
        outline: {
            width: 2,
            color: BLUE,
        },
    });

    drawPolygon({
        pos: vec2(200, 100),
        pts: cogpoly,
        opacity: 0.5,
    });
    drawPolygon({
        pts: coghull,
        pos: vec2(200, 100),
        fill: false,
        outline: {
            width: 2,
            color: BLUE,
        },
    });

    drawPolygon({
        pos: vec2(200, 400),
        pts: starpoly,
        opacity: 0.5,
    });
    drawPolygon({
        pts: starhull,
        pos: vec2(200, 400),
        fill: false,
        outline: {
            width: 2,
            color: BLUE,
        },
    });
});
