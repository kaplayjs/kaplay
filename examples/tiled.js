kaplay();

loadSprite("bean", "/sprites/bean.png");

add([
    pos(150, 150),
    sprite("bean", {
        tiled: true,
        width: 200,
        height: 200,
    }),
    anchor("center"),
]);

// debug.inspect = true
