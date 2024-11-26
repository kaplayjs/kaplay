// @ts-check

// Simple dialogues with character avatars

kaplay({
    background: "#ffb879",
    width: 640,
    height: 480,
    buttons: {
        "next": {
            keyboard: "space",
            mouse: "left",
        },
    },
    font: "happy",
});

// Loads all sprites
loadSprite("bean", "/sprites/bean.png");
loadSprite("mark", "/sprites/mark.png");
loadSound("bean_voice", "examples/sounds/bean_voice.wav");
loadSound("mark_voice", "examples/sounds/mark_voice.wav");
loadBitmapFont("happy", "/examples/fonts/happy_28x36.png", 28, 36);

// Define the characters data
const characters = {
    "bean": {
        "sprite": "bean",
        "name": "Bean",
        "sound": "bean_voice",
    },
    "mark": {
        "sprite": "mark",
        "name": "Mark",
        "sound": "mark_voice",
    },
};

// Define the dialogue data [character, text, effects]
const dialogs = [
    ["bean", "[default]Oh hi![/default]"],
    ["mark", "[default]Hey! That's my line![/default]"],
    ["bean", "[default]What! Mark??? How did you get here?[/default]"],
    [
        "mark",
        "[default]Ohhi! I'm just here to say that[/default] [kaboom]Kaboom.js[/kaboom] [default]is awesome![/default]",
    ],
    [
        "bean",
        "[default]Yes but... Nobody uses[/default] [kaboom]Kaboom.js[/kaboom] [default]anymore![/default]",
    ],
    ["mark", "[surprised]What? Why?[/surprised]", "shake"],
    [
        "bean",
        "[default]Because everyone is using[/default] [kaplay]KAPLAY[/kaplay] [default]now![/default]",
    ],
    ["bean", "[default]It's the new hotness![/default]"],
    ["bean", "[default]And now they released the beta of v3001[/default]"],
    ["mark", "[default]Wow! And what is new on this version?[/default]"],
    ["bean", "[default]A lot of things, global input handlers...[/default]"],
    [
        "bean",
        "[default]New component animate() for animating anything![/default]",
    ],
    [
        "bean",
        "[default]Particles![/default]",
    ],
    ["bean", "[default]Physics, effectors...[/default]"],
    [
        "bean",
        "[default]Components for pathfinding like sentry(), patrol()...[/default]",
    ],

    [
        "bean",
        "[default]And much more![/default]",
    ],
    ["mark", "[default]Wow! That's amazing![/default]"],
    ["bean", "[default]And the most important thing...[/default]"],
    [
        "bean",
        "[default]Full compatibilty with[/default] [kaboom]Kaboom.js![/kaboom]",
    ],
    ["bean", "[default]So, what are you waiting for?[/default]"],
    ["bean", "[default]Go and try it now![/default]"],
];

// Some effects data
const effects = {
    "shake": () => {
        shake();
    },
};

let curDialog = 0;
let isTalking = false;

// Text bubble
const textbox = add([
    rect(width() - 140, 140, { radius: 4 }),
    anchor("center"),
    pos(center().x, height() - 100),
    outline(4),
]);

// Text
const txt = add([
    text("", {
        size: 32,
        width: width() - 230,
        align: "center",
        styles: {
            "default": {
                color: BLACK,
            },
            "kaplay": (idx, ch) => ({
                color: Color.fromHex("#6bc96c"),
                pos: vec2(0, wave(-4, 4, time() * 6 + idx * 0.5)),
            }),
            "kaboom": (idx, ch) => ({
                color: Color.fromHex("#ff004d"),
                pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                scale: wave(1, 1.2, time() * 3 + idx),
                angle: wave(-9, 9, time() * 3 + idx),
            }),
            // a jump effect
            "surprised": (idx, ch) => ({
                color: Color.fromHex("#8465ec"),
                scale: wave(1, 1.2, time() * 1 + idx),
                pos: vec2(0, wave(0, 4, time() * 10)),
            }),
            "hot": (idx, ch) => ({
                color: Color.fromHex("#ff004d"),
                scale: wave(1, 1.2, time() * 3 + idx),
                angle: wave(-9, 9, time() * 3 + idx),
            }),
        },
        transform: (idx, ch) => {
            return {
                opacity: idx < txt.letterCount ? 1 : 0,
            };
        },
    }),
    pos(textbox.pos),
    anchor("center"),
    {
        letterCount: 0,
    },
]);

// Character avatar
const avatar = add([
    sprite("bean"),
    scale(3),
    anchor("center"),
    pos(center().sub(0, 50)),
]);

onButtonPress("next", () => {
    if (isTalking) return;

    // Cycle through the dialogs
    curDialog = (curDialog + 1) % dialogs.length;
    updateDialog();
});

// Update the on screen sprite & text
function updateDialog() {
    const [char, dialog, eff] = dialogs[curDialog];

    // Use a new sprite component to replace the old one
    avatar.use(sprite(characters[char].sprite));
    // Update the dialog text
    startWriting(dialog, char);

    if (eff) {
        effects[eff]();
    }
}

function startWriting(dialog, char) {
    isTalking = true;
    txt.letterCount = 0;
    txt.text = dialog;

    const writing = loop(0.05, () => {
        txt.letterCount = Math.min(
            txt.letterCount + 1,
            txt.renderedText.length,
        );
        play(characters[char].sound, {
            volume: 0.2,
        });

        if (txt.letterCount === txt.renderedText.length) {
            isTalking = false;
            writing.cancel();
        }
    });
}

// When the game finishes loading, the dialog will start updating
onLoad(() => {
    updateDialog();
});
