// @ts-check

// Start kaplay
kaplay();

// load assets
let bean;
let objSlices = [];
let wall;
let slices = [];
loadSprite("bean", "sprites/bean.png");
loadSprite("wall", "sprites/brick_wall.png");

onLoad(() => {
    bean = getSprite("bean").data;
    for (let i = 0; i < bean.width; i++) {
        objSlices.push(
            bean.frames[0].scale(
                new Quad(i / bean.width, 0, 1 / bean.width, 1),
            ),
        );
    }

    wall = getSprite("wall").data;
    for (let i = 0; i < wall.width; i++) {
        slices.push(
            wall.frames[0].scale(
                new Quad(i / wall.width, 0, 1 / wall.width, 1),
            ),
        );
    }
});

function rayCastGrid(origin, direction, gridPosHit, maxDistance = 64) {
    const pos = origin;
    const len = direction.len();
    const dir = direction.scale(1 / len);
    let t = 0;
    let gridPos = vec2(Math.floor(origin.x), Math.floor(origin.y));
    const step = vec2(dir.x > 0 ? 1 : -1, dir.y > 0 ? 1 : -1);
    const tDelta = vec2(Math.abs(1 / dir.x), Math.abs(1 / dir.y));
    let dist = vec2(
        (step.x > 0) ? (gridPos.x + 1 - origin.x) : (origin.x - gridPos.x),
        (step.y > 0) ? (gridPos.y + 1 - origin.y) : (origin.y - gridPos.y),
    );
    let tMax = vec2(
        (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
        (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
    );
    let steppedIndex = -1;
    while (t <= maxDistance) {
        const hit = gridPosHit(gridPos);
        if (hit === true) {
            return {
                point: pos.add(dir.scale(t)),
                normal: vec2(
                    steppedIndex === 0 ? -step.x : 0,
                    steppedIndex === 1 ? -step.y : 0,
                ),
                t: t / len, // Since dir is normalized, t is len times too large
                gridPos,
            };
        }
        else if (hit) {
            return hit;
        }
        if (tMax.x < tMax.y) {
            gridPos.x += step.x;
            t = tMax.x;
            tMax.x += tDelta.x;
            steppedIndex = 0;
        }
        else {
            gridPos.y += step.y;
            t = tMax.y;
            tMax.y += tDelta.y;
            steppedIndex = 1;
        }
    }

    return null;
}

function raycastEdge(origin, direction, line) {
    const a = origin;
    const c = line.p1.add(line.pos);
    const d = line.p2.add(line.pos);
    const ab = direction;
    const cd = d.sub(c);
    let abxcd = ab.cross(cd);
    // If parallel, no intersection
    if (Math.abs(abxcd) < Number.EPSILON) {
        return false;
    }
    const ac = c.sub(a);
    const s = ac.cross(cd) / abxcd;
    // s is the percentage of the position of the intersection on cd
    if (s <= 0 || s >= 1) {
        return false;
    }
    const t = ac.cross(ab) / abxcd;
    // t is the percentage of the position of the intersection on ab
    if (t <= 0 || t >= 1) {
        return false;
    }

    const normal = cd.normal().unit();
    if (direction.dot(normal) > 0) {
        normal.x *= -1;
        normal.y *= -1;
    }

    return {
        point: a.add(ab.scale(s)),
        normal: normal,
        t: s,
        s: t,
        object: line,
    };
}

function rayCastAsciiGrid(origin, direction, grid) {
    origin = origin.scale(1 / 16);
    direction = direction.scale(1 / 16);
    const objects = [];
    const hit = rayCastGrid(origin, direction, ({ x, y }) => {
        if (y >= 0 && y < grid.length) {
            const row = grid[y];
            if (x >= 0 && x < row.length) {
                if (row[x] === "&") {
                    const perp = direction.normal().unit();
                    const planeP1 = perp.scale(-0.2);
                    const planeP2 = perp.scale(0.2);
                    const objectHit = raycastEdge(origin, direction, {
                        pos: vec2(x + 0.5, y + 0.5),
                        p1: planeP1,
                        p2: planeP2,
                    });
                    if (objectHit) {
                        objects.push(objectHit);
                    }
                }
                return row[x] !== " " && row[x] !== "&";
            }
        }
    }, direction.len());
    if (hit) {
        hit.point = hit.point.scale(16);
        hit.object = { color: colors[grid[hit.gridPos.y][hit.gridPos.x]] };
        hit.objects = objects;
    }
    return hit;
}

const colors = {
    "#": RED,
    "$": GREEN,
    "%": BLUE,
    "&": YELLOW,
};

const grid = [
    "##################",
    "#                #",
    "# $$$$$$$ $$$$$$ #",
    "# $            $ #",
    "# $ %% %%%%%%% $ #",
    "# $ %        % $ #",
    "#&$&%%%%%  %%%&$&#",
    "# $ %          $ #",
    "# $ %%%%%%%%%%   #",
    "# $            $ #",
    "# $$$$$$$ $$$$$$ #",
    "#          &     #",
    "##################",
];

const camera = add([
    pos(7 * 16, 11 * 16 + 8),
    rotate(0),
    z(-1),
    rect(8, 8),
    anchor("center"),
    area(),
    opacity(0),
    body(),
    {
        draw() {
            pushTransform();
            pushRotate(-this.angle);
            drawCircle({
                pos: vec2(),
                radius: 4,
                color: RED,
            });
            const dir = Vec2.fromAngle(this.angle);
            const perp = dir.normal();
            const planeP1 = this.pos.add(dir.scale(this.focalLength)).add(
                perp.scale(this.fov),
            ).sub(this.pos);
            const planeP2 = this.pos.add(dir.scale(this.focalLength)).sub(
                perp.scale(this.fov),
            ).sub(this.pos);
            drawLine({
                p1: planeP1,
                p2: planeP2,
                width: 1,
                color: RED,
            });
            pushTranslate(this.pos.scale(-1).add(300, 50));
            drawRect({
                width: 240,
                height: 120,
                color: rgb(100, 100, 100),
            });
            drawRect({
                pos: vec2(0, 120),
                width: 240,
                height: 120,
                color: rgb(128, 128, 128),
            });
            for (let x = 0; x <= 120; x++) {
                let direction = lerp(planeP1, planeP2, x / 120).scale(6);
                const hit = rayCastAsciiGrid(this.pos, direction, grid);
                if (hit) {
                    const t = hit.t;
                    // Distance to attenuate light
                    const d = (1 - t)
                        * ((hit.normal.x + hit.normal.y) < 0 ? 0.5 : 1);
                    // Horizontal texture slice
                    let u = Math.abs(hit.normal.x) > Math.abs(hit.normal.y)
                        ? hit.point.y
                        : hit.point.x;
                    u = (u % 16) / 16;
                    u = u - Math.floor(u);
                    // Height of the wall
                    const h = 240 / (t * direction.len() / 16);

                    drawUVQuad({
                        width: 2,
                        height: h,
                        pos: vec2(x * 2, 120 - h / 2),
                        tex: wall.tex,
                        quad: slices[Math.round(u * (wall.width - 1))],
                        color: BLACK.lerp(WHITE, d),
                    });

                    // If we hit any objects
                    if (hit.objects) {
                        hit.objects.reverse().forEach(o => {
                            const t = o.t;
                            // Wall and object height
                            const wh = 240 / (t * direction.len() / 16);
                            const oh = 140 / (t * direction.len() / 16);
                            // Slice to render
                            let u = o.s;
                            drawUVQuad({
                                width: 2,
                                height: oh,
                                pos: vec2(x * 2, 120 + wh / 2 - oh),
                                tex: bean.tex,
                                quad:
                                    objSlices[Math.round(u * (bean.width - 1))],
                                color: BLACK.lerp(WHITE, u),
                            });
                        });
                    }
                }
            }
            popTransform();
        },
        focalLength: 40,
        fov: 10,
    },
]);

addLevel(grid, {
    pos: vec2(0, 0),
    tileWidth: 16,
    tileHeight: 16,
    tiles: {
        "#": () => [
            rect(16, 16),
            color(RED),
            area(),
            body({ isStatic: true }),
        ],
        "$": () => [
            rect(16, 16),
            color(GREEN),
            area(),
            body({ isStatic: true }),
        ],
        "%": () => [
            rect(16, 16),
            color(BLUE),
            area(),
            body({ isStatic: true }),
        ],
        "&": () => [
            pos(4, 4),
            rect(8, 8),
            color(YELLOW),
        ],
    },
});

onKeyDown("up", () => {
    camera.move(Vec2.fromAngle(camera.angle).scale(40));
});

onKeyDown("down", () => {
    camera.move(Vec2.fromAngle(camera.angle).scale(-40));
});

onKeyDown("left", () => {
    camera.angle -= 90 * dt();
});

onKeyDown("right", () => {
    camera.angle += 90 * dt();
});

onKeyDown("f", () => {
    camera.focalLength = Math.max(1, camera.focalLength - 10 * dt());
});

onKeyDown("g", () => {
    camera.focalLength += 10 * dt();
});

onKeyDown("r", () => {
    camera.fov = Math.max(1, camera.fov - 10 * dt());
});

onKeyDown("t", () => {
    camera.fov += 10 * dt();
});

onKeyDown("p", () => {
    debug.paused = !debug.paused;
});

let lastPos = vec2();

onTouchStart(pos => {
    lastPos = pos;
});

onTouchMove(pos => {
    const delta = pos.sub(lastPos);
    if (delta.x < 0) {
        camera.angle -= 90 * dt();
    }
    else if (delta.x > 0) {
        camera.angle += 90 * dt();
    }
    if (delta.y < 0) {
        camera.move(Vec2.fromAngle(camera.angle).scale(40));
    }
    else if (delta.y > 0) {
        camera.move(Vec2.fromAngle(camera.angle).scale(-40));
    }
    lastPos = pos;
});
