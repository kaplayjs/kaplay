kaplay();

loadBean();

scene("main", () => {
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
        constraint.distance(obj1, {
            distance: 100,
            mode: "maximum",
            strength: 1,
        }),
        // constraint.translation(obj1, { strength: 0.75, offset: vec2(50, 0) }),
        "obj",
        "constraint",
        // body()
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
});

// trigger initial installSystem();
constraint.rotation(null, { scale: 1 });
go("main");
go("main");
go("main");
