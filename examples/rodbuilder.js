// initialize context
kaplay();

// load assets
loadSprite("bean", "sprites/bean.png");

function kinetic() {
    return {
        id: "kinetic",
        require: ["pos"],
        oldPos: vec2(0),
        forces: vec2(0),
        add() {
            this.oldPos.x = this.pos.x;
            this.oldPos.y = this.pos.y;
        },
        applyImpulse(v) {
            this.forces = this.forces.add(v);
        },
        get velocity() {
            return this.pos.sub(this.oldPos);
        },
        set velocity(value) {
            this.oldPos = this.pos.sub(value);
        },
    };
}

function distanceConstraint(a, b, distance, stiffness = 1.0) {
    return {
        type: "distance",
        a: a,
        b: b,
        resolve() {
            const v = a.pos.sub(b.pos);
            const d = v.len();
            if (Math.abs(d - distance) > 0.1) {
                const diff = v.scale(stiffness * (distance - d) / (d * 2));
                a.pos = a.pos.add(diff);
                b.pos = b.pos.sub(diff);
            }
        },
    };
}

function pinConstraint(a, p) {
    return {
        type: "pin",
        a: a,
        b: a,
        pos: p,
        resolve() {
            a.pos = this.pos.clone();
        },
    };
}

let constraints = [];

function getConstraint(a, b) {
    return constraints.find(constraint =>
        (constraint.a === a && constraint.b === b)
        || (constraint.a === b && constraint.b === a)
    );
}

function getConstraints(a, type) {
    return constraints.filter(constraint =>
        (constraint.a === a || constraint.b === a)
        && (!type || constraint.type === type)
    );
}

function addConstraint(c) {
    console.log(`added constraint ${c.type}`);
    constraints.push(c);
}

function removeConstraint(c) {
    constraints.splice(constraints.indexOf(c), 1);
}

onDraw(() => {
    for (const c of constraints) {
        drawLine({
            p1: c.a.pos,
            p2: c.b.pos,
            width: 4,
            color: BLUE,
            opacity: 0.25,
        });
    }
});

let oldDt = 0;
let sim = true;
setGravity(300);

onKeyPress("g", (key) => {
    setGravity(getGravity() ? 0 : 300);
});

onKeyPress("s", (key) => {
    sim = !sim;
});

onDraw(() => {
    drawText({
        text: `G`,
        size: 16,
        pos: vec2(width() - 40, 8),
        color: getGravity() ? WHITE : BLACK,
        fixed: true,
    });
    drawText({
        text: `S`,
        size: 16,
        pos: vec2(width() - 20, 8),
        color: sim ? WHITE : BLACK,
        fixed: true,
    });
});

onUpdate(() => {
    if (!sim) return;
    const objects = get("kinetic");

    const left = 0;
    const right = width();
    const top = 0;
    const bottom = height();

    const timeFactor = dt() / (oldDt || dt());
    const gravity = getGravity();
    oldDt = dt();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        if (!object.is("selected")) {
            object.applyImpulse(vec2(0, gravity));
        }

        // Collisions with other objects
        for (let j = i + 1; j < objects.length; j++) {
            const other = objects[j];

            const v = object.pos.sub(other.pos);
            const distance = v.len();
            const n = v.scale(1 / distance);
            if (distance >= object.radius + other.radius) continue;

            const displacement = distance - object.radius - other.radius;
            const v1 = object.velocity;
            const v2 = other.velocity;
            const p = v1.dot(n) - v2.dot(n);
            const w1 = v1.sub(n.scale(p));
            const w2 = v2.add(n.scale(p));

            object.pos = object.pos.sub(n.scale(displacement * 0.5));
            object.velocity = w1;
            other.pos = other.pos.add(n.scale(displacement * 0.5));
            other.velocity = w2;
        }

        // Update velocity
        let velocity = object.velocity.scale(timeFactor);
        velocity = velocity.scale(0.99);

        // Bounds
        if (object.pos.x < left + object.radius) {
            object.pos.x = object.oldPos.x = left + object.radius;
        }
        else if (object.pos.x > right - object.radius) {
            object.pos.x = object.oldPos.x = right - object.radius;
        }
        else {
            object.oldPos.x = object.pos.x;
            object.pos.x = object.pos.x + velocity.x;
        }
        if (object.pos.y < top + object.radius) {
            object.pos.y = object.oldPos.y = top + object.radius;
        }
        else if (object.pos.y > bottom - object.radius) {
            object.pos.y = object.oldPos.y = bottom - object.radius;
        }
        else {
            object.oldPos.y = object.pos.y;
            object.pos.y = object.pos.y + velocity.y;
        }

        for (const c of constraints) {
            c.resolve();
        }

        object.pos = object.pos.add(
            object.forces.scale(dt() * (oldDt + dt()) / 2),
        );
        object.forces = vec2();
    }
});

add([
    pos(30, 30),
    circle(16),
    area(),
    "ball-template",
]);

add([
    pos(90, 30),
    circle(16),
    area(),
    color(RED),
    "ball-template-pin",
]);

onClick("ball-template", () => {
    add([
        pos(mousePos()),
        circle(16),
        area(),
        kinetic(),
        "ball",
        "selected",
    ]);
});

onClick("ball-template-pin", () => {
    const ball = add([
        pos(mousePos()),
        circle(16),
        area(),
        kinetic(),
        color(RED),
        "ball",
        "selected",
        "pinned",
    ]);
    addConstraint(pinConstraint(ball, mousePos()));
});

onMousePress(button => {
    const balls = get("ball");
    for (const ball of balls.reverse()) {
        if (ball.isHovering()) {
            ball.tag("selected");
            if (button == "right") {
                getConstraints(ball).forEach(c => (removeConstraint(c)));
            }
            break;
        }
    }
});

onUpdate("selected", selected => {
    selected.pos = selected.oldPos = toWorld(mousePos());
    getConstraints(selected, "pin").forEach(c => {
        c.pos = toWorld(mousePos());
    });
});

onDraw("selected", selected => {
    const balls = get("ball");
    if (selected.is("pinned")) {
    }
    else {
        for (const ball of balls) {
            if (ball === selected) {
                continue;
            }
            if (ball.pos.dist(selected.pos) < 120) {
                const c = getConstraint(ball, selected);
                if (!c) {
                    drawLine({
                        p1: vec2(0, 0),
                        p2: ball.pos.sub(selected.pos),
                        width: 4,
                        color: RED,
                    });
                }
            }
        }
    }
});

onMouseRelease(() => {
    const selection = get("selected");
    for (const selected of selection) {
        selected.untag("selected");
        if (selected.is("pinned")) {
            getConstraints(selected, "pin").forEach(c => {
                c.pos = toWorld(mousePos());
            });
        }
        else {
            getConstraints(selected).forEach(c => (removeConstraint(c)));
            const balls = get("ball");
            for (const ball of balls) {
                if (ball === selected) {
                    continue;
                }
                if (ball.pos.dist(selected.pos) < 120) {
                    const c = getConstraint(ball, selected);
                    if (!c) {
                        addConstraint(
                            distanceConstraint(
                                ball,
                                selected,
                                ball.pos.dist(selected.pos),
                            ),
                        );
                    }
                }
            }
        }
    }
});

debug.log("g: toggle gravity s: toggle simulation");
debug.log("Right button: disconnect and drag");
debug.log("Left button: drag");
debug.log("Red ball: sticky");
debug.log("White ball: falls");
