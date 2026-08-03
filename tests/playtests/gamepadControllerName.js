kaplay({
    background: [20, 20, 20],
    buttons: {
        test: { gamepad: "south" },
    },
});

const GAMEPAD_BUTTONS = [
    "north",
    "east",
    "south",
    "west",
    "ltrigger",
    "rtrigger",
    "lshoulder",
    "rshoulder",
    "select",
    "start",
    "lstick",
    "rstick",
    "dpad-up",
    "dpad-right",
    "dpad-down",
    "dpad-left",
    "home",
    "capture",
    "touchpad",
];

const banner = add([
    text("Plug in a controller, or press a button if it's already connected.", {
        width: width() - 80,
        align: "center",
    }),
    pos(center()),
    anchor("center"),
]);

const panel = add([
    text("", { size: 18 }),
    pos(20, 20),
]);

let currentGamepad = null;
let lastButtonPress = "";

function showConnected(gp) {
    banner.text = `${gp.name} connected! (type: ${
        gp.type ?? "unknown"
    })`;
    currentGamepad = gp;
}

let toastBox = null;
let toastText = null;

function showToast(msg, textColor) {
    toastBox?.destroy();
    toastText?.destroy();

    const toastPos = vec2(width() / 2, 60);
    toastBox = add([
        rect(360, 50, { radius: 8 }),
        pos(toastPos),
        anchor("center"),
        color(30, 30, 30),
        opacity(0.85),
        lifespan(0.7, { fade: 0.3 }),
        z(100),
    ]);
    toastText = add([
        text(msg, { size: 20, align: "center", width: 340 }),
        pos(toastPos),
        anchor("center"),
        color(textColor),
        opacity(1),
        lifespan(0.7, { fade: 0.3 }),
        z(101),
    ]);
}

// Browsers withhold gamepad detection until the user interacts with it
// (button press / stick move) for fingerprinting-privacy reasons, so a
// controller already plugged in before this page loaded may not show up
// here yet - that's the Gamepad API's own gating, not a bug in KAPLAY.
const existing = getGamepads()[0];
if (existing) showConnected(existing);

onGamepadConnect((gp) => {
    showConnected(gp);
    showToast(`${gp.name} connected`, rgb(0, 255, 0));
});

onGamepadDisconnect((gp) => {
    banner.text =
        "Plug in a controller, or press a button if it's already connected.";
    currentGamepad = null;
    lastButtonPress = "";
    panel.text = "";
    showToast(`${gp.name} disconnected`, rgb(255, 0, 0));
});

onGamepadButtonPress((btn, gp) => {
    lastButtonPress = `${gp.name}: ${btn}`;
});

onButtonPress("test", () => {
    showToast("\"test\" binding fired!", rgb(255, 255, 0));
});

function fmtVec(v) {
    return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`;
}

onUpdate(() => {
    if (!currentGamepad) return;

    const downInstance = GAMEPAD_BUTTONS.filter((b) =>
        currentGamepad.isDown(b)
    );
    const downGlobal = GAMEPAD_BUTTONS.filter((b) => isGamepadButtonDown(b));

    panel.text = [
        `last button: ${lastButtonPress}`,
        `stick L   instance: ${fmtVec(currentGamepad.getStick("left"))}`
        + `  global: ${fmtVec(getGamepadStick("left"))}`,
        `stick R   instance: ${fmtVec(currentGamepad.getStick("right"))}`
        + `  global: ${fmtVec(getGamepadStick("right"))}`,
        `trigger L instance: ${currentGamepad.getAnalog("ltrigger").toFixed(2)}`
        + `  global: ${getGamepadAnalogButton("ltrigger").toFixed(2)}`,
        `trigger R instance: ${currentGamepad.getAnalog("rtrigger").toFixed(2)}`
        + `  global: ${getGamepadAnalogButton("rtrigger").toFixed(2)}`,
        `down instance: ${downInstance.join(", ")}`,
        `down global:   ${downGlobal.join(", ")}`,
    ].join("\n");
});
