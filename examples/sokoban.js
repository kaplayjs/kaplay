/**
 * @file Sokoban
 * @description How to make a sokoban-like game in KAPLAY.
 * @difficulty 1
 * @tags game
 * @minver 3001.0
 * @category games
 */

kaplay({
    background: [45, 33, 51],
});

loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");

const level = addLevel([
    ".......",
    ".p   d.",
    ". b b .",
    ".     .",
    ".......",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        p: () => [sprite("bean"), "player"],
        b: () => [sprite("grass"), "box"],
        ".": () => [sprite("steel"), "wall"],
    },
});

const player = level.get("player")[0];

const hasTag = (objs, tag) => objs.findIndex(obj => obj.is(tag)) !== -1;

const moveObj = (obj, dir) => {
    if (dir.x == 1) obj.moveRight();
    if (dir.x == -1) obj.moveLeft();
    if (dir.y == 1) obj.moveDown();
    if (dir.y == -1) obj.moveUp();
};

const move = (dir) => {
    const moveTo = player.tilePos.add(dir);
    const occupant = level.getAt(moveTo);

    if (hasTag(occupant, "wall")) {
        return;
    }

    if (hasTag(occupant, "box")) {
        const boxMoveTo = occupant[0].tilePos.add(dir);
        const boxOccupant = level.getAt(boxMoveTo);

        if (boxOccupant.length !== 0) {
            return;
        }

        moveObj(occupant[0], dir);
    }

    moveObj(player, dir);
};

onKeyPress("d", () => {
    move(vec2(1, 0));
});

onKeyPress("a", () => {
    move(vec2(-1, 0));
});

onKeyPress("w", () => {
    move(vec2(0, -1));
});

onKeyPress("s", () => {
    move(vec2(0, 1));
});
