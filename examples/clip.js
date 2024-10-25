kaplay();

const r = new Rect(vec2(100, 100), 300, 200);
const c = new Circle(vec2(250, 200), 100, 100);
const res = new Line(vec2(), vec2());
const testLines = [
    new Line(vec2(20, 40), vec2(500, 200)),
    new Line(vec2(20, 80), vec2(60, 20)),
    new Line(vec2(170, 200), vec2(260, 220)),
    new Line(vec2(150, 40), vec2(300, 40)),
    new Line(vec2(40, 100), vec2(40, 170)),
    new Line(vec2(160, 140), vec2(240, 140)),
    new Line(vec2(120, 150), vec2(120, 190)),
];

function drawRectClippedLine(r, l) {
    drawLine({
        p1: l.p1,
        p2: l.p2,
        color: WHITE,
    });

    if (clipLineToRect(r, l, res)) {
        drawLine({
            p1: res.p1,
            p2: res.p2,
            color: GREEN,
        });
    }
}

function drawCircleClippedLine(r, l) {
    drawLine({
        p1: l.p1,
        p2: l.p2,
        color: WHITE,
    });

    if (clipLineToCircle(c, l, res)) {
        drawLine({
            p1: res.p1,
            p2: res.p2,
            color: GREEN,
        });
    }
}

scene("rect", () => {
    onDraw(() => {
        drawRect({
            pos: r.pos,
            width: r.width,
            height: r.height,
            fill: false,
            outline: {
                color: RED,
                width: 1,
            },
        });

        for (line of testLines) {
            drawRectClippedLine(r, line);
        }
    });

    onKeyPress("c", () => {
        go("circle");
    });
});

scene("circle", () => {
    onDraw(() => {
        drawCircle({
            pos: c.center,
            radius: c.radius,
            fill: false,
            outline: {
                color: RED,
                width: 1,
            },
        });

        for (line of testLines) {
            drawCircleClippedLine(c, line);
        }
    });

    onKeyPress("r", () => {
        go("rect");
    });
});

go("circle");
