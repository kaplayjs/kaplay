/**
 * @file Button Bindings
 * @description How to set common names to different inputs ("move", "shoot").
 * @difficulty 0
 * @tags input
 * @minver 3001.0
 * @category concepts
 * @test
 */

// Using input bindings for use common names like "jump" for buttons like space,
// click or gamepad A/B

kaplay({
    // We set the input bindings here
    buttons: {
        "moveUp": {
            keyboard: ["up", "w"],
            gamepad: ["dpad-up"],
        },
        "moveDown": {
            keyboard: ["down", "s"],
            gamepad: ["dpad-down"],
        },
        "moveLeft": {
            keyboard: ["left", "a"],
            gamepad: ["dpad-left"],
        },
        "moveRight": {
            keyboard: ["right", "d"],
            gamepad: ["dpad-right"],
        },
        "mutate": {
            keyboard: ["space", "t", "enter"],
            gamepad: ["south"],
            // Setting mouse binding
            mouse: "left",
        },
    },
    background: "#1f102a",
    font: "happy",
});

// Load assets
loadSprite("zombean", "/sprites/zombean.png");
loadSprite("bean", "/sprites/bean.png");
loadHappy();

// Some constants
const SPEED = 300;

// Add player game object
const player = add([
    sprite("bean"),
    anchor("center"),
    pos(90, 90),
    scale(2),
    {
        phase: "bean",
        isMutating: false,
    },
]);

// This is an effect we will run on onButtonPress("mutate")
function mutate() {
    if (player.isMutating) return;

    const phase = player.phase == "bean" ? "zombean" : "bean";

    player.phase = phase;
    player.isMutating = true;

    // Simple animation using tween (check tween example)
    const smallify = tween(vec2(2), vec2(0), 0.5, (v) => {
        player.scale = v;
    }, easings.easeOutCubic);

    smallify.onEnd(() => {
        player.sprite = phase;

        const normalify = tween(vec2(0), vec2(2), 0.5, (v) => {
            player.scale = v;
        }, easings.easeOutCubic);

        normalify.onEnd(() => player.isMutating = false);
    });
}

// Player movement (from movement example)
onButtonDown("moveLeft", () => {
    player.move(-SPEED, 0);
});

onButtonDown("moveRight", () => {
    player.move(SPEED, 0);
});

onButtonDown("moveUp", () => {
    player.move(0, -SPEED);
});

onButtonDown("moveDown", () => {
    player.move(0, SPEED);
});

onButtonPress("mutate", () => {
    mutate();
});

// Other visual elements

add([
    text("move with wasd/arrows/dpad\nmutate with south/space/enter/click", {
        width: width(),
        align: "center",
        size: 24,
    }),
]);
