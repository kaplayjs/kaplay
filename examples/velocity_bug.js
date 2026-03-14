kaplay({
    buttons: {
        upNew: { keyboard: ["w", "up"] },
        downNew: { keyboard: ["s", "down"] },
        leftNew: { keyboard: ["a", "left"] },
        rightNew: { keyboard: ["d", "right"] },
    },
});

loadSprite("dirt", "sprites/bean.png");

const levelLayout = [
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "============",
];

const levelConf = {
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
        "=": () => [
            sprite("dirt"),
            area({ restitution: 0.2 }),
            scale(2),
            body({ isStatic: true }),
            anchor("bot"),
            "dirt",
        ],
    },
};

let lastPressedDirection = 1;
let camPos = vec2(0, 0);
const LOOK_AHEAD_OFFSET = 50;
const MOVE_SPEED = 200;
const CAM_SMOOTH = 5;

scene("game", () => {
    setGravity(2400);
    setCamScale(vec2(2, 2));
    addLevel(levelLayout, levelConf);

    const player = add([
        circle(5),
        scale(3),
        color("#2596be"),
        area({ restitution: 0.5 }),
        body(),
        pos(0, 0),
    ]);

    onButtonDown("rightNew", () => {
        player.move(MOVE_SPEED, 0);
        lastPressedDirection = 1;
    });

    onButtonDown("leftNew", () => {
        player.move(-1 * MOVE_SPEED, 0);
        lastPressedDirection = -1;
    });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(800);
        }
    });

    /*onKeyRelease("space", () => {
        if (player.vel.y < 0) {
            player.vel = vec2(player.vel.x, player.vel.y * 0.4);
        }
    });*/

    player.onUpdate(() => {
        const targetX = player.pos.x + lastPressedDirection * LOOK_AHEAD_OFFSET;
        const targetY = player.pos.y;

        camPos = vec2(
            lerp(camPos.x, targetX, CAM_SMOOTH * dt()),
            lerp(camPos.y, targetY, CAM_SMOOTH * dt()),
        );

        setCamPos(camPos);
    });
});

go("game");

/*
Oh wow, new curse unlocked :beant: @MF it looks like circle's vel
 is increased on each tile crevice collision.. different
 broadPhaseCollisionAlgorithms are even worse.. and different
 narrowPhaseCollisionAlgorithm cant be used since its circle..
 you could change it to "sat" but your collision will basically
 change to rects.. would be the same effect if you did
 area({ shape: new Rect(vec2(0), 10, 10) }) and anchor("center")
 I think on your player obj.. also looks like it started with
 alpha 5 where it moves just slightly and stops, then since
 alpha 6 it just builds up speed such as now (havent checked
 which algos and when were added)
*/
