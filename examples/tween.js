/**
 * @file Tween
 * @description How to use tweens in KAPLAY
 * @difficulty 0
 * @tags animation
 * @minver 3001.0
 * @category concepts
 * @group tween
 * @groupOrder 0
 * @test
 */

// Tweeeeeening! (🥊 included)

kaplay({ background: "#a32858", font: "happy" });

loadBean();
loadHappy();

const bean = add([
    sprite("bean"),
    pos(center()),
    anchor("center"),
    scale(0.5),
    opacity(0),
]);

onMousePress("left", () => {
    // A tween is a function that can interpolate a value to other with a duration,
    // and easing, which controls how interpolation jump between values

    // Will tween the opacity from 0 to 1
    tween(
        0, // <- From value
        1, // <- To value
        1, // <- With duration (in seconds)
        // This functions runs for every value the tween interpolates.
        (v) => {
            bean.opacity = v; // <- Set the opacity to every value
        },
        easings.linear, // <- With this easing
    );
});

onMousePress("right", () => {
    // Will tween the scale from 0.5 to 2
    // Tween accept what is called "LerpValues", they are: Vec2, Colors and numbers
    // As .scale is a vector, we can pass vec2() directly
    tween(vec2(0.5), vec2(2), 1, (v) => {
        bean.scale = v;
    }, easings.linear);
});

/* 🥊 Challenge #1 🥊
In line 32 and 42, we use the linear easing function. But there's a lot of
easings with which you can create cool effecs. Try with one of these:

- easings.easeOutQuint
- easings.easeOutQuad
- easings.easeInExpo

You can also check all easings in action in the tweenEasings example.
*/

// Other visual elements

add([
    text("left click to make bean appear\nright click to make bean grow"),
    pos(center().x, 100),
    anchor("center"),
]);
