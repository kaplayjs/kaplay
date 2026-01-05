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
    buttons: {
        "left": { keyboard: ["left", "a"] },
        "down": { keyboard: ["down", "s"] },
        "up": { keyboard: ["up", "w"] },
        "right": { keyboard: ["right", "d"] },
        "undo": { keyboard: "z" },
    },
});

loadSprite("bean", "/sprites/bean.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");

let lvlIdx = 0;
let canMove = true;
let undoStack = []; // { dir, box }

const levels = [[
    ".......",
    ".ps sd.",
    ". b b .",
    ".     .",
    ".......",
], [
    "........",
    ". p.   .",
    ".  b   .",
    ".  .  ..",
    ".s .  .",
    ".......",
], [
    " ......",
    "..s   ..",
    ".  .b  .",
    ".  bs  .",
    ". p   ..",
    "..  ... ",
    " ....   ",
]];

const tiles = {
    "p": () => [sprite("bean"), z(1), "player"],
    "b": () => [sprite("grass"), z(1), "box"],
    ".": () => [sprite("steel"), "wall"],
    "s": () => [rect(64, 64), color(), "sensor"],
};

let level = addLevel(levels[lvlIdx], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: tiles,
});

let player = level.get("player")[0];

const hasTag = (objs, tag) => objs.findIndex(obj => obj.is(tag)) !== -1;

const moveObj = (obj, dir) => {
    if (dir.x == 1) obj.moveRight();
    if (dir.x == -1) obj.moveLeft();
    if (dir.y == 1) obj.moveDown();
    if (dir.y == -1) obj.moveUp();
};

const move = (dir) => {
    const playerNewPos = player.tilePos.add(dir);

    // the object that exists at the position the player is going to move to
    const occupant = level.getAt(playerNewPos).filter((obj) =>
        !obj.is("sensor")
    );

    if (hasTag(occupant, "wall")) return;

    let box = null;

    if (hasTag(occupant, "box")) {
        box = occupant[0];
        const checkAtPos = occupant[0].tilePos.add(dir);

        // if there's an object at the position the box will get moved to
        const boxOccupant = level.getAt(checkAtPos).filter((obj) =>
            !obj.is("sensor")
        );

        if (boxOccupant.length == 0) {
            moveObj(box, dir);
        }
        else return;
    }

    moveObj(player, dir);

    undoStack.push({
        dir: dir,
        box: occupant[0],
    });

    console.log(undoStack);

    // if every sensor has a box in the same tile pos trigger win
    const allSensors = level.children.filter((c) => c.is("sensor"));
    if (
        allSensors.every((sensor) =>
            level.getAt(sensor.tilePos).some((obj) => obj.is("box"))
        )
    ) {
        win();
    }
};

const win = () => {
    canMove = false;

    level.destroy();
    level = null;
    undoStack = [];

    if (lvlIdx == levels.length - 1) {
        add([
            text("YOU WON!!"),
        ]);
        return;
    }

    lvlIdx++;
    level = addLevel(levels[lvlIdx], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: tiles,
    });
    player = level.get("player")[0];
    canMove = true;
};

onButtonPress((button) => {
    if (!canMove) return;

    if (button == "left") move(vec2(-1, 0));
    else if (button == "right") move(vec2(1, 0));
    else if (button == "up") move(vec2(0, -1));
    else if (button == "down") move(vec2(0, 1));
});

onButtonPress("undo", () => {
    if (undoStack.length === 0) return;

    const move = undoStack.pop();

    // move player back
    moveObj(player, move.dir.scale(-1));

    // move box back if there was one
    if (move.box) moveObj(move.box, move.dir.scale(-1));
});
