/**
 * @file Frames
 * @description How to define frames in an animation.
 * @difficulty 0
 * @tags basics, animation
 * @minver 3001.0
 * @category concepts
 * @test
 */

kaplay({
    scale: 4,
    background: [0, 0, 0],
});

// https:/ / (0x72).itch.io / dungeontileset - ii;
loadSpriteAtlas("/sprites/dungeon.png", {
    wizard: {
        x: 128,
        y: 140,
        width: 144,
        height: 28,
        sliceX: 9,
        anims: {
            bouncy: {
                frames: [8, 5, 0, 3, 2, 3, 0, 5],
                speed: 10,
                loop: true,
            },
        },
    },
});

add([
    sprite("wizard", { anim: "bouncy" }),
    pos(100, 100),
]);
