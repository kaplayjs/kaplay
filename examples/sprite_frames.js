/**
 * @file Sprite Frames
 * @description How to load individual sprite frames in KAPLAY.
 * @difficulty 0
 * @tags basics, animation
 * @minver 3001.0
 */

// Start a kaboom game
kaplay({
    // Scale the whole game up
    scale: 4,
    // Set the default font
    font: "monospace",
});

// We store the original width and height of loaded sprite file.
const originalWidth = 512;
const originalHeight = 512;

// Loading predefined sprite frames
loadSprite("dino", "/sprites/dungeon.png", {
    frames: [
        // Every input of a quad is between 0 and 1.
        // So, we need do some calculations to get the right quad.
        // Note that these frames were measured by hand, this is only for demonstration.
        quad(
            129 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            145 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            161 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            177 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            193 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            209 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            225 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            241 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
        quad(
            257 / originalWidth,
            234 / originalHeight,
            15 / originalWidth,
            22 / originalHeight,
        ),
    ],
    anims: {
        run: {
            from: 0,
            to: 8,
            loop: true,
        },
    },
});

// Add our player character
add([pos(center()), anchor("center"), sprite("dino", { anim: "run" })]);
