kaplay({ background: "black" });
loadSprite("9slice", "/sprites/9slice.png", {
    slice9: {
        left: 32,
        right: 32,
        top: 32,
        bottom: 32,
    },
});
const g = add([
    sprite("9slice"),
]);
onUpdate(() => {
    // Should not blink
    g.width = g.height = Math.round(wave(63, 65, time() * 4));
});
