/**
 * @file Maze
 * @description How to create a maze using math and addLevel().
 * @difficulty 2
 * @tags math, game
 * @minver 4000.0
 * @category concepts
 * @test
 */

kaplay({
    scale: 0.5,
    background: [0, 0, 0],
});

loadSprite("bean", "sprites/bean.png");
loadSprite("steel", "sprites/steel.png");

const TILE_WIDTH = 64;
const TILE_HEIGHT = TILE_WIDTH;

const level = addLevel(
    [
        "########",
        "#      #",
        "#      #",
        "#      #",
        "#      #",
        "#      #",
        "#      #",
        "########",
    ],
    {
        tileWidth: TILE_WIDTH,
        tileHeight: TILE_HEIGHT,
        tiles: {
            "#": () => [sprite("steel"), tile({ isObstacle: true })],
        },
    },
);

let turnCost = 0;
let allowDiagonals = false;

const bean = level.spawn(
    [
        sprite("bean"),
        anchor("center"),
        pos(32, 32),
        tile(),
        agent({ speed: 640, allowDiagonals, turnCost }),
        "bean",
    ],
    1,
    1,
);

onClick(() => {
    const pos = mousePos();
    bean.setTarget(
        vec2(
            Math.floor(pos.x / TILE_WIDTH) * TILE_WIDTH + TILE_WIDTH / 2,
            Math.floor(pos.y / TILE_HEIGHT) * TILE_HEIGHT + TILE_HEIGHT / 2,
        ),
    );
});

onKeyPress("c", () => {
    turnCost = turnCost === 5 ? 0 : 5;
    bean.use(agent({ speed: 640, allowDiagonals, turnCost }));
    debug.log(`turnCost set to ${turnCost}`);
});

onKeyPress("d", () => {
    allowDiagonals = !allowDiagonals;
    bean.use(agent({ speed: 640, allowDiagonals, turnCost }));
    debug.log(`allowDiagonals set to ${allowDiagonals}`);
});

add([pos(0, 510), color(WHITE), text(`Press C to toggle "turnCost"`)]);
add([pos(0, 550), color(WHITE), text(`Press D to toggle "allowDiagonals"`)]);
