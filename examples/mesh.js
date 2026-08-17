const k = kaplay({
    background: [141, 183, 255],
    narrowPhaseCollisionAlgorithm: "sat",
    broadPhaseCollisionAlgorithm: "grid",
});

const JUMP_FORCE = 1320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2400;

const LEVELS = [
    [
        "    0       ",
        "   --       ",
        "       $$   ",
        " %    ===   ",
        "            ",
        "   ^^  > = @",
        "============",
    ],
    [
        "                          $",
        "                          $",
        "                          $",
        "                          $",
        "                          $",
        "           $$         =   $",
        "  %      ====         =   $",
        "                      =   $",
        "                      =    ",
        "       ^^      = >    =   @",
        "===========================",
    ],
    [
        "     $    $    $    $     $",
        "     $    $    $    $     $",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        " ^^^^>^^^^>^^^^>^^^^>^^^^^@",
        "===========================",
    ],
];

loadBean();
loadSprite("grass", "/sprites/grass.png");
loadSprite("grasstop", "/sprites/grass_top.png");
loadSprite("grassbot", "/sprites/grass_bottom.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("prize", "/sprites/jumpy.png");
loadSprite("prizetop", "/sprites/jumpy_top.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("apple", "/sprites/apple.png");
loadSprite("portal", "/sprites/portal.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("bag", "/sprites/bag.png");
loadSound("coin", "sounds/score.mp3");
loadSound("powerup", "sounds/powerup.mp3");
loadSound("blip", "sounds/blip.mp3");
loadSound("hit", "sounds/hit.mp3");
loadSound("portal", "sounds/portal.mp3");
loadWavefront("grass", "meshes/grass.obj").then(data => console.log(data));
loadWavefront("steel", "meshes/steel.obj");
loadWavefront("prize", "meshes/prize.obj");
loadWavefront("spike", "meshes/spike.obj");

loadShader(
    "3D",
    `
    attribute vec3 a_pos;
    attribute vec2 a_uv;

    uniform float width;
    uniform float height;
    uniform mat4 transform;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 v_uv;

    void main(void) {
        if (a_pos.z == 0.0) {
           gl_Position = uProjectionMatrix * transform * uModelViewMatrix * vec4(a_pos.xy, -height / 2.0, 1);
        }
        else {
            gl_Position = uProjectionMatrix * transform * uModelViewMatrix * vec4(a_pos, 1);
        }
        v_uv = a_uv;
    }
    `,
    `
    varying highp vec2 v_uv;

    uniform sampler2D u_tex;

    void main(void) {
        highp vec4 color = texture2D(u_tex, v_uv);
        if (color.a > 0.0) {
            gl_FragColor = color;
        }
        else {
            discard;
        }
    }
    `,
    true,
);

// custom component controlling enemy patrol movement
function customPatrol(speed = 60, dir = 1) {
    return {
        id: "patrol",
        require: ["pos", "area"],
        add() {
            this.on("collide", (obj, col) => {
                if (col.isLeft()) {
                    dir = 1;
                }
                else if (col.isRight()) {
                    dir = -1;
                }
            });
        },
        update() {
            this.move(speed * dir, 0);
        },
    };
}

// custom component that makes stuff grow big
function big() {
    let timer = 0;
    let isBig = false;
    let destScale = 1;
    return {
        // component id / name
        id: "big",
        // it requires the scale component
        require: ["scale"],
        // this runs every frame
        update() {
            if (isBig) {
                timer -= dt();
                if (timer <= 0) {
                    this.smallify();
                }
            }
            this.scale = this.scale.lerp(vec2(destScale), dt() * 6);
        },
        // custom methods
        isBig() {
            return isBig;
        },
        smallify() {
            destScale = 1;
            timer = 0;
            isBig = false;
        },
        biggify(time) {
            destScale = 2;
            timer = time;
            isBig = true;
        },
    };
}

onLoad(() => {
    const spikeUv = getSprite("spike").data.frames[0].q;

    const format = [
        { name: "a_pos", size: 3 },
        { name: "a_uv", size: 2 },
    ];

    const projection = Mat4.perspective(
        -width() / 2,
        width() / 2,
        -height() / 2,
        height() / 2,
        0.01,
        2000,
        height() / 2,
    );

    const gl = k._k.gfx.ggl.gl;

    let levelId = 0;

    const grassMeshData = getWavefront("grass").data.meshes.get("grass");
    const grassMesh = makeMesh(
        format,
        grassMeshData.vertices.map((v, i) => i % 5 == 2 ? v - height() / 2 : v),
        grassMeshData.indices,
    );

    const steelMeshData = getWavefront("steel").data.meshes.get("steel");
    const steelMesh = makeMesh(
        format,
        steelMeshData.vertices.map((v, i) => i % 5 == 2 ? v - height() / 2 : v),
        steelMeshData.indices,
    );

    const prizeMeshData = getWavefront("prize").data.meshes.get("prize");
    const prizeMesh = makeMesh(
        format,
        prizeMeshData.vertices.map((v, i) => i % 5 == 2 ? v - height() / 2 : v),
        prizeMeshData.indices,
    );

    const spikeMeshData = getWavefront("spike").data.meshes.get("spike");
    const spikeMesh = makeMesh(
        format,
        spikeMeshData.vertices.map((v, i) => i % 5 == 2 ? v - height() / 2 : v),
        spikeMeshData.indices,
    );

    // define what each symbol means in the level graph
    const levelConf = {
        tileWidth: 64,
        tileHeight: 64,
        tiles: {
            "=": () => [
                "platform",
                mesh({
                    mesh: grassMesh,
                }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(
                        vec3(-camPos().x, -camPos().y, 0),
                    ),
                    uProjectionMatrix: projection,
                })),
                anchor("bot"),
            ],
            "-": () => [
                mesh({
                    mesh: steelMesh,
                }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(
                        vec3(-camPos().x, -camPos().y, 0),
                    ),
                    uProjectionMatrix: projection,
                })),
                anchor("bot"),
            ],
            "0": () => [
                sprite("bag"),
                area(),
                body({ isStatic: true }),
                offscreen({ hide: true }),
                anchor("bot"),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(
                        vec3(-camPos().x, -camPos().y, 0),
                    ),
                    uProjectionMatrix: projection,
                })),
            ],
            "$": () => [
                sprite("coin"),
                area({ isSensor: true }),
                pos(0, -9),
                anchor("bot"),
                offscreen({ hide: true }),
                "coin",
            ],
            "%": () => [
                "prize",
                mesh({
                    mesh: prizeMesh,
                }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(
                        vec3(-camPos().x, -camPos().y, 0),
                    ),
                    uProjectionMatrix: projection,
                })),
                anchor("bot"),
            ],
            "^": () => [
                "danger",
                mesh({
                    mesh: spikeMesh,
                }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(
                        vec3(-camPos().x, -camPos().y, 0),
                    ),
                    uProjectionMatrix: projection,
                })),
                anchor("bot"),
            ],
            "#": () => [
                sprite("apple"),
                area({ isSensor: true }),
                anchor("bot"),
                body(),
                offscreen({ hide: true }),
                "apple",
            ],
            ">": () => [
                sprite("ghosty"),
                area(),
                anchor("bot"),
                body(),
                customPatrol(),
                offscreen({ hide: true }),
                "enemy",
            ],
            "@": () => [
                sprite("portal"),
                area({ scale: 0.5, isSensor: true }),
                anchor("bot"),
                pos(0, -12),
                offscreen({ hide: true }),
                "portal",
            ],
        },
    };

    setGravity(3200);

    scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {
        // Clear and enable z-buffer
        add([
            {
                draw() {
                    gl.clearDepth(1.0);
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(gl.LEQUAL);
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                },
            },
        ]);

        const level = addLevel(LEVELS[levelId ?? 0], levelConf);

        // disable z-buffer
        add([
            {
                draw() {
                    gl.disable(gl.DEPTH_TEST);
                },
            },
        ]);

        const player = add([
            pos(0, 0),
            sprite("bean"),
            area(),
            body(),
            big(),
            scale(),
            anchor("bot"),
        ]);

        player.onUpdate(() => {
            // center camera to player
            setCamPos(player.pos);
            // check fall death
            if (player.pos.y >= FALL_DEATH) {
                go("lose");
            }
        });

        /**
         * Interactions
         */

        /**
         * When the player touches something dangerous, kill the player
         */
        player.onCollide("danger", () => {
            go("lose");
            play("hit");
        });

        let hasApple = false;

        /**
         * When bumping the player's head into the prize, grow an apple
         */
        player.onHeadbutt((obj) => {
            if (obj.is("prize") && !hasApple) {
                const apple = level.spawn("#", obj.tilePos.sub(0, 1));
                apple.jump();
                hasApple = true;
                play("blip");
            }
        });

        /**
         * When touching an apple, make the player big
         */
        player.onCollide("apple", (a) => {
            destroy(a);
            // as we defined in the big() component
            player.biggify(3);
            hasApple = false;
            play("powerup");
        });

        /**
         * When touching a portal, teleport the player
         */
        player.onCollide("portal", () => {
            play("portal");
            if (levelId + 1 < LEVELS.length) {
                go("game", {
                    levelId: levelId + 1,
                    coins: coins,
                });
            }
            else {
                go("win");
            }
        });

        /**
         * When landing on the enemy, make the player jump and kill the enemy
         */
        player.onGround((l) => {
            if (l.is("enemy")) {
                player.jump(JUMP_FORCE * 1.5);
                destroy(l);
                addKaboom(player.pos);
                play("powerup");
            }
        });

        /**
         * When touching the enemy from any other direction, kill the player
         */
        player.onCollide("enemy", (e, col) => {
            // if it's not from the top, die
            if (!col?.isBottom()) {
                go("lose");
                play("hit");
            }
        });

        let coinPitch = 0;

        onUpdate(() => {
            if (coinPitch > 0) {
                coinPitch = Math.max(0, coinPitch - dt() * 100);
            }
        });

        player.onCollide("coin", (c) => {
            destroy(c);
            play("coin", {
                detune: coinPitch,
            });
            coinPitch += 100;
            coins += 1;
            coinsLabel.text = coins;
        });

        const coinsLabel = add([
            text(coins),
            pos(24, 24),
            fixed(),
        ]);

        /**
         * Controls
         */
        function jump() {
            if (player.isGrounded()) {
                player.jump(JUMP_FORCE);
            }
        }

        onKeyPress("space", jump);

        onKeyDown("left", () => {
            player.move(-MOVE_SPEED, 0);
        });

        onKeyDown("right", () => {
            player.move(MOVE_SPEED, 0);
        });

        onKeyPress("f", () => {
            setFullscreen(!isFullscreen());
        });
    });

    /**
     * Scenes
     */
    scene("lose", () => {
        add([
            text("You Lose"),
        ]);
        onKeyPress(() => go("game"));
    });

    scene("win", () => {
        add([
            text("You Win"),
        ]);
        onKeyPress(() => go("game"));
    });

    go("game");
});

// debug.inspect = true;
