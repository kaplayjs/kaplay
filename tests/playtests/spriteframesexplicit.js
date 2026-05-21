kaplay({
    background: "black",
    scale: 4,
});

// https://0x72.itch.io/dungeontileset-ii
loadSpriteAtlas("/sprites/dungeon.png", {
    "hero": {
        "x": 128,
        "y": 196,
        "width": 144,
        "height": 28,
        // sliceX: 9,
        "frames": [
            { x: 16 * 0, y: 0, w: 16, h: 28 },
            { x: 16 * 1, y: 0, w: 16, h: 28 },
            { x: 16 * 2, y: 0, w: 16, h: 28 },
            { x: 16 * 3, y: 0, w: 16, h: 28 },
            { x: 16 * 4, y: 0, w: 16, h: 28 },
            { x: 16 * 5, y: 0, w: 16, h: 28 },
            { x: 16 * 6, y: 0, w: 16, h: 28 },
            { x: 16 * 7, y: 0, w: 16, h: 28 },
            { x: 16 * 8, y: 0, w: 16, h: 28 },
        ],
        "anims": {
            "idle": {
                "from": 0,
                "to": 3,
                "speed": 3,
                "loop": true,
            },
            "run": {
                "from": 4,
                "to": 7,
                "speed": 10,
                "loop": true,
            },
            "hit": 8,
        },
    },
});

const player = add([
    sprite("hero", { anim: "run" }),
    pos(0, 0),
    anchor("center"),
]);

setCamPos(player.pos);
