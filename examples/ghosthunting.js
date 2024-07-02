kaplay({
    width: 1024,
    height: 768,
    letterbox: true,
});

loadSprite("bean", "./sprites/bean.png");
loadSprite("gun", "./sprites/gun.png");
loadSprite("ghosty", "./sprites/ghosty.png");
loadSprite("hexagon", "./sprites/particle_hexagon_filled.png");
loadSprite("star", "./sprites/particle_star_filled.png");

const nav = new NavMesh();
// Hallway
nav.addPolygon([vec2(20, 20), vec2(1004, 20), vec2(620, 120), vec2(20, 120)]);
// Living room
nav.addPolygon([
    vec2(620, 120),
    vec2(1004, 20),
    vec2(1004, 440),
    vec2(620, 140),
]);
nav.addPolygon([vec2(20, 140), vec2(620, 140), vec2(1004, 440), vec2(20, 440)]);
// Kitchen
nav.addPolygon([vec2(20, 460), vec2(320, 460), vec2(320, 748), vec2(20, 748)]);
nav.addPolygon([
    vec2(320, 440),
    vec2(420, 440),
    vec2(420, 748),
    vec2(320, 748),
]);
nav.addPolygon([
    vec2(420, 460),
    vec2(620, 460),
    vec2(620, 748),
    vec2(420, 748),
]);
// Storage room
nav.addPolygon([
    vec2(640, 460),
    vec2(720, 460),
    vec2(720, 748),
    vec2(640, 748),
]);
nav.addPolygon([
    vec2(720, 440),
    vec2(820, 440),
    vec2(820, 748),
    vec2(720, 748),
]);
nav.addPolygon([
    vec2(820, 460),
    vec2(1004, 460),
    vec2(1004, 748),
    vec2(820, 748),
]);

// Border
add([
    pos(0, 0),
    rect(20, height()),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
add([
    pos(0, 0),
    rect(width(), 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
add([
    pos(width() - 20, 0),
    rect(20, height()),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
add([
    pos(0, height() - 20),
    rect(width(), 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
// Hallway
add([
    pos(20, 20),
    rect(600, 100),
    color(rgb(128, 64, 64)),
    "floor",
]);
add([
    pos(20, 120),
    rect(600, 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
// Living room
add([
    pos(20, 140),
    rect(600, 300),
    color(rgb(64, 64, 128)),
    "floor",
]);
add([
    pos(620, 20),
    rect(384, 420),
    color(rgb(64, 64, 128)),
    "floor",
]);
add([
    pos(20, 440),
    rect(300, 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
add([
    pos(420, 440),
    rect(300, 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
add([
    pos(820, 440),
    rect(300, 20),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
// Kitchen
add([
    pos(320, 440),
    rect(100, 20),
    color(rgb(128, 128, 64)),
    "floor",
]);
add([
    pos(20, 460),
    rect(600, 288),
    color(rgb(128, 128, 64)),
    "floor",
]);
add([
    pos(620, 460),
    rect(20, 288),
    area(),
    body({ isStatic: true }),
    color(rgb(128, 128, 128)),
    "wall",
]);
// Storage
add([
    pos(720, 440),
    rect(100, 20),
    color(rgb(64, 128, 64)),
    "floor",
]);
add([
    pos(640, 460),
    rect(364, 288),
    color(rgb(64, 128, 64)),
    "floor",
]);

const player = add([
    pos(50, 50),
    sprite("bean"),
    anchor(vec2(0, 0)),
    area(),
    body(),
    "player",
]);

const gun = player.add([
    sprite("gun"),
    anchor(vec2(-2, 0)),
    rotate(0),
    "player",
]);

function addEnemy(p) {
    const enemy = add([
        {
            add() {
                this.onHurt(() => {
                    this.opacity = this.hp() / 100;
                });
                this.onDeath(() => {
                    const rect = this.localArea();
                    rect.pos = rect.pos.sub(rect.width / 2, rect.height / 2);
                    const dissipate = add([
                        pos(this.pos),
                        particles({
                            max: 20,
                            speed: [50, 100],
                            angle: [0, 360],
                            angularVelocity: [45, 90],
                            lifeTime: [1.0, 1.5],
                            colors: [rgb(128, 128, 255), WHITE],
                            opacities: [0.1, 1.0, 0.0],
                            texture: getSprite("star").data.tex,
                            quads: [getSprite("star").data.frames[0]],
                        }, {
                            lifetime: 1.5,
                            shape: rect,
                            rate: 0,
                            direction: -90,
                            spread: 0,
                        }),
                    ]);
                    dissipate.emit(20);
                    dissipate.onEnd(() => {
                        destroy(dissipate);
                    });
                    destroy(this);
                });
                this.onObjectsSpotted(objects => {
                    const playerSeen = objects.some(o => o.is("player"));
                    if (playerSeen) {
                        enemy.action = "pursuit";
                        enemy.waypoints = null;
                    }
                });
                this.onPatrolFinished(() => {
                    enemy.action = "observe";
                });
            },
        },
        pos(p),
        sprite("ghosty"),
        opacity(1),
        anchor(vec2(0, 0)),
        area(),
        body(),
        // Health provides properties and methods to keep track of the enemies health
        health(100),
        // Sentry makes it easy to check for visibility of the player
        sentry({ includes: "player" }, {
            lineOfSight: true,
            raycastExclude: ["enemy"],
        }),
        // Patrol can make the enemy follow a computed path
        patrol({ speed: 100 }),
        // Navigator can compute a path given a graph
        navigation({
            graph: nav,
            navigationOpt: {
                type: "edges",
            },
        }),
        "enemy",
        { action: "observing", waypoint: null },
    ]);
    return enemy;
}

addEnemy(vec2(width() * 3 / 4, height() / 2));
addEnemy(vec2(width() * 1 / 4, height() / 2));
addEnemy(vec2(width() * 1 / 4, height() * 2 / 3));
addEnemy(vec2(width() * 0.8, height() * 2 / 3));

let path;
onUpdate("enemy", enemy => {
    switch (enemy.action) {
        case "observe": {
            break;
        }
        case "pursuit": {
            if (enemy.hasLineOfSight(player)) {
                // We can see the player, just go straight to their location
                enemy.moveTo(player.pos, 100);
            } else {
                // We can't see the player, but we know where they are, plot a path
                path = enemy.navigateTo(player.pos);
                // enemy.waypoint = path[1];
                enemy.waypoints = path;
                enemy.action = "observe";
            }
            break;
        }
    }
});

const SPEED = 100;

const dirs = {
    "left": LEFT,
    "right": RIGHT,
    "up": UP,
    "down": DOWN,
    "a": LEFT,
    "d": RIGHT,
    "w": UP,
    "s": DOWN,
};

for (const dir in dirs) {
    onKeyDown(dir, () => {
        player.move(dirs[dir].scale(SPEED));
    });
}

onMouseMove(() => {
    gun.angle = mousePos().sub(player.pos).angle();
    gun.flipY = Math.abs(gun.angle) > 90;
});

onMousePress(() => {
    const flash = gun.add([
        pos(
            getSprite("gun").data.width * 1.5,
            Math.abs(gun.angle) > 90 ? 7 : -7,
        ),
        circle(10),
        color(YELLOW),
        opacity(0.5),
    ]);
    flash.fadeOut(0.5).then(() => {
        destroy(flash);
    });

    const dir = mousePos().sub(player.pos).unit().scale(1024);
    const hit = raycast(player.pos, dir, [
        "player",
    ]);
    if (hit) {
        const splatter = add([
            pos(hit.point),
            particles({
                max: 20,
                speed: [200, 250],
                lifeTime: [0.2, 0.75],
                colors: [WHITE],
                opacities: [1.0, 0.0],
                angle: [0, 360],
                texture: getSprite("hexagon").data.tex,
                quads: [getSprite("hexagon").data.frames[0]],
            }, {
                lifetime: 0.75,
                rate: 0,
                direction: dir.scale(-1).angle(),
                spread: 45,
            }),
        ]);
        splatter.emit(10);
        splatter.onEnd(() => {
            destroy(splatter);
        });
        if (hit.object && hit.object.is("enemy")) {
            hit.object.moveBy(dir.unit().scale(10));
            hit.object.hurt(20);
        }
    }
});
