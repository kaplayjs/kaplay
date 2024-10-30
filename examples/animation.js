// @ts-check

// Start kaplay
kaplay();

// We use the default function to load the bean sprite
loadBean();

// We add a bean that rotates with the animate component
const rotatingBean = add([
    sprite("bean"),
    pos(50, 50),
    anchor("center"),
    rotate(0),
    animate(),
]);

// We use the 'animate()' function provided by the animate component
// This will rotate the bean from 0 to 360 degrees in 2 seconds
// The direction "forwards" means it will go back to 0 when it ends, which makes this a loop
rotatingBean.animate("angle", [0, 360], {
    duration: 2,
    direction: "forward",
});

// Now we'll move this bean from left to right
const movingBean = add([
    sprite("bean"),
    pos(50, 150),
    anchor("center"),
    animate(),
]);

// This will animate the bean from left to right in 2 seconds
// The direction "ping-pong" means that when it goes to the right, it will move back to the left
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

// The fact that is relative, means that instead of setting the bean to these positions (vec2(50, 150), vec2(150, 150))
// It will ADD those positions to the position the bean was spawned in
secondMovingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], {
    duration: 2,
    direction: "ping-pong",
});

// We'll change the color of the bean using a list of colors
const coloringBean = add([
    sprite("bean"),
    pos(50, 300),
    anchor("center"),
    color(WHITE),
    animate(),
]);

// It will animate the color the bean color from white to red to green to blue to white
// In 8 seconds, and when it's over i'll start over again
coloringBean.animate("color", [WHITE, RED, GREEN, BLUE, WHITE], {
    duration: 8,
    direction: "forward",
});

// We'll change the opacity of the bean using a list of opacities
const opacitingBean = add([
    sprite("bean"),
    pos(150, 300),
    anchor("center"),
    opacity(1),
    animate(),
]);

// We'll animate the opacity from 1, to 0, to 1 during 8 seconds
// This time, we'll be using an easing!
opacitingBean.animate("opacity", [1, 0, 1], {
    duration: 8,
    easing: easings.easeInOutCubic,
});

// We'll move this bean in a square shape
const squaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

// Passing an array of keyframes (the positions) it'll move in a square shape
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

// We'll move the bean in a square shape again, but this time we'll be using timing
const timedSquaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

// This will move the bean in the same positions as before in the same time
// But the timings will make the movement from one keyframe to another quicker or slower
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

// We'll move this bean in a curve
// Using spline interpolation to move according to a smoothened path
const curvingBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate({ followMotion: true }),
    rotate(0),
]);

// This will move bean in these positions, but using a different interpolation
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

// We'll animate a little bean to rotate around the curvingBean!
// Here we're creating a pivot
const littleBeanPivot = curvingBean.add([
    animate(),
    rotate(0),
]);

// And animating the pivot, you know this!
littleBeanPivot.animate("angle", [0, 360], {
    duration: 2,
    direction: "reverse",
});

// We'll animate a little bean to rotate around the pivot
const littleBean = littleBeanPivot.add([
    sprite("bean"),
    pos(50, 50),
    anchor("center"),
    scale(0.25),
    animate(),
    rotate(0),
]);

// And here we animate the little bean
littleBean.animate("angle", [0, 360], {
    duration: 2,
    direction: "forward",
});

// We'll the serialize an animation and log it to the console so we can see all the current animation channels
console.log(JSON.stringify(serializeAnimation(curvingBean, "root"), null, 2));

// Debug piece of code that draws a line in the curve that the curving bean goes through, don't mind it
/*onDraw(() => {
    drawCurve(t => evaluateCatmullRom(
        vec2(200, 400),
        vec2(250, 500),
        vec2(300, 400),
        vec2(350, 500), t), { color: RED })
    drawCurve(catmullRom(
        vec2(200, 400),
        vec2(250, 500),
        vec2(300, 400),
        vec2(350, 500)), { color: GREEN })
})*/
