// @ts-check


kaplay();

const sprites = [
    "apple",
    "heart",
    "coin",
    "meat",
    "lightening",
];

sprites.forEach((spr) => {
    loadSprite(spr, `/sprites/${spr}.png`);
});

setGravity(800);

// Spawn one object every 0.1 second
loop(0.1, () => {
    // Compose object properties with components
    const item = add([
        pos(center()),
        sprite(choose(sprites)),
        anchor("center"),
        scale(rand(0.5, 1)),
        area({ collisionIgnore: ["fruit"] }),
        body(),
        // lifespan() comp destroys the object after desired seconds
        lifespan(1, {
            // it will fade after 0.5 seconds
            fade: 0.5
        }),
        opacity(1),
        move(choose([LEFT, RIGHT]), rand(60, 240)),
        "fruit",
    ]);

    item.jump(rand(320, 640));
});
