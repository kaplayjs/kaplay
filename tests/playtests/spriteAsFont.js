kaplay({ background: "black" });

loadSpriteAtlas("/sprites/dungeon.png", {
    "hero": {
        "x": 128,
        "y": 196,
        "width": 144,
        "height": 28,
        "sliceX": 9,
    },
});

loadBitmapFontFromSprite("hero", "abc", 3);

add([
    pos(100, 100),
    text("hello, I am [herofont]abcabc[/herofont]", {
        styles: {
            herofont: {
                font: "hero",
                scale: vec2(2),
            },
        },
        width: 300,
        transform: {
            scale: vec2(2),
            stretchInPlace: false,
        },
    }),
    area(),
]);

debug.inspect = true;
