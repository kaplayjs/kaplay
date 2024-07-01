kaplay();

function addPoint(c, ...args) {
    return add([
        "point",
        rect(8, 8),
        anchor("center"),
        pos(...args),
        area(),
        color(c),
    ]);
}

function addBezier(...objects) {
    const points = [...objects];

    let t = 0;
    return add([
        pos(0, 0),
        {
            draw() {
                const coords = points.map(p => p.pos);
                const c = normalizedCurve(t => evaluateBezier(...coords, t));
                drawCurve(t => evaluateBezier(...coords, t), {
                    segments: 25,
                    width: 4,
                });
                drawLine({
                    p1: points[0].pos,
                    p2: points[1].pos,
                    width: 2,
                    color: rgb(0, 0, 255),
                });
                drawLine({
                    p1: points[3].pos,
                    p2: points[2].pos,
                    width: 2,
                    color: rgb(0, 0, 255),
                });
                for (let i = 0; i <= 10; i++) {
                    const p = evaluateBezier(...coords, i / 10);
                    drawCircle({
                        pos: p,
                        radius: 4,
                        color: YELLOW,
                    });
                }
                for (let i = 0; i <= 10; i++) {
                    const p = c(i / 10);
                    drawCircle({
                        pos: p,
                        radius: 8,
                        color: RED,
                        opacity: 0.5,
                    });
                }
            },
            update() {
            },
        },
    ]);
}

function drawCatmullRom(a, b, c, d) {
    drawCurve(t => evaluateCatmullRom(a, b, c, d, t), {
        segments: 25,
        width: 4,
    });
}

function normalizedFirstDerivative(curve, curveFirstDerivative) {
    const curveLength = curveLengthApproximation(curve);
    const length = curveLength(1);
    return s => {
        const l = s * length;
        const t = curveLength(l, true);
        return curveFirstDerivative(t);
    };
}

function addCatmullRom(...objects) {
    const points = [...objects];

    let t = 0;
    return add([
        pos(0, 0),
        {
            draw() {
                const coords = points.map(p => p.pos);
                const first = coords[0].add(coords[0].sub(coords[1]));
                const last = coords[coords.length - 1].add(
                    coords[coords.length - 1].sub(coords[coords.length - 2]),
                );
                let curve;
                let ct;
                const curveCoords = [
                    [first, ...coords.slice(0, 3)],
                    coords,
                    [...coords.slice(1), last],
                ];
                const curveLengths = curveCoords.map(cc =>
                    curveLengthApproximation(t => evaluateCatmullRom(...cc, t))(
                        1,
                    )
                );
                const length = curveLengths.reduce((sum, l) => sum + l, 0);
                const p0 = curveLengths[0] / length;
                const p1 = curveLengths[1] / length;
                const p2 = curveLengths[2] / length;
                if (t <= p0) {
                    curve = curveCoords[0];
                    ct = t * (1 / p0);
                } else if (t <= p0 + p1) {
                    curve = curveCoords[1];
                    ct = (t - p0) * (1 / p1);
                } else {
                    curve = curveCoords[2];
                    ct = (t - p0 - p1) * (1 / p2);
                }
                const c = normalizedCurve(t => evaluateCatmullRom(...curve, t));
                const cd = normalizedFirstDerivative(
                    t => evaluateCatmullRom(...curve, t),
                    t => evaluateCatmullRomFirstDerivative(...curve, t),
                );

                drawCatmullRom(first, ...coords.slice(0, 3), {
                    segments: 10,
                    width: 4,
                });
                drawCatmullRom(...coords, { segments: 10, width: 4 });
                drawCatmullRom(...coords.slice(1), last, {
                    segments: 10,
                    width: 4,
                });

                const cartPos1 = evaluateCatmullRom(...curve, ct);
                const tangent1 = evaluateCatmullRomFirstDerivative(
                    ...curve,
                    ct,
                );
                pushTransform();
                pushTranslate(cartPos1);
                pushRotate(tangent1.angle(1, 0));
                drawRect({
                    width: 16,
                    height: 8,
                    pos: vec2(-8, -4),
                    color: YELLOW,
                    outline: { color: BLUE, width: 4 },
                });
                popTransform();

                const cartPos2 = c(ct);
                const tangent2 = cd(ct);
                pushTransform();
                pushTranslate(cartPos2);
                pushRotate(tangent2.angle(1, 0));
                drawRect({
                    width: 16,
                    height: 8,
                    pos: vec2(-8, -4),
                    color: RED,
                    opacity: 0.5,
                    outline: { color: BLACK, width: 4 },
                });
                popTransform();
            },
            update() {
                t += dt() / 10;
                t = t % 1;
            },
        },
    ]);
}

// Interraction
let obj = null;

onClick("point", (point) => {
    obj = point;
});

onMouseMove((pos) => {
    if (obj) {
        obj.moveTo(pos);
    }
});

onMouseRelease((pos) => {
    obj = null;
});

// Scene creation
const p0 = addPoint(RED, 100, 40);
const p1 = addPoint(BLUE, 80, 120);
const p2 = addPoint(BLUE, 300, 60);
const p3 = addPoint(RED, 250, 200);

addBezier(p0, p1, p2, p3);

add([
    pos(20, 300),
    text("yellow: default spacing\nred: constant spacing", { size: 20 }),
]);

const c0 = addPoint(RED, 400, 40);
const c1 = addPoint(RED, 380, 120);
const c2 = addPoint(RED, 500, 60);
const c3 = addPoint(RED, 450, 200);

addCatmullRom(c0, c1, c2, c3);

add([
    pos(400, 300),
    text("yellow: default speed\nred: constant speed", { size: 20 }),
]);

add([
    pos(20, 350),
    text(
        "curves are non-linear in t. This means that for a given t,\nthe distance traveled from the start doesn't grow at constant speed.\nTo fix this, turn the curve into a normalized curve first.\nUse derivatives to find the direction of the curve at a certain t.",
        { size: 20 },
    ),
]);
