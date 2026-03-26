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
loadSprite("steel", "/sprites/steel.png");
loadSprite("prize", "/sprites/jumpy.png");
loadSprite("ghosty", "/sprites/ghosty.png");
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
        gl_Position = uProjectionMatrix * transform * uModelViewMatrix * vec4(a_pos, 1);
        v_uv = a_uv;
    }
    `,
    `
    varying highp vec2 v_uv;

    uniform sampler2D u_tex;

    void main(void) {
        gl_FragColor = texture2D(u_tex, v_uv);
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

onLoad(() => {
    const grassUv = getSprite("grass").data.frames[0].q;
    const steelUv = getSprite("steel").data.frames[0].q;
    const prizeUv = getSprite("prize").data.frames[0].q;

    const format = [
        { name: "a_pos", size: 3 },
        { name: "a_uv", size: 2 },
    ];

    const vertices = (uv) => [
        // Front
        0,
        64,
        -height() / 2,
        uv.x,
        uv.y + uv.h - 0.001, /*1, 1, 1, 1,*/
        0,
        0,
        -height() / 2,
        uv.x,
        uv.y + 0.001, /*1, 1, 1, 1,*/
        64,
        0,
        -height() / 2,
        uv.x + uv.w,
        uv.y + 0.001, /*1, 1, 1, 1,*/
        64,
        64,
        -height() / 2,
        uv.x + uv.w,
        uv.y + uv.h - 0.001, /*1, 1, 1, 1,*/
        // Back
        0,
        64,
        -height() / 2 - 64,
        uv.x + uv.w,
        uv.y + uv.h - 0.001, /*1, 1, 1, 1,*/
        0,
        0,
        -height() / 2 - 64,
        uv.x + uv.w,
        uv.y + 0.001, /*1, 1, 1, 1,*/
        64,
        0,
        -height() / 2 - 64,
        uv.x,
        uv.y + 0.001, /*1, 1, 1, 1,*/
        64,
        64,
        -height() / 2 - 64,
        uv.x,
        uv.y + uv.h - 0.001, /*1, 1, 1, 1,*/
    ];

    const indices = [
        // Front
        0,
        1,
        3,
        1,
        2,
        3,
        // Back
        7,
        6,
        4,
        6,
        5,
        4,
        // Left
        4, 5, 0,
        5, 1, 0,
        // Right
        3, 2, 7,
        2, 6, 7,
        // Top
        1, 5, 2,
        5, 6, 2,
        // Bottom
        4, 0, 7,
        0, 3, 7
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

    // define what each symbol means in the level graph
    const levelConf = {
        tileWidth: 64,
        tileHeight: 64,
        tiles: {
            "=": () => [
                /*sprite("grass"),
                area(),
                body({ isStatic: true }),
                anchor("bot"),
                offscreen({ hide: true }),*/
                "platform",
                mesh({ mesh: makeMesh(format, vertices(grassUv), indices) }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
                    uProjectionMatrix: projection,
                })),
            ],
            "-": () => [
                /*sprite("steel"),
                area(),
                body({ isStatic: true }),
                offscreen({ hide: true }),
                anchor("bot"),*/
                mesh({ mesh: makeMesh(format, vertices(steelUv), indices) }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
                    uProjectionMatrix: projection,
                })),
            ],
            /*"0": () => [
                sprite("bag"),
                area(),
                body({ isStatic: true }),
                offscreen({ hide: true }),
                anchor("bot"),
            ],
            "$": () => [
                sprite("coin"),
                area({ isSensor: true }),
                pos(0, -9),
                anchor("bot"),
                offscreen({ hide: true }),
                "coin",
            ],*/
            "%": () => [
                /*sprite("prize"),
                area(),
                body({ isStatic: true }),
                anchor("bot"),
                offscreen({ hide: true }),*/
                "prize",
                mesh({ mesh: makeMesh(format, vertices(prizeUv), indices) }),
                area(),
                body({ isStatic: true }),
                shader("3D", () => ({
                    uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
                    uProjectionMatrix: projection,
                })),
            ],
            /*"^": () => [
                sprite("spike"),
                area(),
                body({ isStatic: true }),
                anchor("bot"),
                offscreen({ hide: true }),
                "danger",
            ],
            "#": () => [
                sprite("apple"),
                area({ isSensor: true }),
                anchor("bot"),
                body(),
                offscreen({ hide: true }),
                "apple",
            ],*/
            ">": () => [
                sprite("ghosty"),
                area(),
                anchor("bot"),
                body(),
                customPatrol(),
                offscreen({ hide: true }),
                "enemy",
            ],
            /*"@": () => [
                sprite("portal"),
                area({ scale: 0.5, isSensor: true }),
                anchor("bot"),
                pos(0, -12),
                offscreen({ hide: true }),
                "portal",
            ],*/
        },
    };

    setGravity(3200);

    // Clear and enable z-buffer
    add([
        {
            draw() {
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.DEPTH_BUFFER_BIT);
            }
        }
    ]);

    const level = addLevel(LEVELS[levelId ?? 0], levelConf);

    /*add([
        pos(vec2(width() / 2 - 128, height() / 2 + 64)),
        mesh({ mesh: makeMesh(format, vertices, indices) }),
        area(),
        body({ isStatic: true }),
        shader("3D", () => ({
            //uModelViewMatrix: new Mat4(),
            uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
            uProjectionMatrix: projection,
        })),
    ]);
    add([
        pos(vec2(width() / 2 - 128 + 64, height() / 2 + 64)),
        mesh({ mesh: makeMesh(format, vertices, indices) }),
        area(),
        body({ isStatic: true }),
        shader("3D", () => ({
            uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
            uProjectionMatrix: projection,
        })),
    ]);
    add([
        pos(vec2(width() / 2, height() / 2 + 64)),
        mesh({ mesh: makeMesh(format, vertices, indices) }),
        area(),
        body({ isStatic: true }),
        shader("3D", () => ({
            uModelViewMatrix: Mat4.translate3(vec3(- camPos().x, - camPos().y, 0)),
            uProjectionMatrix: projection,
        })),
    ]);*/

    // disable z-buffer
    add([
        {
            draw() {
                gl.disable(gl.DEPTH_TEST);
            }
        }
    ]);

    const player = add([
        pos(0, 0),
        sprite("bean"),
        area(),
        body(),
    ]);

    player.onUpdate(() => {
        // center camera to player
        setCamPos(player.pos);
        // check fall death
        if (player.pos.y >= FALL_DEATH) {
            go("lose");
        }
    });

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
});

//debug.inspect = true;
