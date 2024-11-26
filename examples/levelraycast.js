// @ts-check

kaplay({
    background: [31, 16, 42],
});

loadSprite("grass", "/sprites/grass.png");

const level = addLevel([
    "===",
    "= =",
    "===",
], {
    tileWidth: 64,
    tileHeight: 64,
    pos: vec2(256, 128),
    tiles: {
        "=": () => [
            sprite("grass"),
            area(),
        ],
    },
});
level.use(rotate(45));

onLoad(() => {
    level.spawn([
        pos(
            level.tileWidth() * 1.5,
            level.tileHeight() * 1.5,
        ),
        circle(6),
        color("#ea6262"),
        {
            add() {
                const rayHit = level.raycast(
                    this.pos,
                    Vec2.fromAngle(0).scale(100),
                );

                debug.log(
                    `${rayHit != null} ${
                        rayHit && rayHit.object ? rayHit.object.id : -1
                    }`,
                );
            },
        },
    ]);
});

debug.inspect = true;
