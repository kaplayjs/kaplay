/**
 * @file Sound Component
 * @description How to use the sound() component to attach audio to game objects with spatial audio
 * @difficulty 0
 * @tags basics, audio, component
 * @minver 4000.0
 * @category basics
 * @test
 */

// Sound component demonstration - attach sounds to game objects

kaplay({
    backgroundAudio: true,
    background: "2a2a3a",
});

// Load assets
loadSound("bell", "/sounds/bell.mp3");
loadMusic("OtherworldlyFoe", "/sounds/OtherworldlyFoe.mp3");
loadSprite("bean", "/sprites/bean.png");
loadSprite("bag", "/sprites/bag.png");

// Global volume
volume(0.7);

// Instruction text
add([
    text(
        `Sound Component Demo

[click] spawn sound at mouse
[space] toggle ambient sound
[arrows] move bee for spatial audio

Moving sounds auto-pan left/right
and fade with distance!`,
        { size: 16 },
    ),
    pos(10, 10),
    color(WHITE),
]);

// ========================================
// Example 1: Ambient looping sound attached to object
// ========================================
const ambient = add([
    pos(center()),
    circle(30),
    color(YELLOW),
    // Attach a looping ambient sound that auto-plays
    sound("OtherworldlyFoe", {
        loop: true,
        autoPlay: true,
        volume: 0.3,
    }),
]);

// Toggle ambient sound with space
onKeyPress("space", () => {
    ambient.soundPaused = !ambient.soundPaused;
});

// Status indicator for ambient
const ambientStatus = add([
    text("Ambient: Playing", { size: 14 }),
    pos(10, height() - 30),
    color(GREEN),
]);

onUpdate(() => {
    ambientStatus.text = `Ambient: ${
        ambient.soundPaused ? "Paused" : "Playing"
    }`;
    ambientStatus.color = ambient.soundPaused ? RED : GREEN;
});

// ========================================
// Example 2: Spatial audio on a moving object
// ========================================
const bee = add([
    sprite("bean"),
    pos(center()),
    anchor("center"),
    // Spatial sound: pans left/right based on screen position
    // Volume decreases with distance from center
    sound("OtherworldlyFoe", {
        loop: true,
        autoPlay: true,
        volume: 0.5,
        speed: 1.5, // Higher pitch for bee-like sound
        spatial: true, // Enable spatial audio!
    }),
]);

// Move the bee with arrow keys
const moveSpeed = 200;
onKeyDown("left", () => bee.pos.x -= moveSpeed * dt());
onKeyDown("right", () => bee.pos.x += moveSpeed * dt());
onKeyDown("up", () => bee.pos.y -= moveSpeed * dt());
onKeyDown("down", () => bee.pos.y += moveSpeed * dt());

// Show spatial audio indicator
add([
    text("Move with arrows!", { size: 12 }),
    pos(() => bee.pos.add(0, 40)),
    anchor("center"),
    color(WHITE),
]);

// ========================================
// Example 3: One-shot sounds on click
// ========================================
onClick(() => {
    const sfx = add([
        pos(mousePos()),
        circle(10),
        color(CYAN),
        lifespan(1, { fade: 0.5 }),
        // Spatial one-shot sound
        sound("bell", {
            spatial: true,
            autoPlay: true,
        }),
    ]);

    // Clean up when sound ends (redundant with lifespan but demonstrates the event)
    sfx.onSoundEnd(() => {
        debug.log("Sound ended at " + sfx.pos);
    });
});

// For mobile
onTouchStart((pos) => {
    add([
        pos(pos),
        circle(10),
        color(CYAN),
        lifespan(1, { fade: 0.5 }),
        sound("bell", { spatial: true, autoPlay: true }),
    ]);
});

// ========================================
// Example 4: Manual sound control
// ========================================
const manualSfx = add([
    pos(width() - 100, 100),
    sprite("bag"),
    anchor("center"),
    rotate(0),
    // Sound that doesn't auto-play
    sound("bell", {
        loop: true,
        volume: 0.4,
        spatial: true,
    }),
]);

// Click on the bag to toggle sound
manualSfx.onClick(() => {
    if (manualSfx.soundPaused) {
        manualSfx.playSound();
    }
    else {
        manualSfx.stopSound();
    }
});

// Rotate when playing
manualSfx.onUpdate(() => {
    if (!manualSfx.soundPaused) {
        manualSfx.angle += dt() * 100;
    }
});

add([
    text("Click bag\nto toggle", { size: 12, align: "center" }),
    pos(manualSfx.pos.add(0, 60)),
    anchor("center"),
    color(WHITE),
]);

// Draw center reference for spatial audio
onDraw(() => {
    // Draw center crosshair
    const c = center();
    drawLine({
        p1: vec2(c.x - 20, c.y),
        p2: vec2(c.x + 20, c.y),
        color: rgb(100, 100, 100),
        width: 1,
    });
    drawLine({
        p1: vec2(c.x, c.y - 20),
        p2: vec2(c.x, c.y + 20),
        color: rgb(100, 100, 100),
        width: 1,
    });
});
