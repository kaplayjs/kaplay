/**
 * @file Multi-Character Level
 * @description Build levels from ASCII using more 2 or more characters per tile
 * @difficulty 0
 * @tags basics, game
 * @minver 4000.0
 * @category basics
 */

// Let's take a look into multicharacter ASCII Levels [💡]

kaplay();

loadBean();
loadSprite("bobo", "/sprites/bobo.png");
loadSprite("dino", "/sprites/dino.png");
loadSprite("ghosty", "/sprites/ghosty.png");

/* 💡 Create levels with multicharacters 💡
You can defined the exact character size for each tile in the ASCII TileMap, using
AddLevelOpt.charsPerTile option.
*/

addLevel([
    "bean    dino",
    "    ghos    bobo",
], {
    pos: vec2(100, 100),
    tileWidth: 50,
    tileHeight: 50,
    // We will use a 4 characters per tile
    charsPerTile: 4,
    tiles: {
        bean: () => [sprite("bean")],
        bobo: () => [sprite("bobo")],
        dino: () => [sprite("dino")],
        ghos: () => [sprite("ghosty")],
    },
});
