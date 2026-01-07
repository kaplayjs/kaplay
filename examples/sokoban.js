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
loadSprite("sok", "/sprites/sok.png");
loadSprite("sturdybox", "/sprites/sturdybox.png");
loadSprite("steel", "/sprites/steel.png");

/*
Sokoban is a puzzle game where
We have to place all the boxes in a sensor to continue the level
We'll code it according to this logic
*/

// We store the levels in an array
const levels = [
    [
        ".......",
        ".ps sd.",
        ". b b .",
        ".     .",
        ".......",
    ],
    [
        "........",
        ". p.   .",
        ".  b   .",
        ".  .  ..",
        ".s .  .",
        ".......",
    ],
    [
        "  ...   ",
        "  .s....",
        "...b bs.",
        ".s bp...",
        "....b.  ",
        "   .s.  ",
        "   ...  ",
    ],
    [
        " ......",
        "..s   ..",
        ".  .b  .",
        ".  bs  .",
        ". p   ..",
        "..  ... ",
        " ....   ",
    ],
];

// We store the definition of each tile
const tiles = {
    "p": () => [sprite("bean"), z(1), scale(), anchor("center"), "player"],
    "b": () => [sprite("box"), z(1), scale(), anchor("center"), "box"],
    ".": () => [sprite("steel"), scale(), anchor("center"), "wall"],
    "s": () => [rect(64, 64), color(), scale(), anchor("center"), "sensor"],
};

// We define some variables
let moves = 0;
let undos = 0;

let currentIdx = 2;
let boxesInSensors = 0;
let canMove = true;

// Will store the direction of our movements and if we pushed a box
let undoStack = [];

let level;
let player;

// Whether any object in an array has a certain tag
const hasTag = (objs, tag) => objs.findIndex(obj => obj.is(tag)) !== -1;

// Wheter a box is in a sensor by checking if the objects at the same position include a sensor
const isBoxInSensor = (box) => hasTag(level.getAt(box.tilePos), "sensor");

// Move an object in a certain direction
const moveObj = (obj, dir) => {
    if (dir.x == 1) obj.moveRight();
    if (dir.x == -1) obj.moveLeft();
    if (dir.y == 1) obj.moveDown();
    if (dir.y == -1) obj.moveUp();
};

// The "update" function in our game that runs everytime we make a move
const move = (dir) => {
    // The new position the player will be in
    const playerNewPos = player.tilePos.add(dir);

    // The objects that exists at the position the player is going to move to
    const occupants = level.getAt(playerNewPos).filter((obj) =>
        !obj.is("sensor")
    );

    // If occupants is a wall we simply return and don't do anything else
    if (hasTag(occupants, "wall")) {
        tween(
            vec2(1.2),
            vec2(1),
            0.12,
            (p) => player.scale = p,
            easings.easeOutQuad,
        );

        return;
    }

    // If the occupants include a box
    let box = null;
    if (hasTag(occupants, "box")) {
        box = occupants[0];

        // The occupants at the position the box would get moved to
        // (The same direction you moved to)
        const boxOccupants = level.getAt(occupants[0].tilePos.add(dir));

        // If there's no occupants or it's a sensor and there isn't a box at this place
        // You should be able to actually push the box
        if (
            !boxOccupants[0]
            || boxOccupants[0].is("sensor") && !hasTag(boxOccupants, "box")
        ) {
            // Push the box in the same direction and do a little tween
            moveObj(box, dir);
            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => box.scale = p,
                easings.easeOutQuad,
            );
        }
        // If you shouldn't be able to push the box, tween them to signal the push
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

        // If the box is in a sensor, make it sturdy to show that you can't move it anymore
        // (Unless you undo)
        if (isBoxInSensor(box)) box.sprite = "sturdybox";
        else box.sprite = "box";

        // Now let's re-calculate the amount of boxes in sensors
        // By checking how many sensors have a box at their position
        boxesInSensors = level.get("sensor").filter((sensor) =>
            hasTag(level.getAt(sensor.tilePos), "box")
        ).length;
    }

    // Move the player and tween it for little juice
    moves++;
    moveObj(player, dir);
    tween(
        vec2(1.2),
        vec2(1),
        0.12,
        (p) => player.scale = p,
        easings.easeOutQuad,
    );

    // Push the movement to the movement stack, so we can pop them afterwards
    // If there's a box it will be stored too, if it's null we won't do anything with it later
    undoStack.push({
        dir: dir,
        box: occupants[0],
    });

    // If every sensor has a box in the same tile pos, we won the level! Do a small ending animation
    // And let's re-start the scene with the next level, by increasing the index of the level used in the levels array
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
    // We restart everything
    moves = 0;
    undos = 0;
    undoStack = [];

    // We re-assign the level object using the lvlIdx passed on the scene
    level = addLevel(levels[lvlIdx], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: tiles,
    });

    player = level.get("player")[0];

    // We center the level on the screen
    const levelSize = vec2(
        level.tileWidth() * level.numRows(),
        level.tileHeight() * level.numColumns(),
    );
    level.pos = center().sub(levelSize.scale(0.5));

    // We go through every tile in the level and do a little animation to scale them in
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

    // The input for the game
    onButtonPress((button) => {
        if (!canMove) return;

        if (button == "left") move(vec2(-1, 0));
        else if (button == "right") move(vec2(1, 0));
        else if (button == "up") move(vec2(0, -1));
        else if (button == "down") move(vec2(0, 1));
    });

    // The undo action
    onButtonPress("undo", () => {
        // If there's no more movements to undo return
        if (undoStack.length === 0) return;

        undos++;
        const move = undoStack.pop();

        // We move the player to the opposite direction we moved before
        moveObj(player, move.dir.scale(-1));
        tween(
            vec2(0.8),
            vec2(1),
            0.15,
            (p) => player.scale = p,
            easings.easeOutQuad,
        );

        // If the move stored a box, we have to move it in the opposite direction too
        if (move.box) {
            moveObj(move.box, move.dir.scale(-1));
            tween(
                vec2(0.8),
                vec2(1),
                0.15,
                (p) => move.box.scale = p,
                easings.easeOutQuad,
            );
            // We re-check if it was sturdy, if it's not sturdy anymore we change the sprite back
            if (isBoxInSensor(move.box)) move.box.sprite = "sturdybox";
            else move.box.sprite = "box";
        }
    });
});

scene("win", () => {
    add([
        anchor("center"),
        pos(center().sub(0, 200)),
        text("Bravo!", {
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
        anchor("center"),
        pos(center().sub(0, 150)),
        text("You succesfully re-stocked the soks!", {
            size: 40,
            align: "center",
        }),
    ]);

    add([
        anchor("center"),
        pos(center().sub(0, 75)),
        text("Press any key to play again", {
            size: 40,
            align: "center",
        }),
    ]);

    const sok = add([
        sprite("sok"),
        scale(0),
        pos(center().add(0, 150)),
        anchor("center"),
    ]);

    add([
        sprite("box"),
        scale(3),
        pos(center().add(0, 150)),
        anchor("center"),
    ]);

    tween(
        sok.scale,
        vec2(2),
        1,
        (p) => sok.scale = p,
        easings.easeOutExpo,
    );

    tween(
        sok.pos,
        center(),
        1,
        (p) => sok.pos = p,
        easings.easeOutExpo,
    );
});

go("game", currentIdx);
