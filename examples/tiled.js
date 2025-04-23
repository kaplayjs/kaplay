/**
 * @file Tiled
 * @description How to use sprites in tiled mode
 * @difficulty 1
 * @tags basics, game
 * @minver 3001.0
 * @category concepts
 * @test
 */

// Tiled sprites!

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

debug.inspect = true;
