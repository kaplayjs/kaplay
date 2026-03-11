const pixelDensity = Math.min(2, devicePixelRatio);

kaplay({ background: "#4a3052", pixelDensity });

loadFont(
    "unifontex",
    "https://cdn.jsdelivr.net/fontsource/fonts/unifontex@latest/latin-400-normal.ttf",
    { filter: "nearest" },
);

loadFont(
    "fusion",
    "https://cdn.jsdelivr.net/fontsource/fonts/fusion-pixel-12px-monospaced-sc@latest/latin-400-normal.ttf",
    { filter: "nearest" },
);

loadFont(
    "roboto-mono",
    "https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-400-normal.ttf",
    { filter: "linear", size: 100 * pixelDensity },
);

loadFont(
    "outfit",
    "https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-400-normal.ttf",
    { filter: "linear" },
);

add([
    pos(42, 40),
    text("Hello World!", { size: 16 }),
]);

add([
    pos(42, 90),
    text("Hello World!", { size: 16, font: "unifontex" }),
]);

add([
    pos(42, 136),
    text("Hello World!", { size: 32, font: "unifontex" }),
]);

add([
    pos(42, 200),
    text("Hello World!", { size: 24, font: "fusion" }),
]);

add([
    pos(42, 252),
    text("Hello World!", { size: 32, font: "roboto-mono" }),
]);

add([
    pos(42, 324),
    text("Hello World!", { size: 100, font: "roboto-mono" }),
]);

add([
    pos(410, 40),
    text(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis euismod aliquam. Nullam arcu odio, varius ac porta vel, fringilla eu nisi.",
        { size: 16, lineSpacing: 12, width: 320 },
    ),
]);

add([
    pos(410, 200),
    text(
        [
            "Default monospace fonts:",
            "- Win:   Consolas",
            "- Mac:   Safari - Courier, Chrome - Roboto Mono",
            "- Linux: Ubuntu Mono / DejaVu Sans Mono",
        ].join("\n"),
        { size: 12, lineSpacing: 12 },
    ),
]);

add([
    {
        draw() {
            drawRect({
                width: this.width,
                height: this.height,
                opacity: 0.1,
            });
        },
    },
    pos(42, 450),
    text("Accents: ḴÅPľąý (KAPlay)", { font: "outfit", size: 32 }),
]);
