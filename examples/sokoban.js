/**
 * @file Sokoban
 * @description How to make a sokoban-like game in KAPLAY.
 * @difficulty 1
 * @tags game
 * @minver 3001.0
 * @category games
 */

/*
Sokoban is a puzzle game where
We have to place all the boxes in a sensor to continue the level
We'll code it according to this logic
*/

kaplay({
    font: "happy",
    background: [45, 33, 51],
    buttons: {
        "left": { keyboard: ["left", "a"] },
        "down": { keyboard: ["down", "s"] },
        "up": { keyboard: ["up", "w"] },
        "right": { keyboard: ["right", "d"] },
        "undo": { keyboard: "z" },
    },
});

loadHappy();
loadSprite("bean", "/sprites/bean.png");
loadSprite("box", "/sprites/box.png");
loadSprite("sturdybox", "/sprites/sturdybox.png");
loadSprite("target", "/sprites/box_target.png");
loadSprite("sok", "/sprites/sok.png");
loadSprite("steel", "/sprites/steel.png");
loadSound("chirp", "/sounds/bean_move.wav");
loadSound("movebox", "/sounds/movebox.wav");
loadSound("explode", "/sounds/explode.mp3");

loadShader(
    "checker",
    null,
    `
    uniform float tileSize;
    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
        return mod(floor(pos.x / tileSize) + floor(pos.y / tileSize), 2.0) == 0.0
            ? vec4(0) 
            : vec4(0, 0, 0, 0.15);
    }
`,
);

const tileSize = 64;

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
    "s": () => [sprite("target"), color(), scale(), anchor("center"), "sensor"],
};

// We define some variables
let movesTotal = 0;
let moves = 0;
let undos = 0;

let currentIdx = 0;
let boxesInSensors = 0;
let canMove = true;

// Will store the direction of our movements and if we pushed a box
let undoStack = [];

let level;
let player;
let moveCounter;

// Whether any object in an array has a certain tag
const hasTag = (objs, tag) => objs.some(obj => obj.is(tag));

// Wheter a box is in a sensor by checking if the objects at the same position include a sensor
const isBoxInSensor = (box) => hasTag(level.getAt(box.tilePos), "sensor");

// Move an object in a certain direction
const moveObj = (obj, dir) => {
    if (dir.x == 1) obj.moveRight();
    if (dir.x == -1) obj.moveLeft();
    if (dir.y == 1) obj.moveDown();
    if (dir.y == -1) obj.moveUp();
};

// The "update" function in our game that runs every time we make a move
const move = (dir) => {
    // The new position the player will be in
    const playerNewPos = player.tilePos.add(dir);

    // The objects that exist at the position the player is going to move to
    const occupants = level.getAt(playerNewPos).filter((obj) =>
        !obj.is("sensor")
    );

    // If occupants includes a wall we simply return and don't do anything else
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

        // If there're no occupants, or if there's a sensor and no box at this place
        if (
            !boxOccupants[0]
            || boxOccupants[0].is("sensor") && !hasTag(boxOccupants, "box")
        ) {
            // Push the box in the same direction and do a little tween
            play("movebox", { detune: rand(0, 100) });
            moveObj(box, dir);
            tween(
                vec2(1.2),
                vec2(1),
                0.12,
                (p) => box.scale = p,
                easings.easeOutQuad,
            );
        }
        // If you shouldn't be able to push the box, but can keep the visual feedback
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

        // If the box is in a sensor, change its sprite to indicate it's in place
        box.sprite = isBoxInSensor(box) ? "sturdybox" : "box";
    }

    // Update and animate the counter
    moves++;
    movesTotal++;
    moveCounter.text = "Moves: " + moves;
    tween(
        vec2(1.05),
        vec2(1),
        0.12,
        (p) => moveCounter.scale = p,
        easings.easeOutQuad,
    );

    // Move the player and tween it for little juice
    play("chirp", { detune: rand(-500, -400) });
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

    // Now let's re-calculate the amount of boxes in sensors
    // By checking how many sensors have a box at their position
    boxesInSensors =
        level.get("sensor").filter((sensor) =>
            hasTag(level.getAt(sensor.tilePos), "box")
        ).length;

    // If every sensor has a box in the same tile pos, we won the level! Do a small ending animation
    // And let's re-start the scene with the next level, by increasing the index of the level used in the levels array
    if (boxesInSensors == level.get("sensor").length) {
        currentIdx++;
        canMove = false;

        // We say bye to the move counter
        tween(1, 0, 1, (p) => moveCounter.opacity = p, easings.easeOutExpo);
        tween(
            vec2(1),
            vec2(0),
            1,
            (p) => moveCounter.scale = p,
            easings.easeOutExpo,
        );

        // We animate the children too
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
    // Checkered background
    add([
        rect(width(), height()),
        shader("checker", { tileSize }),
    ]);

    // We restart everything
    moves = 0;
    undos = 0;
    undoStack = [];

    // We re-assign the level object using the lvlIdx passed on the scene
    level = addLevel(levels[lvlIdx], {
        tileWidth: tileSize,
        tileHeight: tileSize,
        tiles: tiles,
    });

    player = level.get("player")[0];

    // We center the level on the screen
    level.pos = vec2(
        Math.round(((width() - level.levelWidth()) / 2) / tileSize),
        Math.round(((height() - level.levelHeight()) / 2) / tileSize),
    ).scale(tileSize).add(tileSize / 2);

    // Simple move counter
    moveCounter = add([
        text("Moves: 0"),
        pos(level.pos.sub(tileSize / 2, tileSize - 18)),
        scale(1, 1),
        anchor("botleft"),
        opacity(),
    ]);

    // We go through every tile in the level and do a little animation to scale them in
    level.children.forEach((child, idx) => {
        child.scale = vec2(0);
        tween(
            child.scale,
            vec2(1),
            0.07 * idx,
            (p) => child.scale = p,
            easings.easeOutBack,
        );
    });

    // Waits until most of the tweens are over to allow movement again
    wait(0.07 * level.children.length / 4, () => {
        canMove = true;
    });

    // We also animate the move counter
    tween(0, 1, 0.5, (p) => moveCounter.opacity = p, easings.easeOutExpo);
    tween(
        vec2(0),
        vec2(1),
        0.5,
        (p) => moveCounter.scale = p,
        easings.easeOutExpo,
    );

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
        play("chirp", { detune: rand(-500, -400) });
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
            play("movebox", { detune: rand(0, 100) });

            tween(
                vec2(0.8),
                vec2(1),
                0.15,
                (p) => move.box.scale = p,
                easings.easeOutQuad,
            );

            // We re-check if it was in a sensor and set the sprite accordingly
            move.box.sprite = isBoxInSensor(move.box) ? "sturdybox" : "box";
        }
    });
});

scene("win", () => {
    play("explode", { volume: 0.25 });

    // Checkered background
    add([
        rect(width(), height()),
        shader("checker", { tileSize }),
    ]);

    // Soksplossion
    add([
        pos(center()),
        particles({
            max: 15,
            speed: [350, 550],
            angle: [0, 360],
            damping: [1, 1],
            lifeTime: [1000, 1000],
            opacities: [1, 1, 0],
            scales: [2],
            texture: getSprite("sok").data.tex,
            quads: [getSprite("sok").data.frames[0]],
        }, {
            lifetime: 1000,
            rate: 1,
            spread: 1000,
        }),
    ]).emit(15);

    add([
        anchor("center"),
        pos(center().sub(0, 250)),
        text("Bravo!", {
            size: 50,
            align: "center",
        }),
    ]);

    add([
        anchor("center"),
        pos(center().sub(0, 160)),
        text(
            `You successfully re-stocked\n the [o]soks[/o] in [o]${movesTotal}[/o] moves!`,
            {
                size: 36,
                lineSpacing: 8,
                align: "center",
                styles: {
                    o: {
                        color: Color.fromHex("#ea6262"),
                    },
                },
            },
        ),
    ]);

    // The least amount of moves you can beat the whole game in
    if (movesTotal == 45) {
        add([
            pos(center().add(0, -50)),
            anchor("center"),
            text(
                "Perfect    score!!",
                {
                    size: 38,
                    width: width(),
                    align: "center",
                    transform: i => ({
                        pos: vec2(0, wave(-4, 4, time() * 4 + i * 0.5)),
                        scale: wave(1, 1.2, time() * 3 + i),
                        color: hsl2rgb((time() * 0.2 + i * 0.1) % 1, 0.7, 0.8),
                    }),
                },
            ),
        ]);
    }

    const sok = add([
        sprite("sok"),
        scale(0),
        pos(center().add(0, 100)),
        anchor("center"),
    ]);

    add([
        sprite("box"),
        scale(3),
        pos(center().add(0, 100)),
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
        center().sub(0, 50),
        1,
        (p) => sok.pos = p,
        easings.easeOutExpo,
    );

    addKaboom(center().add(0, 50), { scale: 1.5 });
    shake(5);

    add([
        anchor("center"),
        pos(center().add(0, 250)),
        text("Press any key to play again", {
            size: 22,
            align: "center",
        }),
    ]);

    onKeyPress(() => {
        currentIdx = 0;
        movesTotal = 0;
        go("game", currentIdx);
    });
});

onLoad(() => {
    go("game", currentIdx);
});
