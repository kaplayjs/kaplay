/**
 * @file Sprite Animations
 * @description How to load and animate sprites
 * @difficulty 0
 * @tags basics, animation
 * @minver 3001.0
 * @category basics
 */

// Animate Sprites with platformer movement [👁️]

// This example may be large, so use regions for navigating faster. Important
// content is marked with 👁️

kaplay({ scale: 4, font: "happy" });

const SPEED = 120;
const JUMP_FORCE = 240;
setGravity(640);

// #region Loading Assets 👁️
loadBitmapFont("happy", "/fonts/happy_28x36.png", 28, 36);

// Loading a multi-frame sprite 👁️
loadSprite("dino", "/sprites/dungeon-dino.png", {
    // The image contains 9 frames layered out horizontally, slice it into individual frames
    sliceX: 9,
    // Define animations
    anims: {
        "idle": {
            // Starts from frame 0, ends at frame 3
            from: 0,
            to: 3,
            // Frame per second
            speed: 5,
            loop: true,
        },
        "run": {
            from: 4,
            to: 7,
            speed: 10,
            loop: true,
        },
        // This animation only has 1 frame
        "jump": 8,
    },
});
// #endregion

// #region Game Objects

// Add our player character 👁️
const player = add([
    sprite("dino"),
    pos(center()),
    anchor("center"),
    area(),
    body(),
]);

// Add a platform
add([
    rect(width(), 24),
    area(),
    outline(1),
    pos(0, height() - 24),
    body({ isStatic: true }),
]);
// #endregion

/* 👁️
We can animate sprites using obj.play("name") method.

This time we're defining a function for executing animations conditionally.
*/

// #region Player animations 👁️
const playerPlayRun = () => {
    // obj.play() will reset to the first frame of the animation
    // so we want to make sure it only runs when the current animation is not "run"
    if (player.isGrounded() && player.getCurAnim().name !== "run") {
        player.play("run");
    }
};

const playerPlayIdle = () => {
    // Only reset to "idle" if player is not holding any of these keys
    if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
        player.play("idle");
    }
};
// #endregion

// #region Player move/anim 👁️
onKeyDown("left", () => {
    player.move(-SPEED, 0);
    player.flipX = true;
    playerPlayRun();
});

onKeyDown("right", () => {
    player.move(SPEED, 0);
    player.flipX = false;
    playerPlayRun();
});

onKeyRelease(["left", "right"], () => {
    playerPlayIdle();
});

onKeyPress(["space", "up"], () => {
    if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
        player.play("jump");
    }
});

// Switch to "idle" or "run" animation when player hits ground
player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
        player.play("idle");
    }
    else {
        player.play("run");
    }
});

// #endregion

// You can run functions when a specific animation ends 👁️
player.onAnimEnd((anim) => {
    if (anim === "idle") {
        debug.log("hi!");
    }
});

// #region UI
const getInfo = () =>
    `
Anim: ${player.getCurAnim()?.name}
Frame: ${player.frame}
`.trim();

// Add some text to show the current animation
const label = add([
    text(getInfo(), { size: 12 }),
    color(0, 0, 0),
    pos(4),
]);

label.onUpdate(() => {
    label.text = getInfo();
});
// #endregion
