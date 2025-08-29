kaplay();

loadBean();
setGravity(150);

const obj1 = add([
    pos(100, 100),
    sprite("bean"),
    anchor("center"),
    area(),
    // skew(-45, 0),
    {
        draw() {
            drawCircle({
                radius: 100,
                fill: false,
                outline: {
                    size: 1,
                },
            });
        },
    },
    "obj",
]);

const obj2 = add([
    pos(200, 200),
    sprite("bean"),
    anchor("center"),
    area(),
    constraint.distance(obj1, { distance: 100, mode: "maximum", strength: 1 }),
    // constraint.translation(obj1, { strength: 0.75, offset: vec2(50, 0) }),
    "obj",
    "constraint",
    // body()
]);

const obj3 = add([
    pos(100, 400),
    rotate(0),
    sprite("bean"),
    anchor("center"),
    area(),
    "obj",
]);

const obj4 = add([
    pos(200, 400),
    rotate(0),
    sprite("bean"),
    anchor("center"),
    area(),
    constraint.rotation(obj3, { strength: 1, offset: 90, scale: -1 }),
    "obj",
    "constraint",
]);

obj4.add([
    pos(50, 0),
    sprite("bean"),
    anchor("center"),
    scale(0.2),
]);

const obj5 = add([
    pos(100, 600),
    scale(1),
    sprite("bean"),
    anchor("center"),
    area(),
    "obj",
]);

const obj6 = add([
    pos(200, 600),
    scale(1),
    sprite("bean"),
    anchor("center"),
    area(),
    constraint.scale(obj5, { strength: 1 }),
    "obj",
    "constraint",
]);

let obj;

onClick("obj", (o) => {
    obj = o;
    if (obj.has("body")) {
        console.log(obj.gravityScale);
        obj.gravityScale = 1;
        console.log(obj.gravityScale);
    }
});

onMouseMove((newPos, delta) => {
    if (obj) {
        if (obj.has("rotate")) {
            const oldPos = newPos.sub(delta);
            const oldAngle = oldPos.sub(obj.pos).angle();
            const newAngle = newPos.sub(obj.pos).angle();
            const deltaAngle = newAngle - oldAngle;
            obj.angle += deltaAngle;
        }
        else if (obj.has("scale")) {
            const oldPos = newPos.sub(delta);
            const deltaScale = newPos.sub(obj.pos).len()
                / oldPos.sub(obj.pos).len();
            obj.scale = obj.scale.scale(deltaScale);
        }
        else {
            obj.pos = obj.pos.add(delta);
        }
        // get("constraint").forEach(o => o.apply());
    }
});

onMouseRelease(() => {
    if (obj && obj.has("body")) {
        obj.gravityScale = 1;
    }
    obj = null;
});
