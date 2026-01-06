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
loadSprite("box", "/sprites/box.png");
loadSprite("sturdybox", "/sprites/sturdybox.png");
loadSprite("steel", "/sprites/steel.png");

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
    "p": () => [sprite("bean"), z(1), scale(), anchor("center"), "player"],
    "b": () => [sprite("box"), z(1), scale(), anchor("center"), "box"],
    ".": () => [sprite("steel"), scale(), anchor("center"), "wall"],
    "s": () => [rect(64, 64), color(), scale(), anchor("center"), "sensor"],
};

let moves = 0;
let undos = 0;

let currentIdx = 0;
let boxesInSensors = 0;
let canMove = true;
let undoStack = []; // { dir, box }

let level;
let player;

const hasTag = (objs, tag) => objs.findIndex(obj => obj.is(tag)) !== -1;

const isBoxInSensor = (box) => hasTag(level.getAt(box.tilePos), "sensor");

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

    if (hasTag(occupant, "wall")) {
        tween(
            vec2(1.2),
            vec2(1),
            0.12,
            (p) => occupant[0].scale = p,
            easings.easeOutQuad,
        );

        return;
    }

    let box = null;

    if (hasTag(occupant, "box")) {
        box = occupant[0];

        // check if box is sturdy (already on sensor)
        if (
            level.get("sensor").some((sensor) =>
                level.getAt(sensor.tilePos).includes(box)
            )
        ) {
            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => occupant[0].scale = p,
                easings.easeOutQuad,
            );
            return;
        }

        const checkAtPos = occupant[0].tilePos.add(dir);

        // if there's an object at the position the box will get moved to
        const boxOccupants = level.getAt(checkAtPos);

        if (
            !boxOccupants[0]
            || boxOccupants[0].is("sensor") && !hasTag(boxOccupants, "box")
        ) {
            moveObj(box, dir);
            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => box.scale = p,
                easings.easeOutQuad,
            );

            if (boxOccupants[0]?.is("sensor")) {
                boxesInSensors++;
                tween(
                    vec2(1.2),
                    vec2(1),
                    0.12,
                    (p) => box.scale = p,
                    easings.easeOutQuad,
                );
            }
        }
        else {
            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => player.scale = p,
                easings.easeOutQuad,
            );

            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => box.scale = p,
                easings.easeOutQuad,
            );
            return;
        }

        if (isBoxInSensor(box)) box.sprite = "sturdybox";
        else box.sprite = "box";
    }

    moves++;
    moveObj(player, dir);
    tween(
        vec2(1.2),
        vec2(1),
        0.12,
        (p) => player.scale = p,
        easings.easeOutQuad,
    );

    undoStack.push({
        dir: dir,
        box: occupant[0],
    });

    boxesInSensors =
        level.get("sensor").map((sensor) =>
            hasTag(level.getAt(sensor.tilePos), "box")
        ).filter((el) => el == true).length;

    // if every sensor has a box in the same tile pos trigger win
    if (boxesInSensors == level.get("sensor").length) {
        currentIdx++;
        canMove = false;
        level.children.forEach((child, idx) => {
            tween(
                child.scale,
                vec2(0),
                0.05 * idx,
                (p) => child.scale = p,
                easings.easeInBack,
            );
        });
        wait(0.05 * level.children.length, () => {
            if (currentIdx > levels.length - 1) {
                go("win");
            }
            else go("game", currentIdx);
        });
    }
};

scene("game", (lvlIdx) => {
    moves = 0;
    undos = 0;
    undoStack = [];

    level = addLevel(levels[lvlIdx], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: tiles,
    });

    const levelSize = vec2(
        level.tileWidth() * level.numRows(),
        level.tileHeight() * level.numColumns(),
    );
    level.pos = center().sub(levelSize.scale(0.5));
    player = level.get("player")[0];

    level.children.forEach((child, idx) => {
        child.scale = vec2(0);
        tween(
            child.scale,
            vec2(1),
            0.07 * idx,
            (p) => child.scale = p,
            easings.easeOutBack,
        ).onEnd(() => {
            canMove = true;
        });
    });

    onButtonPress((button) => {
        if (!canMove) return;

        if (button == "left") move(vec2(-1, 0));
        else if (button == "right") move(vec2(1, 0));
        else if (button == "up") move(vec2(0, -1));
        else if (button == "down") move(vec2(0, 1));
    });

    onButtonPress("undo", () => {
        if (undoStack.length === 0) return;

        undos++;
        const move = undoStack.pop();

        // move player back
        moveObj(player, move.dir.scale(-1));
        tween(
            vec2(0.8),
            vec2(1),
            0.15,
            (p) => player.scale = p,
            easings.easeOutQuad,
        );

        // move box back if there was one
        if (move.box) {
            moveObj(move.box, move.dir.scale(-1));
            tween(
                vec2(0.8),
                vec2(1),
                0.15,
                (p) => move.box.scale = p,
                easings.easeOutQuad,
            );
            if (isBoxInSensor(move.box)) move.box.sprite = "sturdybox";
            else move.box.sprite = "box";
        }
    });
});

scene("win", () => {
    add([
        anchor("center"),
        pos(center().sub(0, 150)),
        text("Bravo!\n[small]You succesfully restocked soks[/small]", {
            size: 50,
            align: "center",
            styles: {
                "small": {
                    scale: vec2(0.8),
                },
            },
        }),
    ]);

    add([
        sprite("box"),
        scale(3),
        pos(center().add(0, 150)),
        anchor("center"),
    ]);

    // add particle of soks coming out of the box
});

go("game", currentIdx);
go("win");
