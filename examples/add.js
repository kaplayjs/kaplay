/**
 * @file Add game objects
 * @description How to create game objects.
 * @difficulty 0
 * @tags basics, gobj
 * @minver 3001.0
 */

// Adding game objects to screen

// Start a KAPLAY game
kaplay();

// Load a sprite asset from "sprites/bean.png", with the name "bean"
loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

// A "Game Object" is the basic unit of entity in KAPLAY
// Game objects are composed from components
// Each component gives a game object certain capabilities

// add() assembles a game object from a list of components and add to game, returns the reference of the game object
const player = add([
    sprite("bean"), // sprite() component makes it render as a sprite
    pos(120, 80), // pos() component gives it position, also enables movement
    rotate(0), // rotate() component gives it rotation
    anchor("center"), // anchor() component defines the pivot point (defaults to "topleft")
]);

// .onUpdate() is a method that's found in all game objects, it registers an event that runs every frame
player.onUpdate(() => {
    // .angle is a property provided by rotate() component, here we're incrementing the angle by 120 degrees per second, dt() is the time elapsed since last frame in seconds
    player.angle += 120 * dt();
});

// Add multiple game objects
for (let i = 0; i < 3; i++) {
    // generate a random point on screen
    // width() and height() gives the game dimension
    const x = rand(0, width());
    const y = rand(0, height());

    add([
        sprite("ghosty"),
        pos(x, y),
    ]);
}
