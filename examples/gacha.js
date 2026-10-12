/**
 * @file Gacha Machine
 * @description Drops a random item based on assigned probabilities
 * @difficulty 1
 * @tags basics, math, game
 * @minver 4000.0
 * @category concepts
 */

kaplay({
    background: "#f2ae99",
    font: "happy",
    width: Math.max(innerWidth, 540),
    height: Math.max(innerHeight, 540),
    letterbox: true,
    crisp: true,
});

// Prize sprite & probability
const crew = {
    "bean": 20,
    "zombean": 15,
    "beant": 10,
    "ghosty": 10,
    "ghostiny": 2,
    "bobo": 5,
    "bag": 5,
    "kat": 3,
    "marroc": 3,
    "mark": 1,
};

const crewSprites = Object.keys(crew);
loadBitmapFont("happy", "/crew/happy-o.png", 36, 45);
crewSprites.forEach(s => loadSprite(s, `/sprites/${s}.png`));
loadSprite("moneybag", "/crew/money_bag.png");
loadSprite("question_mark", "/crew/question_mark.png");
loadSprite("coin", "/crew/coin.png");

loadSound("coin_drop", "/sounds/coin_drop.mp3");
loadSound("slot", "/sounds/slot.mp3");
loadSound("slotmachine_drop", "/sounds/slotmachine_drop.mp3");
loadSound("yipee", "/sounds/yipee.mp3");
loadSound("wooosh", "/sounds/wooosh.mp3");

const cursors = {
    "default": `url("/sprites/cursor_default.png") 8 6, default`,
    "pointer": `url("/sprites/cursor_pointer.png") 8 4, pointer`,
    "grabbing": `url("/sprites/grab.png") 8 6, grabbing`,
};
setCursor(cursors.default);

setGravity(3600);

const prize = add([
    sprite("mark"),
    pos(center().add(0, 125)),
    anchor("center"),
    opacity(1),
    scale(1.5),
    z(1),
    area(),
    timer(),
    "hover_pointer",
]);
prize.hidden = true;

// Triggered by inserting a coin
prize.on("drop", () => {
    const result = gacha(crew); // as simple as that!

    prize.sprite = result;
    prize.hidden = false;
    prize.tween(
        prize.pos.sub(0, 40),
        prize.pos,
        0.25,
        v => prize.pos = v,
        easings.easeOutBounce,
    );
    prize.tween(
        vec2(0.25),
        prize.scale,
        0.25,
        v => prize.scale = v,
        easings.easeOutQuad,
    );

    shake(8);
    machine.window.shake = 6;
    play("slotmachine_drop");
    if (crew[result] == 1) play("yipee");

    const claim = () => {
        play("wooosh");
        setCursor(cursors.default);

        prize.tween(
            prize.scale,
            vec2(4),
            0.25,
            v => prize.scale = v,
            easings.easeOutQuad,
        );

        prize.tween(
            prize.opacity,
            0,
            0.25,
            v => prize.opacity = v,
            easings.easeOutQuad,
        ).then(() => {
            prize.hidden = true;
            prize.scale = vec2(1.5);
            prize.opacity = 1;
            coin.enterState("init");
        });
    };

    const autoClaim = wait(2, claim);
    prize.onClick(() => {
        if (autoClaim.timeLeft < 0.1) return cancel();
        autoClaim.cancel();
        claim();
        return cancel();
    });
});

const defaultOutline = {
    width: 6,
    color: rgb("#1f102a"),
    opacity: 1,
    join: "bevel",
};

// The machine drawing
const machine = add([
    pos(center().sub(0, -225)),
    anchor("bot"),
    {
        slotOpt: {
            pos: vec2(0, -188),
            width: 50,
            height: 8,
            color: rgb("#a32858"),
            outline: defaultOutline,
            anchor: "bot",
        },
        draw() {
            // Stand
            drawPolygon({
                pts: [
                    vec2(-150 - 4, 0),
                    vec2(-150 + 10, -32),
                    vec2(150 - 10, -32),
                    vec2(150 + 4, 0),
                ],
                color: rgb("#a32858"),
                outline: defaultOutline,
            });

            // Body
            drawRect({
                pos: vec2(0, -32),
                width: 300,
                height: 400,
                color: rgb("#cc425e"),
                outline: defaultOutline,
                radius: 20,
                anchor: this.anchor,
            });

            // Top
            drawRect({
                pos: vec2(0, -424),
                width: 312,
                height: 42,
                color: rgb("#ea6262"),
                outline: defaultOutline,
                radius: [40, 40, 4, 4],
                anchor: this.anchor,
            });
            drawText({
                pos: vec2(0, -462),
                text: "Gacha 4000",
                size: 32,
                letterSpacing: -4,
                width: 300,
                align: "center",
                color: rgb("#fcef8d"),
                anchor: "top",
            });

            // Window inset with a coin slot
            drawRect({
                pos: vec2(0, -172),
                width: 300 - 24 + 4,
                height: 240,
                color: rgb("#ea6262"),
                radius: 32,
                anchor: this.anchor,
            });
            drawRect(this.slotOpt);

            // Output
            drawCircle({
                pos: vec2(0, -42),
                radius: 60,
                color: rgb("#ea6262"),
                outline: defaultOutline,
                anchor: "bot",
            });
            drawCircle({
                pos: vec2(0, -66),
                radius: 48,
                color: rgb("#a32858"),
                outline: defaultOutline,
                anchor: "bot",
            });

            // Stickers
            drawSprite({
                sprite: "moneybag",
                pos: vec2(-150 + 16, -100),
                angle: -6,
                anchor: "botleft",
            });
            drawSprite({
                sprite: "question_mark",
                pos: vec2(150 - 16, -46),
                anchor: "botright",
            });
        },
    },
]);

machine.window = machine.add([
    pos(0, -212),
    rect(300 - 24, 200, { radius: 24 }),
    color("#a32858"),
    outline(...Object.values(defaultOutline)),
    anchor(machine.anchor),
    {
        shake: 0,
        add() {
            const maskOffset = defaultOutline.width / 2;
            // Prepare crew data first to be then drawn
            const crew = Array(4).fill(crewSprites)
                .flat()
                .slice(0, Math.max(crewSprites.length, 24))
                .sort(() => rand() - 0.5)
                .map((s, i) => {
                    const perRow = 6;
                    const perCol = 4;
                    const batch = Math.floor(i / perRow);
                    const j = i % perRow;

                    const bw = this.width / perRow;
                    const bh = (-this.height + 25) / perCol;
                    const uy = bh * 0.2;
                    const ux = bw * 0.5;

                    const minX = j * bw + (bw - ux) / 2;
                    const minY = batch * bh + (bh - uy) / 2;

                    // Sprite, pos, angle
                    return [
                        s,
                        vec2(
                            randi(minX, minX + ux),
                            randi(minY, minY + uy),
                        ),
                        randi(-120, 120),
                    ];
                })
                .reverse();

            this.onDraw(() => {
                drawMasked(() => {
                    // Crew behind the window
                    this.shake = lerp(this.shake, 0, 8 * dt());
                    crew.forEach(([sprite, pos, angle]) => {
                        drawSprite({
                            sprite,
                            pos: pos.sub(this.width / 2, 0).add(
                                randi() * this.shake,
                                randi() * this.shake,
                            ),
                            anchor: "center",
                            scale: vec2(1.5),
                            angle,
                        });
                    });

                    // Glass with reflection
                    drawRect({
                        pos: vec2(0, -maskOffset),
                        width: this.width,
                        height: this.height,
                        radius: 20,
                        anchor: this.anchor,
                        color: rgb("#aee2ff"),
                        opacity: 0.2,
                    });
                    drawRect({
                        pos: vec2(-30, 30),
                        width: 60,
                        height: this.height * 1.5,
                        angle: 45,
                        color: WHITE,
                        opacity: 0.4,
                        anchor: this.anchor,
                    });
                }, () => {
                    // Window mask
                    drawRect({
                        pos: vec2(0, -maskOffset),
                        width: this.width - maskOffset * 2,
                        height: this.height - maskOffset * 2,
                        radius: 20,
                        anchor: this.anchor,
                    });
                });
            });
        },
    },
]);

// Mask object for coin inserting
const slot = machine.add([
    // Positioned on the bottom edge of slot drawing
    pos(machine.slotOpt.pos.sub(
        (machine.slotOpt.width + machine.slotOpt.outline.width) / 2,
        machine.slotOpt.outline.width / 2,
    )),
    anchor(machine.slotOpt.anchor),
    // Height is 0 as it should be masking only when coin fits
    rect(machine.slotOpt.width + machine.slotOpt.outline.width, 0),
    outline(...Object.values(defaultOutline)),
    area({ isSensor: true }),
    mask("subtract"),
    {
        coinFits: false,
        update() {
            const coinY = coin.pos.y - coin.height / 2 + this.pos.y;
            if (coinY > this.pos.y) {
                // Coin has dropped and missed the slot
                if (!this.coinFits && coin?.vel?.y && coin.state != "missed") {
                    coin.enterState("missed");
                }

                // Coin was fully inserted
                if (this.coinFits && coin.state != "inserted") {
                    coin.enterState("inserted");
                    shake(4);
                    play("slot");
                    wait(0.5, () => prize.trigger("drop"));
                }
                return;
            }

            // Check if coin fits
            const coinStartX = coin.pos.x - (coin.width * coin.scale.x) / 2
                + this.pos.x;
            const coinEndX = coinStartX + coin.width * coin.scale.x;
            this.coinFits = coinStartX > this.pos.x
                && coinEndX < this.pos.x + this.width;
        },
        draw() {
            // Enlarges the mask without affecting its position relative to the machine
            if (this.coinFits) {
                drawRect({
                    pos: vec2(-width(), 0),
                    width: width() * 2,
                    height: height(),
                });
            }
        },
    },
]);

// Coin is a child of the slot that is a mask
const coin = slot.add([
    sprite("coin"),
    pos(232, -10),
    anchor("center"),
    area(),
    offscreen(),
    timer(),
    scale(1.5),
    z(1),
    state("init", ["init", "missed", "inserted"]),
    "hover_grabbing",
    {
        add() {
            let drag;
            let dragEnd;

            this.onClick(() => {
                this.unuse("body");

                const dragOffset = mousePos().scale(1 / getCamScale().x).sub(
                    this.pos,
                );

                drag = this.onMouseDown(() => {
                    this.pos = mousePos().scale(1 / getCamScale().x).sub(
                        dragOffset,
                    );
                });

                dragEnd = this.onMouseRelease(() => {
                    drag?.cancel();
                    this.use(body());
                    return cancel();
                });
            });

            this.onStateEnter("init", () => {
                if (this.paused || this.has("body")) {
                    this.unuse("body");
                    this.pos = vec2(choose([232, -180]), randi(-180, 80));
                    play("coin_drop");
                }

                this.paused = false;
                this.hidden = false;

                this.tween(
                    vec2(0),
                    this.scale,
                    0.25,
                    v => this.scale = v,
                    easings.easeOutBack,
                );
            });

            this.onStateEnter("missed", () => {
                play("wooosh");
            });

            this.onStateEnter("inserted", () => {
                this.hidden = true;
                this.paused = true;
                // Instead of destroying we just reset coin and listen for init state again
                drag?.cancel();
                dragEnd?.cancel();
                this.pos = vec2(0);
            });

            this.onExitScreen(() => this.enterState("init"));
        },
    },
]);

Object.keys(cursors).forEach(c => {
    onHover(
        `hover_${c}`,
        (o) =>
            setCursor(
                !o.hidden ? cursors?.[c] || cursors.default : cursors.default,
            ),
    );
    onHoverEnd(`hover_${c}`, () => setCursor(cursors.default));
});
