kaplay({
    width: 1024,
    height: 768,
    letterbox: true,
});

loadSprite("bean", "./sprites/bean.png");
loadSprite("gun", "./sprites/gun.png");
loadSprite("ghosty", "./sprites/ghosty.png");

const nav = new NavMesh();
nav.addPolygon([vec2(20, 20), vec2(1004, 20), vec2(620, 120), vec2(20, 120)]);
nav.addPolygon([
    vec2(620, 120),
    vec2(1004, 20),
    vec2(1004, 440),
    vec2(620, 140),
]);
nav.addPolygon([vec2(20, 140), vec2(620, 140), vec2(1004, 440), vec2(20, 440)]);

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
                    console.log(this.hp());
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
                            lifeTime: [1.0, 1.5],
                            colors: [rgb(128, 128, 255), WHITE],
                            opacities: [0.1, 1.0, 0.0],
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
            },
        },
        pos(p),
        sprite("ghosty"),
        opacity(1),
        anchor(vec2(0, 0)),
        area(),
        body(),
        health(100),
        "enemy",
        { action: "patrolling", waypoint: null },
    ]);
    return enemy;
}

addEnemy(vec2(width() * 3 / 4, height() / 2));
addEnemy(vec2(width() * 1 / 4, height() / 2));

let path;
onUpdate("enemy", enemy => {
    switch (enemy.action) {
        case "patrolling": {
            const hit = raycast(enemy.pos, player.pos.sub(enemy.pos), [
                "enemy",
            ]);
            if (hit && hit.object.is("player")) {
                // We saw a player, start pursuit
                enemy.action = "moving";
            }
            break;
        }
        case "moving": {
            const hit = raycast(enemy.pos, player.pos.sub(enemy.pos), [
                "enemy",
            ]);
            if (hit && hit.object.is("player")) {
                // We can see the player, just go straight to their location
                enemy.moveTo(player.pos, 100);
            } else {
                // We can't see the player, but we know where they are, plot a path
                path = nav.getWaypointPath(enemy.pos, player.pos, {
                    type: "edges",
                });
                enemy.waypoint = path[1];
                enemy.action = "waypoint";
            }
            break;
        }
        case "waypoint": {
            if (enemy.pos.sub(enemy.waypoint).slen() < 4) {
                // We are at the waypoint, check if we see the player
                path = null;
                enemy.action = "moving";
            } else {
                // Move closer to the waypoint
                enemy.moveTo(enemy.waypoint, 100);
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
                lifeTime: [0.2, 0.5],
                colors: [WHITE],
            }, {
                lifetime: 0.5,
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

/*onDraw(() => {
    drawPolygon({
        pts: [vec2(20, 20), vec2(1004, 20), vec2(620, 120), vec2(20, 120)],
        fill: false,
        outline: { color: RED, width: 4 }
    })
    drawPolygon({
        pts: [vec2(620, 120), vec2(1004, 20), vec2(1004, 440), vec2(620, 140)],
        fill: false,
        outline: { color: RED, width: 4 }
    })
    drawPolygon({
        pts: [vec2(20, 140), vec2(620, 140), vec2(1004, 440), vec2(20, 440)],
        fill: false,
        outline: { color: RED, width: 4 }
    })
    if (path) {
        path.forEach((p, index) => {
            drawCircle({
                pos: p,
                radius: 4,
                color: index == 1 ? GREEN : BLUE
            })
        });
    }
})*/
