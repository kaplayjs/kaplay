/**
 * @file One-way Platforms
 * @description How to create one-way walls or platforms.
 * @difficulty 1
 * @tags basics, game
 * @minver 3001.0
 * @category concepts
 */

kaplay();

loadSprite("bean", "/sprites/bean.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("grass", "/sprites/grass.png");

const SPEED = 480;

setGravity(2400);

const level = addLevel([
    "    ##",
    "",
    "    ##",
    "",
    "    ##",
    "",
    "    ##",
    "",
    "====##====",
    "",
    "= @ ##   =",
    "==========",
], {
    tileWidth: 64,
    tileHeight: 64,
    // Define what each symbol means (in components)
    tiles: {
        "@": () => [
            sprite("bean"),
            area(),
            body(),
            anchor("bot"),
            z(2),
            "player",
        ],
        "=": () => [
            sprite("grass"),
            area(),
            body({ isStatic: true }),
            anchor("bot"),
        ],
        "#": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
            anchor("bot"),
            platformEffector(),
        ],
    },
});

// Get the player object from tag
const player = level.get("player")[0];

// Always look at player
onUpdate(() => {
    setCamPos(player.worldPos);
});

// Movements
onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(900);
    }
});

onKeyDown("left", () => {
    player.move(-SPEED, 0);
});

onKeyDown("right", () => {
    player.move(SPEED, 0);
});

// Fall through when down is pressed
onKeyDown("down", () => {
    const p = player.curPlatform();
    if (p != null && p.has("platformEffector")) {
        p.platformIgnore.add(player);
    }
});
