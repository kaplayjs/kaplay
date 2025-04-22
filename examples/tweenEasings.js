/**
 * @file Tween Easings
 * @description See all different easings in tween()
 * @difficulty 0
 * @tags animation
 * @minver 3001.0
 * @category concepts
 * @group tween
 * @groupOrder 1
 */

// See all the tweeen easings

kaplay({
    background: "#a32858",
    font: "happy",
});

loadHappy();
loadSprite("bean", "/sprites/bean.png");

const DURATION = 1;
const EASINGS = Object.keys(easings);
let curEasing = 0;

const bean = add([
    sprite("bean"),
    scale(2),
    pos(center()),
    rotate(0),
    anchor("center"),
]);

const label = add([
    text(EASINGS[curEasing], { size: 64 }),
    pos(24, 24),
]);

add([
    text("Click anywhere & use arrow keys", { width: width() }),
    anchor("botleft"),
    pos(24, height() - 24),
]);

onKeyPress(["left", "a"], () => {
    curEasing = curEasing === 0 ? EASINGS.length - 1 : curEasing - 1;
    label.text = EASINGS[curEasing];
});

onKeyPress(["right", "d"], () => {
    curEasing = (curEasing + 1) % EASINGS.length;
    label.text = EASINGS[curEasing];
});

let curTween = null;

onMousePress(() => {
    const easeType = EASINGS[curEasing];

    // Stop the previos tween
    if (curTween) curTween.cancel();

    // start the tween
    curTween = tween(
        // start value (accepts number, Vec2 and Color)
        bean.pos,
        // destination value
        mousePos(),
        // duration (in seconds)
        DURATION,
        // how value should be updated
        (val) => bean.pos = val,
        // interpolation function (defaults to easings.linear)
        easings[easeType],
    );
});
