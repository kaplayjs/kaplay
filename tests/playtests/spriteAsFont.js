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

loadBitmapFontFromSprite("hero", "abc");

add([
    pos(100, 100),
    text(
        "hello, I am [herofont]abc[/herofont] foo [herofont]a[/herofont]a[herofont]b[/herofont]b[herofont]c[/herofont]c",
        {
            styles: {
                herofont: {
                    font: "hero",
                },
            },
            width: 600,
            size: 72,
        },
    ),
    area(),
]);

debug.inspect = true;
