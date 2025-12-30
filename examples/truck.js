// Starts a new game
kaplay();

let obj;

onClick("obj", (o) => {
    obj = o;
    debug.log("click");
});

onMouseMove((_, delta) => {
    if (obj) {
        obj.moveBy(delta.x, obj.is("free") ? delta.y : 0);
    }
});

onMouseRelease(() => {
    if (obj && obj.is("free")) {
        obj.snap();
    }
    obj = null;
});

// floor
add([
    pos(0, 425),
    rect(1000, 20),
]);

const wheelPoints = createCogPolygon(50, 42, 48);

const truck = add([
    pos(200, 300),
    rect(300, 75),
    area(),
    "obj",
]);
// left wheel
truck.add([
    pos(50, 75),
    polygon(wheelPoints),
    color(BLACK),
    rotate(0),
    {
        update() {
            const c = Math.PI * 50 * 2;
            this.angle = 360 * (this.transform.e / c);
        },
    },
]);
// right wheel
truck.add([
    pos(250, 75),
    polygon(wheelPoints),
    color(BLACK),
    rotate(0),
    {
        update() {
            const c = Math.PI * 50 * 2;
            this.angle = 360 * (this.transform.e / c);
        },
    },
]);
const bucket = truck.add([
    pos(300, 0),
    rect(200, 75),
    color(YELLOW),
    rotate(0),
    anchor("botright"),
    constraint.bone(0, 90),
]);
// The handle that actually gets dragged
const handle = truck.add([
    pos(100, -75),
    circle(4),
    area(),
    "obj",
    "free",
    {
        snap() {
            const redDot = bucket.children[0];
            const redDotWorldPos = bucket.transform.transform(redDot.pos);
            const redDotTruckPos = truck.transform.inverse.transform(
                redDotWorldPos,
            );
            this.pos = redDotTruckPos;
        },
    },
    opacity(0),
]);
// The red dot
bucket.add([
    pos(-200, -75),
    circle(4),
    constraint.ik(handle, {
        strength: 1,
        iterations: 1,
        depth: 1,
        algorithm: "CCD",
    }),
    constraint.bone(0, 90),
    color(RED),
]);
