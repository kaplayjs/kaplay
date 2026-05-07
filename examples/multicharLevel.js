/**
 * @file Multi-Character Level
 * @description Build levels from ASCII
 * @difficulty 0
 * @tags basics, game
 * @minver 4000.0
 * @category basics
 */

kaplay();

loadBean();
loadSprite("bobo", "/sprites/bobo.png");
loadSprite("dino", "/sprites/dino.png");
loadSprite("ghosty", "/sprites/ghosty.png");

addLevel([
    "bean    dino",
    "    ghos    bobo",
], {
    pos: vec2(100, 100),
    tileWidth: 50,
    tileHeight: 50,
    charsPerTile: 4,
    tiles: {
        bean: () => [sprite("bean")],
        bobo: () => [sprite("bobo")],
        dino: () => [sprite("dino")],
        ghos: () => [sprite("ghosty")],
    },
});
