/**
 * @file Candles
 * @description Steal the candles and don't get caught!
 * @difficulty 2
 * @tags game, effects, ai
 * @minver 4000.0
 * @category games
 */

// Made by Suave
// 1st Place in Spooky & Tiny Jam

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const SCREEN_CENTER_X = SCREEN_WIDTH / 2;
const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

kaplay({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    letterbox: true,
    background: [0, 0, 0],
    scale: window.innerWidth / SCREEN_WIDTH,
    pixelDensity: Math.min(2, devicePixelRatio),
    broadPhaseCollisionAlgorithm: "grid",
});

const MAX_LEVEL = 5;
const MAX_WORLD_SCALE = 3;

const GRAVE_DENSITY_DIVISOR = 30;
const GRAVE_CENTER_CLEARANCE = 120;
const GRAVE_SPAWN_MARGIN_X = 60;
const GRAVE_SPAWN_MARGIN_Y = 70;

const BASE_CANDLES_PER_LEVEL = 4;
const CANDLES_PER_LEVEL = 2;
const CANDLE_SPAWN_MARGIN_X = 60;
const CANDLE_SPAWN_MARGIN_Y = 70;
const CANDLE_GRAVE_OFFSET_X = 13;
const CANDLE_GRAVE_OFFSET_Y = 17;
const CANDLE_GRAVE_CLEARANCE = 34;
const CANDLE_MIN_SPACING = 60;

const BLOOD_RED = rgb(201, 0, 34);
const CANDLE_WAX = rgb(242, 196, 109);
const BONE_WHITE = rgb(249, 246, 238);
const DIM_GREY = rgb(105, 105, 105);
const NIGHT_BLACK = rgb(0, 0, 0);
const PEBBLE = rgb(44, 52, 60);

const FLARE_COST = 25;
const FLARE_COOLDOWN = 6;
const WALK_SPEED = 160;
const SPRINT_SPEED = 250;

const PLAYER_SIZE = 14;
const PLAYER_WORLD_PADDING = 8;
const PLAYER_CANDLE_CLEARANCE = 120;
const PLAYER_FLARE_FLASH_OPACITY = 0.35;

const GHOST_SPAWN_CANDIDATE_COUNT = 14;
const GHOST_PHASE_RANGE = 6;
const GHOST_MIN_SPEED = 0.85;
const GHOST_MAX_SPEED = 1.15;

const GHOST_LIT_CHASE_SPEED = 34;
const GHOST_UNLIT_CHASE_SPEED = 64;
const GHOST_TIME_SPEED_RAMP = 0.6;
const GHOST_LEVEL_SPEED_RAMP = 5;
const GHOST_NO_LIGHT_SPEED_MULTIPLIER = 1.8;

const GHOST_SEPARATION_DISTANCE = 34;
const GHOST_SEPARATION_FORCE = 40;
const GHOST_WOBBLE_FREQUENCY = 4;
const GHOST_WOBBLE_AMPLITUDE = 0.4;

const GHOST_VISIBLE_OPACITY = 0.9;
const GHOST_EYE_FLICKER_CHANCE = 0.08;
const GHOST_EYE_FADE_DISTANCE = 500;
const GHOST_EYE_MIN_OPACITY = 0.15;
const GHOST_EYE_MAX_OPACITY = 0.9;
const GHOST_FLARE_ESCAPE_DISTANCE = 240;

const MAX_LIGHT_RADIUS = 170;
const STARTING_LIGHT_RADIUS = 140;
const CANDLE_LIGHT_BONUS = 55;

const LOW_LIGHT_THRESHOLD = 50;
const LOW_LIGHT_FLICKER_CHANCE = 0.25;
const LOW_LIGHT_RADIUS_MULTIPLIER = 0.5;
const LIGHT_RADIUS_FLICKER_VARIANCE = 4;
const FLARE_LIGHT_RADIUS = 300;

const CANDLE_GLOW_RADIUS = 26;
const CANDLE_GLOW_VARIANCE = 2;
const LIGHT_DARKNESS_OPACITY = 0.9;
const LIGHT_FALLOFF_OPACITY = 0.35;
const LIGHT_FALLOFF_LAYER_COUNT = 5;
const PLAYER_LIGHT_FALLOFF_PER_LAYER = 0.09;
const CANDLE_LIGHT_FALLOFF_PER_LAYER = 0.15;

const LIGHT_DRAIN_BASE_RATE = 7;
const LIGHT_DRAIN_PER_CANDLE = 1.2;
const LIGHT_DRAIN_PER_LEVEL = 1.5;
const SPRINT_LIGHT_DRAIN_MULTIPLIER = 2;

const FLARE_SOUND_VOLUME = 0.6;
const HEARTBEAT_MAX_HEARING_DISTANCE = 400;
const HEARTBEAT_MIN_VOLUME = 0.05;
const HEARTBEAT_MAX_VOLUME = 0.6;
const HEARTBEAT_PAN = -800;
const HEARTBEAT_INTERVAL_DISTANCE = 250;
const HEARTBEAT_MIN_INTERVAL = 0.28;
const HEARTBEAT_MAX_INTERVAL = 1.4;

loadSprite("player", "/crew/mark.png");
loadSprite("ghost", "/crew/ghostiny.png");
loadSound("score", "/sounds/score.mp3");
loadSound("explode", "/sounds/explode.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("bell", "/sounds/bell.mp3");
loadSound("yipee", "/sounds/yipee.mp3");

scene(
    "message",
    ({
        title = "",
        titleColor = BONE_WHITE,
        background = null,
        lines = [],
        nextScene = "",
        nextData = {},
    }) => {
        setCamPos(SCREEN_CENTER_X, SCREEN_CENTER_Y);

        if (background) {
            add([rect(SCREEN_WIDTH, SCREEN_HEIGHT), color(background)]);
        }

        add([
            text(title, { size: 40 }),
            pos(SCREEN_CENTER_X, SCREEN_CENTER_Y - 50),
            anchor("center"),
            color(titleColor),
        ]);

        lines.forEach(([lineText, lineColor], index) => {
            add([
                text(lineText, { size: 14 }),
                pos(SCREEN_CENTER_X, SCREEN_CENTER_Y + 4 + index * 26),
                anchor("center"),
                color(lineColor),
            ]);
        });

        const start = add([
            text("press space", { size: 14 }),
            pos(SCREEN_CENTER_X, SCREEN_CENTER_Y + 120),
            anchor("center"),
            color(CANDLE_WAX),
            opacity(1),
        ]);

        start.onUpdate(() => {
            start.opacity = 0.5 + Math.sin(time() * 4) / 2;
        });

        wait(0.4, () => onKeyPress("space", () => go(nextScene, nextData)));
    },
);

scene("play", ({ level = 1, totalCandles = 0 } = {}) => {
    const maximumWorldWidth = SCREEN_WIDTH * MAX_WORLD_SCALE;
    const worldWidth = Math.min(
        SCREEN_WIDTH + (level - 1) * SCREEN_CENTER_X,
        maximumWorldWidth,
    );
    const worldHeight = Math.min(
        SCREEN_HEIGHT + (level - 1) * SCREEN_CENTER_Y,
        SCREEN_HEIGHT * MAX_WORLD_SCALE,
    );
    const candlesInLevel = BASE_CANDLES_PER_LEVEL + level * CANDLES_PER_LEVEL;
    const worldCenter = vec2(worldWidth / 2, worldHeight / 2);
    const graveCount = (worldWidth * worldHeight)
        / (SCREEN_WIDTH * GRAVE_DENSITY_DIVISOR);

    let candlesStolen = 0;
    let timeElapsed = 0;
    let isOver = false;
    let lightRadius = STARTING_LIGHT_RADIUS;
    let flareBrightness = 0;
    let flareCooldown = 0;
    let heartbeatTimer = 0;

    beginPicture();
    for (let i = 0; i < (worldWidth * worldHeight) / maximumWorldWidth; i++) {
        drawRect({
            pos: vec2(rand(worldWidth), rand(worldHeight)),
            width: rand(2, 7),
            height: rand(2, 5),
            color: PEBBLE,
        });
    }
    const pebbles = endPicture();

    let gravePositions = [];
    for (let i = 0; i < graveCount; i++) {
        const gravePosition = vec2(
            rand(GRAVE_SPAWN_MARGIN_X, worldWidth - GRAVE_SPAWN_MARGIN_X),
            rand(GRAVE_SPAWN_MARGIN_Y, worldHeight - GRAVE_SPAWN_MARGIN_Y),
        );

        if (gravePosition.dist(worldCenter) > GRAVE_CENTER_CLEARANCE) {
            gravePositions.push(gravePosition);
        }
    }
    gravePositions.sort((a, b) => a.y - b.y);
    beginPicture();
    gravePositions.forEach(gravePosition => {
        add([
            pos(gravePosition),
            area({
                shape: new Rect(vec2(0), 26, 34),
                collisionIgnore: ["grave", "candle", "ghost"],
            }),
            body({ isStatic: true }),
            "grave",
        ]);

        drawRect({
            pos: gravePosition,
            width: 26,
            height: 34,
            radius: [12, 12, 2, 2],
            color: DIM_GREY,
            outline: {
                width: 4,
                color: BLACK,
            },
        });

        drawRect({
            pos: gravePosition.add(7, 12),
            width: 12,
            height: 2,
            color: PEBBLE,
        });
    });
    const graves = endPicture();

    onDraw(() => {
        drawPicture(pebbles, {});
        drawPicture(graves, {});
    });

    const player = add([
        sprite("player", { width: PLAYER_SIZE, height: PLAYER_SIZE }),
        pos(worldCenter),
        anchor("center"),
        area(),
        body(),
    ]);

    while (get("candle").length < candlesInLevel) {
        const candlePosition = vec2(
            rand(CANDLE_SPAWN_MARGIN_X, worldWidth - CANDLE_SPAWN_MARGIN_X),
            rand(CANDLE_SPAWN_MARGIN_Y, worldHeight - CANDLE_SPAWN_MARGIN_Y),
        );
        const tooCloseToPlayer =
            candlePosition.dist(player.pos) <= PLAYER_CANDLE_CLEARANCE;
        const insideGrave = get("grave").some(
            (grave) =>
                grave.pos
                    .add(CANDLE_GRAVE_OFFSET_X, CANDLE_GRAVE_OFFSET_Y)
                    .dist(candlePosition) < CANDLE_GRAVE_CLEARANCE,
        );
        const nearAnotherCandle = get("candle").some(
            (candle) => candle.pos.dist(candlePosition) < CANDLE_MIN_SPACING,
        );

        if (tooCloseToPlayer || insideGrave || nearAnotherCandle) continue;

        add([
            rect(6, 12),
            pos(candlePosition),
            anchor("center"),
            color(CANDLE_WAX),
            area({
                isSensor: true,
                collisionIgnore: ["candle", "grave", "ghost"],
            }),
            "candle",
        ]);
    }

    function farFromPlayer() {
        const positions = Array.from(
            { length: GHOST_SPAWN_CANDIDATE_COUNT },
            () => vec2(rand(worldWidth), rand(worldHeight)),
        );

        positions.sort(
            (first, second) => second.dist(player.pos) - first.dist(player.pos),
        );

        return positions[0];
    }

    function spawnGhost() {
        add([
            sprite("ghost"),
            pos(farFromPlayer()),
            anchor("center"),
            opacity(0),
            scale(1),
            area({
                isSensor: true,
                collisionIgnore: ["ghost", "candle", "grave"],
            }),
            {
                phase: rand(GHOST_PHASE_RANGE),
                speed: rand(GHOST_MIN_SPEED, GHOST_MAX_SPEED),
            },
            "ghost",
        ]);
    }

    for (let index = 0; index < level; index++) spawnGhost();

    const endLevel = (won, catchingGhost) => {
        if (isOver) return;

        isOver = true;

        const total = totalCandles + candlesStolen;

        if (won) {
            wait(0.4, () => {
                if (level < MAX_LEVEL) {
                    play("bell");

                    go("message", {
                        title: `GRAVEYARD ${level} CLEARED`,
                        lines: [[`${total} candles stolen`, BONE_WHITE]],
                        nextScene: "play",
                        nextData: { level: level + 1, totalCandles: total },
                    });
                }
                else {
                    play("yipee");

                    go("message", {
                        title: "YOU ESCAPED",
                        lines: [
                            [
                                `all ${MAX_LEVEL} graveyards with ${total} candles stolen`,
                                CANDLE_WAX,
                            ],
                        ],
                        nextScene: "play",
                    });
                }
            });

            return;
        }

        play("explode");
        shake(14);

        catchingGhost.opacity = 1;
        catchingGhost.use(z(1));

        tween(
            1,
            3,
            0.3,
            (value) => {
                catchingGhost.scale = vec2(value);
            },
            easings.easeOutQuad,
        );

        wait(0.9, () =>
            go("message", {
                title: "THEY FOUND YOU",
                lines: [[
                    `graveyard ${level}  ${total} candles stolen`,
                    BONE_WHITE,
                ]],
                nextScene: "play",
            }));
    };

    player.onCollide("candle", (candle) => {
        play("score");

        destroy(candle);

        candlesStolen++;

        lightRadius = Math.min(
            lightRadius + CANDLE_LIGHT_BONUS,
            MAX_LIGHT_RADIUS,
        );

        spawnGhost();

        if (candlesStolen === candlesInLevel) {
            endLevel(true);
        }
    });

    player.onCollide("ghost", (ghost) => endLevel(false, ghost));

    add([
        z(100),
        {
            draw() {
                const flickering = lightRadius < LOW_LIGHT_THRESHOLD
                    && rand() < LOW_LIGHT_FLICKER_CHANCE;
                const playerRadius = flareBrightness > 0
                    ? FLARE_LIGHT_RADIUS
                    : Math.max(
                        0,
                        (flickering
                            ? lightRadius * LOW_LIGHT_RADIUS_MULTIPLIER
                            : lightRadius) + rand(
                                -LIGHT_RADIUS_FLICKER_VARIANCE,
                                LIGHT_RADIUS_FLICKER_VARIANCE,
                            ),
                    );

                const drawLightHoles = (layer) => () => {
                    if (playerRadius > 0) {
                        drawCircle({
                            pos: player.pos,
                            radius: playerRadius
                                * (1 - layer * PLAYER_LIGHT_FALLOFF_PER_LAYER),
                        });
                    }
                    for (const candle of get("candle")) {
                        drawCircle({
                            pos: candle.pos,
                            radius: CANDLE_GLOW_RADIUS
                                    * (1
                                        - layer
                                            * CANDLE_LIGHT_FALLOFF_PER_LAYER)
                                + rand(
                                    -CANDLE_GLOW_VARIANCE,
                                    CANDLE_GLOW_VARIANCE,
                                ),
                        });
                    }
                };

                const drawDarkness = (opacityValue) => {
                    drawRect({
                        pos: vec2(-SCREEN_WIDTH, -SCREEN_HEIGHT),
                        width: worldWidth + 2 * SCREEN_WIDTH,
                        height: worldHeight + 2 * SCREEN_HEIGHT,
                        color: NIGHT_BLACK,
                        opacity: opacityValue,
                    });
                };

                drawSubtracted(
                    () => drawDarkness(LIGHT_DARKNESS_OPACITY),
                    drawLightHoles(0),
                );

                for (
                    let layer = 1;
                    layer <= LIGHT_FALLOFF_LAYER_COUNT;
                    layer++
                ) {
                    drawSubtracted(
                        () => drawDarkness(LIGHT_FALLOFF_OPACITY),
                        drawLightHoles(layer),
                    );
                }

                for (const ghost of get("ghost")) {
                    if (
                        ghost.opacity !== 0
                        || rand() <= GHOST_EYE_FLICKER_CHANCE
                    ) {
                        continue;
                    }

                    const eyeOpacity = clamp(
                        1
                            - ghost.pos.dist(player.pos)
                                / GHOST_EYE_FADE_DISTANCE,
                        GHOST_EYE_MIN_OPACITY,
                        GHOST_EYE_MAX_OPACITY,
                    );

                    drawCircle({
                        pos: ghost.pos.add(-4, -5),
                        radius: 2,
                        color: BLOOD_RED,
                        opacity: eyeOpacity,
                    });
                    drawCircle({
                        pos: ghost.pos.add(3, -5),
                        radius: 2,
                        color: BLOOD_RED,
                        opacity: eyeOpacity,
                    });
                }
            },
        },
    ]);

    const statusText = add([
        text("", { size: 13 }),
        pos(12, 10),
        color(CANDLE_WAX),
        fixed(),
        z(100),
    ]);

    add([
        fixed(),
        z(200),
        {
            draw() {
                drawRect({
                    pos: vec2(12, 30),
                    width: 160,
                    height: 6,
                    color: rgb(40, 34, 44),
                });
                drawRect({
                    pos: vec2(12, 30),
                    width: (160 * lightRadius) / MAX_LIGHT_RADIUS,
                    height: 6,
                    color: lightRadius < LOW_LIGHT_THRESHOLD
                        ? BONE_WHITE
                        : CANDLE_WAX,
                });

                if (lightRadius <= 0) {
                    drawText({
                        text: "LIGHT IS OUT",
                        size: 13,
                        pos: vec2(180, 27),
                        color: BONE_WHITE,
                    });
                }
                if (flareBrightness > 0) {
                    drawRect({
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT,
                        color: CANDLE_WAX,
                        opacity: flareBrightness,
                    });
                }

                for (const candle of get("candle")) {
                    const screenPosition = toScreen(candle.pos);

                    if (
                        screenPosition.x > 0
                        && screenPosition.x < SCREEN_WIDTH
                        && screenPosition.y > 0
                        && screenPosition.y < SCREEN_HEIGHT
                    ) {
                        continue;
                    }

                    drawCircle({
                        pos: vec2(
                            clamp(screenPosition.x, 8, SCREEN_WIDTH - 8),
                            clamp(screenPosition.y, 48, SCREEN_HEIGHT - 8),
                        ),
                        radius: 3,
                        color: CANDLE_WAX,
                        opacity: 0.4 + Math.sin(time() * 5) * 0.2,
                    });
                }
            },
        },
    ]);

    add([
        text(`GRAVEYARD ${level}`, { size: 32 }),
        pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60),
        anchor("center"),
        color(BLOOD_RED),
        opacity(1),
        fixed(),
        z(210),
        lifespan(0.4, { fade: 1.2 }),
    ]);

    onKeyPress("space", () => {
        if (flareCooldown > 0 || isOver || lightRadius < FLARE_COST) return;

        flareBrightness = PLAYER_FLARE_FLASH_OPACITY;
        flareCooldown = FLARE_COOLDOWN;
        lightRadius -= FLARE_COST;

        play("hit", { volume: FLARE_SOUND_VOLUME });

        for (const ghost of get("ghost")) {
            if (ghost.pos.dist(player.pos) < GHOST_FLARE_ESCAPE_DISTANCE) {
                ghost.pos = farFromPlayer();
            }
        }
    });

    onUpdate(() => {
        if (isOver) return;

        const deltaTime = dt();
        const direction = vec2(
            isKeyDown(["d", "right"]) - isKeyDown(["a", "left"]),
            isKeyDown(["s", "down"]) - isKeyDown(["w", "up"]),
        );
        const isMoving = direction.len() > 0;
        const isSprinting = isKeyDown("shift") && isMoving && lightRadius > 0;

        timeElapsed += deltaTime;
        flareBrightness = Math.max(0, flareBrightness - deltaTime);
        flareCooldown = Math.max(0, flareCooldown - deltaTime);

        if (isMoving) {
            player.move(
                direction.unit().scale(isSprinting ? SPRINT_SPEED : WALK_SPEED),
            );
        }

        player.pos = vec2(
            clamp(
                player.pos.x,
                PLAYER_WORLD_PADDING,
                worldWidth - PLAYER_WORLD_PADDING,
            ),
            clamp(
                player.pos.y,
                PLAYER_WORLD_PADDING,
                worldHeight - PLAYER_WORLD_PADDING,
            ),
        );

        setCamPos(
            clamp(player.pos.x, SCREEN_CENTER_X, worldWidth - SCREEN_CENTER_X),
            clamp(player.pos.y, SCREEN_CENTER_Y, worldHeight - SCREEN_CENTER_Y),
        );

        lightRadius = Math.max(
            0,
            lightRadius
                - deltaTime
                    * (LIGHT_DRAIN_BASE_RATE
                        + candlesStolen * LIGHT_DRAIN_PER_CANDLE
                        + level * LIGHT_DRAIN_PER_LEVEL)
                    * (isSprinting ? SPRINT_LIGHT_DRAIN_MULTIPLIER : 1),
        );

        const ghosts = get("ghost");

        let nearestGhostDistance = Infinity;

        for (const ghost of ghosts) {
            const distance = ghost.pos.dist(player.pos);
            const isLit = distance < lightRadius;

            nearestGhostDistance = Math.min(nearestGhostDistance, distance);

            const speed =
                ((isLit ? GHOST_LIT_CHASE_SPEED : GHOST_UNLIT_CHASE_SPEED)
                    + timeElapsed * GHOST_TIME_SPEED_RAMP
                    + level * GHOST_LEVEL_SPEED_RAMP)
                * (lightRadius > 0 ? 1 : GHOST_NO_LIGHT_SPEED_MULTIPLIER)
                * ghost.speed;

            ghost.moveTo(player.pos, speed);

            for (const otherGhost of ghosts) {
                if (
                    otherGhost !== ghost
                    && (otherGhost.pos.dist(ghost.pos)
                        < GHOST_SEPARATION_DISTANCE)
                ) {
                    ghost.move(
                        ghost.pos.sub(otherGhost.pos).unit().scale(
                            GHOST_SEPARATION_FORCE,
                        ),
                    );
                }
            }

            ghost.pos.y +=
                Math.sin(timeElapsed * GHOST_WOBBLE_FREQUENCY + ghost.phase)
                * GHOST_WOBBLE_AMPLITUDE;
            ghost.opacity = isLit ? GHOST_VISIBLE_OPACITY : 0;
        }

        heartbeatTimer -= deltaTime;

        if (heartbeatTimer <= 0) {
            play("hit", {
                volume: clamp(
                    1 - nearestGhostDistance / HEARTBEAT_MAX_HEARING_DISTANCE,
                    HEARTBEAT_MIN_VOLUME,
                    HEARTBEAT_MAX_VOLUME,
                ),
                detune: HEARTBEAT_PAN,
            });

            heartbeatTimer = clamp(
                nearestGhostDistance / HEARTBEAT_INTERVAL_DISTANCE,
                HEARTBEAT_MIN_INTERVAL,
                HEARTBEAT_MAX_INTERVAL,
            );
        }

        const flareStatus = flareCooldown > 0
            ? `${flareCooldown.toFixed(1)}s`
            : "READY";

        statusText.text =
            `GRAVEYARD ${level}  STOLEN ${candlesStolen}/${candlesInLevel}  FLARE ${flareStatus}`;
    });
});

go("message", {
    title: "CANDLES",
    titleColor: BLOOD_RED,
    lines: [
        ["Steal the grave candles.", BONE_WHITE],
        [
            "Each candle wakes its owner, and feeds your dying light.",
            BONE_WHITE,
        ],
        ["use WASD to move   SHIFT to sprint   SPACE to flare", DIM_GREY],
    ],
    nextScene: "play",
});
