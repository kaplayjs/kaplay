// @ts-check

kaplay();

loadSprite("bean", "/sprites/bean.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("grass", "/sprites/grass.png");

const SPEED = 480;

setGravity(2400);

const level = addLevel([
    "",
    "= @ $$   =",
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
        "$": () => [
            sprite("coin"),
            area(),
            body(),
            anchor("bot"),
            platformEffector({
                shouldCollide(obj, normal) {
                    if (obj !== player) return true;
                    // Let the player push them if they hold shift
                    if (isKeyDown("shift")) return true;
                    if (normal.sub(LEFT).len() < Number.EPSILON) return false;
                    if (normal.sub(RIGHT).len() < Number.EPSILON) return false;
                    return true;
                },
            }),
        ],
    },
});

// Get the player object from tag
const player = level.get("player")[0];

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

onUpdate(() => {
    camPos(player.worldPos());
});
