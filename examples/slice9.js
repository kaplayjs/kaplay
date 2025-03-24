// @ts-check

// 9 slice sprite scaling

kaplay();

// Load a sprite that's made for 9 slice scaling
loadSprite("9slice", "/examples/sprites/9slice.png", {
    // Define the slice by the margins of 4 sides
    slice9: {
        left: 32,
        right: 32,
        top: 32,
        bottom: 32,
    },
});

const g = add([
    pos(center()),
    sprite("9slice"),
    anchor("center")
]);

onMouseMove(() => {
    const size = mousePos().sub(center());
    // Scaling the image will keep the aspect ratio of the sliced frames
    g.width = Math.abs(size.x) * 2;
    g.height = Math.abs(size.y) * 2;
});
