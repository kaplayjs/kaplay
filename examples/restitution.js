/**
 * @file Restitution
 * @description How to make objects bounce
 * @difficulty 0
 * @tags physics
 * @minver 3001.0
 * @category concepts
 * @test
 */

kaplay({ scale: 0.5 });

loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");

setGravity(3200);

const level = addLevel([
    "@       =     ",
    "",
    "=======       ",
    "      =       ",
    "      =========",
], {
    tileWidth: 64,
    tileHeight: 64,
    pos: vec2(100, 200),
    tiles: {
        "@": () => [
            sprite("bean"),
            area({ friction: 0, restitution: 1 }),
            body(),
            anchor("bot"),
            "player",
        ],
        "=": () => [
            sprite("grass"),
            area({ friction: 0, restitution: 1 }),
            body({ isStatic: true }),
            anchor("bot"),
        ],
    },
});

const player = level.get("player")[0];
player.vel.x = 480;
debug.log(player.friction);
