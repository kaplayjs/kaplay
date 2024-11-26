// @ts-check

// You can set the input bindings for your game!
kaplay({
    buttons: {
        // Buttons for jumping
        "jump": {
            // When using a gamepad the button for jumping will be south
            gamepad: ["south"],
            // When using a keyboard the button will be "up" or "w"
            keyboard: ["up", "w"],
            // When using a mouse the button will be "left"
            mouse: "left",
        },
        // Buttons for inspecting
        "inspect": {
            gamepad: "east",
            keyboard: "f",
            mouse: "right",
        },
    },
});

loadBean();

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

// Add a platform to hold the player
add([
    rect(width(), 48),
    outline(4),
    area(),
    pos(0, height() - 48),
    // Give objects a body() component if you don't want other solid objects pass through
    body({ isStatic: true }),
]);

// Adds an object with a text
add([
    text("Press jump button", { width: width() / 2 }),
    pos(12, 12),
]);

// This runs when the button for "jump" is pressed (will be on any input device)
onButtonPress("jump", () => {
    // You can get the type of device that the last input was inputted in!
    debug.log(getLastInputDeviceType());

    // Now we'll check if the player is on the ground to make it jump
    if (player.isGrounded()) {
        // .jump() is provided by body()
        player.jump();
    }
});

// When the button for inspecting is pressed we will log in the debug console for our game the text "inspecting"
onButtonDown("inspect", () => {
    debug.log("inspecting");
});
