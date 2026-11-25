/**
 * @file Ghost Busting
 * @description Catch the ghosts with a flashlight
 * @difficulty 2
 * @tags game, effects
 * @minver 4000.0
 * @category games
 */

// Made by Scriptie
// 1st Place in Spooky & Tiny Jam

kaplay({ background: "black" });

loadBean();
loadSprite("ghostiny", "/crew/ghostiny.png");
loadSprite("pumpka", "/crew/pumpka.png");
loadSprite("mark", "/crew/mark.png");
loadSound("yippee", "/sounds/yipee.mp3");
loadSound("mystic", "/sounds/mystic.mp3");
loadSound("slot", "/sounds/slot.mp3");
loadSound("danger", "/sounds/danger.mp3");
loadMusic("OtherworldlyFoe", "/sounds/OtherworldlyFoe.mp3");
loadHappy();

const DEFAULT_BEAM_RADIUS = 65;
const DEFAULT_CAPTURE_RADIUS = 50;

const gameStuff = {
    beam: {
        radius: DEFAULT_BEAM_RADIUS,
        color: Color.fromHex("#e6e67c"),
        captureRadius: DEFAULT_CAPTURE_RADIUS,
        captureColor: Color.fromHex("#f4f4d3"),
    },
    play: {
        time: 45,
        music: null,
    },
    score: {
        caught: 0,
        hurt: 0,
    },
    ghost: {
        spawnRateSec: 0.3,
        strideX: 2,
        strideY: 2,
        catchDuration: 0.5,
        lifespanRange: [2, 3],
        opacityRange: [0.1, 0.3],
    },
    friendly: {
        dazzleDuration: 0.75,
        lifespanRange: [3, 5],
        strideX: 2,
        strideY: 2,
    },
    powerup: {
        lifespanRange: [1, 3],
        boostRadius: 10,
    },
};

const posOrNeg = (bias = 0.5) => chance(bias) ? 1 : -1;

const wander = (
    strideX = gameStuff.ghost.strideX,
    strideY = gameStuff.ghost.strideY,
) => ({
    id: "wander",
    require: ["pos"],
    wandering: true,
    update() {
        if (!this.wandering) return;
        this.moveBy(
            strideX * posOrNeg(),
            strideY * posOrNeg(),
        );
    },
});

const wrapPos = () => ({
    id: "wrap-pos",
    require: ["pos"],
    update() {
        this.moveTo(
            this.pos.x % width(),
            this.pos.y % height(),
        );
    },
});

const followMouse = () => ({
    id: "follow-mouse",
    require: ["pos"],
    update() {
        this.pos = mousePos();
    },
});

const catchable = (
    catchingDuration = gameStuff.ghost.catchDuration,
    onCatch = () => {},
) => ({
    id: "catchable",
    catchingDuration,
    currentCatchDuration: 0,
    catchingBy: null,
    startCatch(by) {
        this.catchingBy = by.id;
    },
    stopCatch() {
        this.catchingBy = null;
        this.currentCatchDuration = 0;
    },
    completeCatch() {
        this.trigger("caught", this);
        onCatch(this);
        this.caughtBy = this.catchingBy;
        this.opacity = 0;

        if (this.wandering) {
            this.wandering = false;
            this.wait(0.2, () => {
                this.destroy();
            });
        }
    },
    update() {
        if (!this.catchingBy || this.caughtBy) return;

        this.currentCatchDuration += dt();

        if (this.currentCatchDuration >= this.catchingDuration) {
            this.completeCatch();
        }
        return;
    },
});

const ghostCatcher = () => {
    return {
        id: "catcher",
        require: ["pos"],
        illuminated: [],
        caught: [],
        active: true,
        update() {
            this.illuminated = !this.active ? [] : this.query({
                include: "catchable",
                distance: gameStuff.beam.radius,
                hierarchy: "siblings",
            });

            this.caught = !this.active ? [] : this.query({
                include: "catchable",
                distance: gameStuff.beam.captureRadius,
                hierarchy: "siblings",
            });

            this.caught.forEach(ghost => ghost.startCatch(this));

            get("catchable")
                .filter(ghost => !this.caught.some(g => ghost.id === g.id))
                .forEach(ghost => ghost.stopCatch?.());
        },
        draw() {
            this.illuminated.forEach(caught => {
                drawMasked(
                    () => {
                        if (!caught.sprite) return;
                        // don't look! the scariest code of all...
                        const ghostPos = this.fromScreen(toScreen(caught.pos));
                        const ghostShadow = ghostPos.add(4);
                        drawSprite({
                            sprite: caught.sprite,
                            pos: ghostShadow,
                            anchor: "center",
                            color: BLACK,
                        });
                        if (caught.caughtBy) return;
                        drawSprite({
                            sprite: caught.sprite,
                            pos: ghostPos,
                            anchor: "center",
                        });
                    },
                    () =>
                        drawCircle({
                            radius: gameStuff.beam.radius,
                        }),
                );
            });
        },
    };
};

const lowBattery = () => ({
    id: "low-battery",
    require: ["catcher"],
    blinkTime: [0.1, 0.2],
    offUntil: 0,
    update() {
        const now = time();
        if (this.offUntil > now) return;

        const val = wave(0.475, 1, time());
        const on = val > 0.5 ? 1 : chance(0.75);

        if (!on) {
            const [lower, upper] = this.blinkTime;
            this.offUntil = now + rand(lower, upper);
            this.active = false;
            return;
        }

        this.active = true;
    },
});

const batteryOpacity = () => ({
    id: "battery-opacity",
    require: ["catcher", "opacity"],
    update() {
        this.opacity = this.active;
    },
});

const randPos = () =>
    pos(
        rand(Math.max(1000, width())),
        rand(Math.max(1000, height())),
    );

const wanderer = () => [
    "wanderer",
    z(2),
    randPos(),
    wander(),
    wrapPos(),
    color(),
    timer(),
];

const ghost = () => [
    ...wanderer(),
    "ghost",
    "catchable",
    sprite("ghostiny"),
    anchor("center"),
    catchable(
        gameStuff.ghost.catchDuration,
        (ghost) => {
            gameStuff.score.caught++;
            play("yippee", { detune: randi(0, 4) * 100 * posOrNeg() });
            add(floatingScore({ val: "+100", from: ghost.pos }));
        },
    ),
    opacity(rand(...gameStuff.ghost.opacityRange)),
    lifespan(rand(...gameStuff.ghost.lifespanRange)),
];

const friendly = () => [
    ...wanderer(),
    "friendly",
    "catchable",
    sprite("mark"),
    anchor("center"),
    opacity(0.1),
    catchable(
        gameStuff.friendly.dazzleDuration,
        (friendly) => {
            gameStuff.score.hurt++;
            burp();
            add(floatingScore({
                val: "-100",
                col: "#ff2f00",
                from: friendly.pos,
            }));
        },
    ),
    lifespan(rand(...gameStuff.friendly.lifespanRange)),
];

const powerup = () => [
    "powerup",
    "catchable",
    z(2),
    randPos(),
    sprite("pumpka"),
    anchor("center"),
    catchable(0.25, (powerup) => {
        gameStuff.beam.captureRadius += gameStuff.powerup.boostRadius;
        gameStuff.beam.radius += gameStuff.powerup.boostRadius;
        play("danger");
        powerup.destroy();
    }),
    opacity(0.8),
    lifespan(rand(...gameStuff.powerup.lifespanRange)),
];

const beam = add([
    "beam",
    z(1),
    pos(),
    {
        draw() {
            drawCircle({
                color: gameStuff.beam.color,
                radius: gameStuff.beam.radius,
                opacity: this.opacity,
            });

            drawCircle({
                color: gameStuff.beam.captureColor,
                radius: gameStuff.beam.captureRadius,
                opacity: this.opacity,
            });
        },
    },
    followMouse(),
    ghostCatcher(),
    lowBattery(),
    batteryOpacity(),
    opacity(0.5),
]);

const clock = add([
    "clock",
    pos(center().x, 30),
    anchor("center"),
    text(gameStuff.play.time, { font: "happy" }),
    color(RED),
    {
        started: false,
        remaining: gameStuff.play.time,
        start() {
            this.started = true;
        },
        reset() {
            this.remaining = gameStuff.play.time;
        },
        update() {
            if (!this.started) return;
            this.remaining -= dt();
            const formatted = Math.max(
                Math.floor(this.remaining),
                0,
            );
            this.text = formatted;
            if (formatted === 0) {
                this.trigger("timeout");
                this.started = false;
            }
        },
    },
]);

const score = add([
    pos(center().x, 70),
    anchor("center"),
    text(0, { font: "happy" }),
    {
        update() {
            this.text = gameStuff.score.caught * 100;
        },
    },
]);

setCursor("none");

const startBtn = add([
    z(2),
    pos(center()),
    anchor("center"),
    area(),
    color(GREEN),
    text("start", { font: "happy" }),
]);

let spawnLoop;

const start = () => {
    play("slot");
    gameStuff.score.caught = 0;
    gameStuff.beam.radius = DEFAULT_BEAM_RADIUS;
    gameStuff.beam.captureRadius = DEFAULT_CAPTURE_RADIUS;
    startBtn.hidden = true;
    wait(0.25, () => gameStuff.play.music = play("OtherworldlyFoe"));
    wait(4, () => {
        clock.reset();
        clock.start();
        spawnLoop = loop(gameStuff.ghost.spawnRateSec, () => {
            if (clock.remaining < 0) return;
            const powerupChance = chance(0.1);
            if (powerupChance) return add(powerup());
            const spawned = chance(0.9) ? ghost() : friendly();
            add(spawned);
        });
    });
};

startBtn.onClick(start);

const floatingScore = ({ val, from, col = "#ff9d00" }) => [
    z(2),
    text(val, { size: 18, font: "happy" }),
    color(col),
    pos(from.sub(0, 20)),
    scale(1),
    opacity(1),
    lifespan(1),
    move(vec2(0, -1), 90),
];

on("destroy", "ghost", (ghost) => {
    if (ghost.caughtBy) return;
    play("mystic", { volume: 0.05, detune: randi(0, 4) * 100 * posOrNeg() });
});

on("timeout", "clock", () => {
    spawnLoop.cancel();
    get("ghost").forEach(ghost => ghost.destroy());
    gameStuff.play.music?.stop();

    startBtn.text = "...again!";
    startBtn.hidden = false;
});
