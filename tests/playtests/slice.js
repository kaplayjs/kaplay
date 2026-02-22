/**
 * @file Slice
 * @description How to make an "slice" game in KAPLAY.
 * @difficulty 2
 * @tags game
 * @minver 4000.0
 */

kaplay();

setGravity(200);

const fruits = [
    "apple",
    "pineapple",
    "grape",
    "watermelon",
];

loadBean();
for (const fruit of fruits) {
    loadSprite(fruit, `/sprites/${fruit}.png`);
}

let score = 0;

const scoreLabel = add([
    text(`${score}`),
    pos(24, 24),
    fixed(),
]);

/**
 * Component to give us angular velocity
 */
function torque() {
    let _angularVelocity = 0;
    return {
        id: "torque",
        requires: ["rotate"],
        applyAngularImpulse(angularVelocity) {
            _angularVelocity += angularVelocity;
        },
        update() {
            this.angle += _angularVelocity * dt();
        },
    };
}

onKeyPress(() => {
    if (rand(1) < 0.1) {
        const fruit = add([
            pos(rand(0, width()), height()),
            sprite("bean"),
            // We need an area, in order to know the screen polygon to cut
            area({ collisionIgnore: ["fruit", "bean"] }),
            body(),
            rotate(rand(0, 360)),
            torque(),
            offscreen({ destroy: true }),
            "fruit",
            "bean",
        ]);

        fruit.applyImpulse(
            vec2(width() / 2, height() / 4).sub(fruit.pos).unit().scale(500),
        );
        fruit.applyAngularImpulse(45);
    }
    else {
        const fruit = add([
            pos(rand(0, width()), height()),
            sprite(choose(fruits)),
            // We need an area, in order to know the screen polygon to cut
            area({ collisionIgnore: ["fruit", "bean"] }),
            body(),
            rotate(rand(0, 360)),
            torque(),
            offscreen({ destroy: true }),
            "fruit",
        ]);

        fruit.applyImpulse(
            vec2(width() / 2, height() / 4).sub(fruit.pos).unit().scale(500),
        );
        fruit.applyAngularImpulse(45);
    }
});

let sliceTrail = [];
onMousePress(() => {
    sliceTrail.push(mousePos());
});

onMouseMove(() => {
    if (isMouseDown()) {
        sliceTrail.push(mousePos());
        if (sliceTrail.length > 16) {
            sliceTrail.shift();
        }
    }
});

onDraw(() => {
    drawLines({
        color: BLACK,
        width: 2,
        pts: sliceTrail,
    });
});

onMouseRelease(() => {
    for (let trailIndex = 0; trailIndex < sliceTrail.length - 1; trailIndex++) {
        const line = new Line(
            sliceTrail[trailIndex],
            sliceTrail[trailIndex + 1],
        );
        const fruits = get("fruit");
        fruits.forEach(fruit => {
            const shape = fruit.screenArea();
            // If the line crosses the screen rectangle
            if (line.collides(shape)) {
                const fruitFrame0 = getSprite(fruit.sprite)?.data.frames[0];
                const q = fruitFrame0.q;
                const srcUv = [
                    vec2(q.x, q.y),
                    vec2(q.x + q.w, q.y),
                    vec2(q.x + q.w, q.y + q.h),
                    vec2(q.x, q.y + q.h),
                ];
                // Cut the polygon according to the line
                const dstUv = [[], []];
                const polygons = shape.cut(line.p1, line.p2, srcUv, dstUv);
                if (polygons.length < 2) return;
                // Make a new object for each polygon
                polygons.forEach((poly, index) => {
                    // This works for convex polygons
                    const center = poly.pts.reduce((s, p) => p.add(s), vec2())
                        .scale(1 / poly.pts.length);
                    // Offset points so center is zero
                    const points = poly.pts.map((p) => p.sub(center));
                    const piece = add([
                        pos(fruit.pos),
                        polygon(points, {
                            uv: dstUv[index],
                            tex: spriteData.tex,
                        }),
                        body(),
                        rotate(0),
                        torque(),
                        offscreen({ destroy: true }),
                    ]);
                    const lineVec = line.p2.sub(line.p1);
                    // This gives us which side the center is from the line
                    const direction = Math.sign(
                        center.sub(line.p1).cross(lineVec),
                    );
                    // Give an impulse away from the line. The unit normal gives us the vector perpendicular to the line
                    // while the cross product gives us which side of the line the polygon is
                    piece.applyImpulse(
                        lineVec.normal().unit().scale(100 * direction),
                    );
                    piece.applyAngularImpulse(45 * direction);
                });
                destroy(fruit);
                score++;
                scoreLabel.text = `${score}`;
            }
        });
    }
    sliceTrail.length = 0;
});
