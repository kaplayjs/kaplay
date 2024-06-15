kaplay({
    buttons: {
        "jump": {
            gamepad: ["south"],
            keyboard: ["up", "w"],
            mouse: "left",
        },
        "inspect": {
            gamepad: "east",
            keyboard: "f",
            mouse: "right",
        },
    },
});

loadSprite("bean", "/sprites/bean.png");

// Set the gravity acceleration (pixels per second)
setGravity(1600);

// Add player game object
const player = add([
    sprite("bean"),
    pos(center()),
    area(),
    // body() component gives the ability to respond to gravity
    body(),
]);

// .onGround() is provided by body(). It registers an event that runs whenever player hits the ground.
player.onGround(() => {
    debug.log("ouch");
});

// Add a platform to hold the player
add([
    rect(width(), 48),
    outline(4),
    area(),
    pos(0, height() - 48),
    // Give objects a body() component if you don't want other solid objects pass through
    body({ isStatic: true }),
]);

add([
    text("Press jump button", { width: width() / 2 }),
    pos(12, 12),
]);

onButtonPress("jump", () => {
    if (player.isGrounded()) {
        // .jump() is provided by body()
        player.jump();
    }
});

onButtonDown("inspect", () => {
    debug.log("inspecting");
});
