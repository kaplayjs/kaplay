/**
 * @file Pause Menu (Flappy)
 * @description How to make a pause menu and pause a game
 * @difficulty 1
 * @tags ui, game
 * @minver 3001.0
 * @category concepts
 */

kaplay({ background: [141, 183, 255], font: "happy" });

loadSprite("bean", "/sprites/bean.png");
loadSprite("pause", "/sprites/pause.png");
loadBitmapFont("happy", "/fonts/happy_28x36.png", 28, 36);
loadBitmapFont("happy-o", "/fonts/happy-o_36x45.png", 36, 45);
loadSound("score", "/sounds/score.mp3");
loadSound("wooosh", "/sounds/wooosh.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("off", "/sounds/off.mp3");

// easier to keep UI such as a pause menu on top of the game
setLayers(["game", "ui"], "game");

// define gravity
setGravity(3200);

scene("game", () => {
    // The order in which game objects are added can
    // matter, especially when events are attached to them
    // Objects created earlier are triggered first
    // E.g. the UI button has to pause the game on click
    // before the game object registers a click as a jump
    const pauseButton = add([
        sprite("pause"),
        scale(0.8),
        pos(4, 8),
        area(),
        fixed(),
        layer("ui"),
    ]);
    pauseButton.onClick(togglePause);

    const game = add([
        timer(), // for a pipe spawning loop
        layer("game"),
    ]);

    const PIPE_OPEN = 240;
    const PIPE_MIN = 60;
    const JUMP_FORCE = 800;
    const SPEED = 320;
    const CEILING = -60;

    // a game object consists of a list of components and tags
    const bean = game.add([
        // sprite() means it's drawn with a sprite of name "bean" (defined above in 'loadSprite')
        sprite("bean"),
        // give it a position
        pos(width() / 4, 0),
        // give it a collider
        area({ isSensor: true }),
        // body component enables it to fall and jump in a gravity enabled world
        body(),
    ]);

    // check for fall death
    bean.onUpdate(() => {
        if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
            play("off");
            // switch to "lose" scene
            go("lose", score);
        }
    });

    // jump buttons
    game.onKeyPress("space", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });
    game.onGamepadButtonPress("south", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // jump mouse and touch
    game.onMousePress("left", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // we start pipe opening spawning around the center
    let prevPipeH1 = center().y - PIPE_OPEN / 2;

    function spawnPipe() {
        // calculate pipe positions
        // we limit random pipe height within the prev pipe opening range
        // to keep it close enough to be jumpable
        const h1 = prevPipeH1 = (() => {
            const PIPE_MAX = height() - PIPE_MIN - PIPE_OPEN;
            const low = Math.max(PIPE_MIN, prevPipeH1 - PIPE_OPEN * 1.2);
            const high = Math.min(PIPE_MAX, prevPipeH1 + PIPE_OPEN * 1.2);
            return rand(low, high);
        })();
        const h2 = height() - h1 - PIPE_OPEN;

        // we can create a pipe factory with common comps and customizable params
        const makePipe = (posY, h) => [
            pos(width(), posY),
            rect(64, h),
            color(0, 127, 255),
            outline(4),
            area({ isSensor: true }),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            // give it a tag for easier behavior assignment later on
            "pipe",
        ];

        // add a top pipe
        game.add(makePipe(0, h1));

        // add a bottom pipe
        game.add([
            // we can spread comps to a new array to also add custom comps
            ...makePipe(h1 + PIPE_OPEN, h2),
            // raw obj just assigns every field to the game obj
            { passed: false },
        ]);
    }

    // callback when bean onCollide with objects with a tag "pipe"
    bean.onCollide("pipe", () => {
        go("lose", score);
        play("hit");
        addKaboom(bean.pos);
    });

    // per frame event for all objects with a tag "pipe"
    onUpdate("pipe", (p) => {
        // check if bean passed the pipe
        if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
            addScore();
            p.passed = true;
        }
    });

    // spawn a pipe every 1 sec
    game.loop(1, spawnPipe);

    let score = 0;

    // display score
    const scoreLabel = game.add([
        text(score.toString(), { font: "happy-o", size: 45 }),
        anchor("center"),
        pos(width() / 2, 80),
        fixed(),
        z(1000),
    ]);

    function addScore() {
        score++;
        scoreLabel.text = score.toString();
        play("score");
    }

    let curTween = null;

    function togglePause() {
        const gamePaused = !game.paused;
        // Since the paused is set before event callbacks
        // run, we delay unpausing by one frame
        // This prevents the same click from triggering
        // a jump when the game is unpaused
        if (gamePaused) game.paused = gamePaused;
        else wait(0, () => game.paused = gamePaused);

        curTween?.cancel();
        curTween = tween(
            pauseMenu.pos,
            gamePaused ? center() : center().add(0, 700),
            1,
            (p) => pauseMenu.pos = p,
            easings.easeOutElastic,
        );

        if (gamePaused) {
            pauseMenu.hidden = false;
            pauseMenu.paused = false;
        }
        else {
            curTween.onEnd(() => {
                pauseMenu.hidden = true;
                pauseMenu.paused = true;
            });
        }
    }

    onKeyPress(["p", "escape"], togglePause);

    const pauseMenu = add([
        rect(300, 260, { radius: 10 }),
        color(255, 255, 255),
        outline(4),
        anchor("center"),
        pos(center().add(0, 700)),
        layer("ui"),
    ]);
    // we hide it and disable by default
    pauseMenu.hidden = true;
    pauseMenu.paused = true;

    pauseMenu.add([
        text("Pause Menu", { size: 28 }),
        color(BLACK),
        anchor("top"),
        pos(0, -pauseMenu.height / 2 + 24),
    ]);

    // we map button objs based on their definition
    pauseMenu.buttons = [
        ["Resume", togglePause],
        ["Restart", () => go("game"), rgb(244, 66, 94)],
    ].map(([txt, fn, bg], i) =>
        pauseMenu.add([
            anchor("center"),
            // placed under each other "automatically"
            pos(0, 60 * i - 20),
            // another behavior and calculations can be "inlined"
            {
                add() {
                    // define dimensions
                    this.btnWidth = pauseMenu.width - 64;
                    this.btnHeight = this.height + 24; // based on the resulting text height

                    // register mouse events
                    this.use(area({
                        shape: new Rect(vec2(0), this.btnWidth, this.btnHeight),
                    }));
                    fn && this.onClick(fn);
                    this.onHover(() =>
                        tween(vec2(1), vec2(1.06), 0.15, s =>
                            this.scale = s, easings.easeOutBack)
                    );
                    this.onHoverEnd(() =>
                        tween(this.scale, vec2(1), 0.15, s =>
                            this.scale = s, easings.easeOutBack)
                    );
                },
                // draw the button rect first
                draw() {
                    drawRect({
                        width: this.btnWidth,
                        height: this.btnHeight,
                        color: bg ?? rgb(0, 127, 255),
                        radius: 8,
                        outline: { width: 4, color: BLACK },
                        anchor: this.anchor,
                    });
                },
            },
            // the button text on top, text comp gives obj its dimensions
            text(txt, { size: 22 }),
            scale(1),
        ])
    );
});

scene("lose", (score) => {
    add([
        sprite("bean"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center"),
    ]);

    // display score
    add([
        text(score, { font: "happy-o" }),
        pos(width() / 2, height() / 2 + 108),
        scale(3),
        anchor("center"),
    ]);

    // go back to game by pressing space or click/tap
    // wait so you won't trigger it right away accidentally after losing
    wait(0.2, () => {
        onKeyPress("space", () => go("game"));
        onMousePress(() => go("game"));
    });
});

onLoad(() => go("game"));
