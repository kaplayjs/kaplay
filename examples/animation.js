// @ts-check

// Start kaboom
kaplay();

loadSprite("bean", "sprites/bean.png");
loadSprite("bag", "sprites/bag.png");

// Rotating
const rotatingBean = add([
    sprite("bean"),
    pos(50, 50),
    anchor("center"),
    rotate(0),
    animate(),
]);

// Trying sprite change
rotatingBean.sprite = "bag";

rotatingBean.animate("angle", [0, 360], {
    duration: 2,
    direction: "forward",
});

// Moving right to left using ping-pong
const movingBean = add([
    sprite("bean"),
    pos(50, 150),
    anchor("center"),
    animate(),
]);

movingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], {
    duration: 2,
    direction: "ping-pong",
});

// Same animation as before, but relative to the spawn position
const secondMovingBean = add([
    sprite("bean"),
    pos(150, 0),
    anchor("center"),
    animate({ relative: true }),
]);

secondMovingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], {
    duration: 2,
    direction: "ping-pong",
});

// Changing color using a color list
const coloringBean = add([
    sprite("bean"),
    pos(50, 300),
    anchor("center"),
    color(WHITE),
    animate(),
]);

coloringBean.animate("color", [WHITE, RED, GREEN, BLUE, WHITE], {
    duration: 8,
});

// Changing opacity using an opacity list
const opacitingBean = add([
    sprite("bean"),
    pos(150, 300),
    anchor("center"),
    opacity(1),
    animate(),
]);

opacitingBean.animate("opacity", [1, 0, 1], {
    duration: 8,
    easing: easings.easeInOutCubic,
});

// Moving in a square like motion
const squaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

squaringBean.animate(
    "pos",
    [
        vec2(50, 400),
        vec2(150, 400),
        vec2(150, 500),
        vec2(50, 500),
        vec2(50, 400),
    ],
    { duration: 8 },
);

// Moving in a square like motion, but with custom spaced keyframes
const timedSquaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

timedSquaringBean.animate(
    "pos",
    [
        vec2(50, 400),
        vec2(150, 400),
        vec2(150, 500),
        vec2(50, 500),
        vec2(50, 400),
    ],
    {
        duration: 8,
        timing: [
            0,
            0.1,
            0.3,
            0.7,
            1.0,
        ],
    },
);

// Using spline interpolation to move according to a smoothened path
const curvingBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate({ followMotion: true }),
    rotate(0),
]);

curvingBean.animate(
    "pos",
    [
        vec2(200, 400),
        vec2(250, 500),
        vec2(300, 400),
        vec2(350, 500),
        vec2(400, 400),
    ],
    { duration: 8, direction: "ping-pong", interpolation: "spline" },
);

const littleBeanPivot = curvingBean.add([
    animate(),
    rotate(0),
    named("littlebeanpivot"),
]);

littleBeanPivot.animate("angle", [0, 360], {
    duration: 2,
    direction: "reverse",
});

const littleBean = littleBeanPivot.add([
    sprite("bean"),
    pos(50, 50),
    anchor("center"),
    scale(0.25),
    animate(),
    rotate(0),
    named("littlebean"),
]);

littleBean.animate("angle", [0, 360], {
    duration: 2,
    direction: "forward",
});

console.log(JSON.stringify(serializeAnimation(curvingBean, "root"), "", 2));

/*onDraw(() => {
    drawCurve(t => evaluateCatmullRom(
        vec2(200, 400),\
        vec2(250, 500),
        vec2(300, 400),
        vec2(350, 500), t), { color: RED })
    drawCurve(catmullRom(
        vec2(200, 400),
        vec2(250, 500),
        vec2(300, 400),
        vec2(350, 500)), { color: GREEN })
})*/
