// @ts-check

kaplay();

loadSprite("bean", "sprites/bean.png");
loadSprite("bag", "sprites/bag.png");

setGravity(300);

const trajectoryText = add([
    pos(20, 20),
    text(`0`),
]);

function ballistics(pos, vel, t) {
    return pos.add(vel.scale(t)).add(
        vec2(0, 1).scale(getGravity() * t * t * 0.5),
    );
}

let y;

onDraw(() => {
    drawCurve(t => ballistics(vec2(50, 100), vec2(200, -100), t * 2), {
        width: 2,
        color: RED,
    });
});

onClick(() => {
    const startTime = time();
    let results = [];
    const bean = add([
        sprite("bean"),
        anchor("center"),
        pos(50, 100),
        body(),
        offscreen({ destroy: true }),
        {
            draw() {
                drawLine({
                    p1: vec2(-40, 0),
                    p2: vec2(40, 0),
                    width: 2,
                    color: GREEN,
                });
                drawLine({
                    p1: vec2(0, -40),
                    p2: vec2(0, 40),
                    width: 2,
                    color: GREEN,
                });
            },
            update() {
                const t = time() - startTime;
                if (t >= 2) return;
                results.push([
                    t,
                    this.pos.y,
                    ballistics(vec2(50, 100), vec2(200, -100), t).y,
                ]);
            },
            destroy() {
                const a = results.map(d =>
                    Math.sqrt((d[1] - d[2]) * (d[1] - d[2]))
                ).reduce((s, v) => s + v, 0) / results.length;
                trajectoryText.text = `${a.toFixed(2)}`;
            },
        },
    ]);
    bean.vel = vec2(200, -100);
});

function highestPoint(pos, vel) {
    return pos.y - vel.y * vel.y / (2 * getGravity());
}

const heightGoal = highestPoint(vec2(50, 300), vec2(0, -200));
let heightResult = 0;

onDraw(() => {
    y = highestPoint(vec2(50, 300), vec2(0, -200));
    drawLine({
        p1: vec2(10, y),
        p2: vec2(90, y),
        width: 2,
        color: RED,
    });
});

const heightText = add([
    pos(100, heightGoal),
    text(`0%`),
]);

onUpdate(() => {
    heightText.text =
        `${((100 * (heightResult - heightGoal) / heightGoal).toFixed(2))}%`;
});

onClick(() => {
    y = highestPoint(vec2(50, 300), vec2(0, -200));
    const bean = add([
        sprite("bag"),
        anchor("center"),
        pos(50, 300),
        body(),
        offscreen({ destroy: true }),
        {
            draw() {
                drawLine({
                    p1: vec2(-40, 0),
                    p2: vec2(40, 0),
                    width: 2,
                    color: GREEN,
                });
            },
            update() {
                if (this.vel.y <= 0) {
                    heightResult = this.pos.y;
                }
            },
        },
    ]);
    bean.vel = vec2(0, -200);
});
