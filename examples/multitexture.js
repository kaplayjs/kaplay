// Start game
kaplay();

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSound("score", "/sounds/score.mp3");
loadSprite(
    "swipe",
    "https://guilhermesimoes.github.io/assets/images/gradients/enclosing-triangles.png",
    { singular: true },
);

loadShader(
    "swipe",
    null,
    `
	uniform float cutoff;
    uniform sampler2D mask;
	
	vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
		vec4 p = texture2D(mask, uv);
        if (p.r < cutoff) {
            return vec4(0, 0, 0, 1);
        } else {
            return texture2D(tex, uv);
        }
	}
`,
);

const SPEED = 480;

setGravity(2400);

const level = addLevel([
    // Design the level layout with symbols
    "@  ^ $$",
    "=======",
], {
    // The size of each grid
    tileWidth: 64,
    tileHeight: 64,
    // The position of the top left block
    pos: vec2(100, 200),
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
        "$": () => [
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
});

// Get the player object from tag
const player = level.get("player")[0];

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
    player.pos = level.tile2Pos(0, 0);
});

// Eat the coin!
player.onCollide("coin", (coin) => {
    destroy(coin);
    play("score");
});

// Set the post effect
onLoad(() => {
    const swipe = getSprite("swipe")?.data;
    usePostEffect("swipe", () => ({
        cutoff: time() / 2 % 1,
        mask: swipe.tex,
    }));
});
