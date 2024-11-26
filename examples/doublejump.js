// @ts-check

// How to use the doubleJump component in this little game
kaplay({
    background: [141, 183, 255],
});

// Loads sprites
loadSprite("bean", "/sprites/bean.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("spike", "/sprites/spike.png");
loadSound("coin", "/examples/sounds/score.mp3");

// Set the gravity acceleration (pixels per second)
setGravity(4000);

const PLAYER_SPEED = 640;
const JUMP_FORCE = 1200;
const NUM_PLATFORMS = 5;

// a spinning component for fun, for more info check the 'component' example
function spin(speed = 1200) {
    let spinning = false;
    return {
        require: ["rotate"],
        update() {
            if (!spinning) {
                return;
            }
            this.angle -= speed * dt();
            if (this.angle <= -360) {
                spinning = false;
                this.angle = 0;
            }
        },
        spin() {
            spinning = true;
        },
    };
}

// Setsup the game scene
scene("game", () => {
    // This score textObject holds a value property in a plain object
    const score = add([
        text("0", { size: 24 }),
        pos(24, 24),
        { value: 0 },
    ]);

    const bean = add([
        sprite("bean"),
        area(),
        anchor("center"),
        pos(0, 0),
        body({ jumpForce: JUMP_FORCE }),
        // Adds the double jump component
        doubleJump(),
        rotate(0),
        spin(),
    ]);

    // Adds a num of platforms that go from left to right
    for (let i = 1; i < NUM_PLATFORMS; i++) {
        add([
            sprite("grass"),
            area(),
            pos(rand(0, width()), i * height() / NUM_PLATFORMS),
            body({ isStatic: true }),
            anchor("center"),
            "platform",
            {
                speed: rand(120, 320),
                dir: choose([-1, 1]),
            },
        ]);
    }

    // go to the first platform
    bean.pos = get("platform")[0].pos.sub(0, 64);

    // Generates coins on those platforms
    function genCoin(avoid) {
        const plats = get("platform");
        let idx = randi(0, plats.length);
        // avoid the spawning on the same platforms
        if (avoid != null) {
            idx = choose([...plats.keys()].filter((i) => i !== avoid));
        }
        const plat = plats[idx];
        add([
            pos(),
            anchor("center"),
            sprite("coin"),
            area(),
            follow(plat, vec2(0, -60)),
            "coin",
            { idx: idx },
        ]);
    }

    genCoin(0);

    for (let i = 0; i < width() / 64; i++) {
        add([
            pos(i * 64, height()),
            sprite("spike"),
            area(),
            anchor("bot"),
            scale(),
            "danger",
        ]);
    }

    bean.onCollide("danger", () => {
        go("lose");
    });

    bean.onCollide("coin", (c) => {
        destroy(c);
        play("coin");
        score.value += 1;
        score.text = score.value.toString();
        genCoin(c.idx);
    });

    // The double jupm component provides us this function that runs when we double jump
    bean.onDoubleJump(() => {
        // So we can call the spin() method provided by the spin() component to spin
        bean.spin();
    });

    onUpdate("platform", (p) => {
        p.move(p.dir * p.speed, 0);
        if (p.pos.x < 0 || p.pos.x > width()) {
            p.dir = -p.dir;
        }
    });

    onKeyPress("space", () => {
        bean.doubleJump();
    });

    // Will move the bean left and right
    function move(x) {
        bean.move(x, 0);
        if (bean.pos.x < 0) {
            bean.pos.x = width();
        }
        else if (bean.pos.x > width()) {
            bean.pos.x = 0;
        }
    }

    // both keys will trigger
    onKeyDown("left", () => {
        move(-PLAYER_SPEED);
    });

    onKeyDown("right", () => {
        move(PLAYER_SPEED);
    });

    // The south button will call the doubleJump, for more info on gamepads check the 'gamepad' example
    onGamepadButtonPress("south", () => bean.doubleJump());

    onGamepadStick("left", (v) => {
        move(v.x * PLAYER_SPEED);
    });

    let timeLeft = 30;

    const timer = add([
        anchor("topright"),
        pos(width() - 24, 24),
        text(timeLeft.toString()),
    ]);

    onUpdate(() => {
        timeLeft -= dt();
        if (timeLeft <= 0) {
            go("win", score.value);
        }
        timer.text = timeLeft.toFixed(2);
    });
});

// Sets up the scene where we win
scene("win", (score) => {
    add([
        sprite("bean"),
        pos(width() / 2, height() / 2 - 80),
        scale(2),
        anchor("center"),
    ]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onGamepadButtonPress("south", () => go("game"));
});

// Sets up the scene where we lose :(
scene("lose", () => {
    add([
        text("You Lose"),
    ]);
    onKeyPress("space", () => go("game"));
    onGamepadButtonPress("south", () => go("game"));
});

// Starts the game by entering the game scene
go("game");
