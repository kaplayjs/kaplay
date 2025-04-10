/**
 * @file Tiled
 * @description How to make tile sprites in KAPLAY.
 * @difficulty 1
 * @tags basics, game
 * @minver 3001.0
 */

kaplay();

loadSprite("bean", "/sprites/bean.png");

add([
    pos(150, 150),
    sprite("bean", {
        tiled: true,
        width: 200,
        height: 200,
    }),
    anchor("center"),
]);

add([
    circle(4),
    pos(150, 150),
]);

// debug.inspect = true
