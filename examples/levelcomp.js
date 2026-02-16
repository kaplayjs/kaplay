/**
 * @file Level component
 * @description How to build levels out of tiles using level
 * @difficulty 1
 * @tags basics, comps
 * @minver 4000.0
 * @category concepts
 */

// Build levels with level()

// Start game
kaplay();

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSound("score", "/sounds/score.mp3");

const SPEED = 480;

setGravity(2400);

const myLevel = add([
    level(
        [
            // Design the level layout with symbols
            "         ",
            "         ",
            "  @  ^ $$",
            "  =======",
        ],
        {
            // The size of each grid
            tileWidth: 64,
            tileHeight: 64,
            // Define what each symbol means (in components)
            tiles: {
                "@": () => [
                    sprite("bean"),
                    area(),
                    body(),
                    anchor("bot"),
                    "player",
                ],
                "=": () => [
                    sprite("grass"),
                    area(),
                    body({ isStatic: true }),
                    anchor("bot"),
                ],
                $: () => [
                    sprite("coin"),
                    area({ isSensor: true }),
                    anchor("bot"),
                    "coin",
                ],
                "^": () => [
                    sprite("spike"),
                    area({ isSensor: true }),
                    anchor("bot"),
                    "danger",
                ],
            },
        },
    ),
]);

// Get the player object from tag
const player = myLevel.get("player")[0];

// Movements
onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump();
    }
});

onKeyDown("left", () => {
    player.move(-SPEED, 0);
});

onKeyDown("right", () => {
    player.move(SPEED, 0);
});

// Back to the original position if hit a "danger" item
player.onCollide("danger", () => {
    player.pos = myLevel.tile2Pos(0, 0);
});

// Eat the coin!
player.onCollide("coin", (coin) => {
    destroy(coin);
    play("score");
});
