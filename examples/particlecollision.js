kaplay({
    broadPhaseCollisionAlgorithm: "grid",
});

loadSprite("star", "./sprites/particle_star_filled.png");

onLoad(() => {
    go("game");
});

function woah() {
    const parts = add([
        pos(center()),
        particles({
            max: 20,
            speed: [50, 100],
            angle: [0, 360],
            angularVelocity: [45, 90],
            acceleration: [vec2(0, 100), vec2(0, 100)],
            lifeTime: [10, 15],
            colors: [WHITE, WHITE],
            scales: [1, 2, 1],
            texture: getSprite("star").data.tex,
            quads: [getSprite("star").data.frames[0]],
        }, {
            // lifetime: 1.5,
            rate: 0,
            direction: -90,
            spread: 40,
        }),
    ]);

    parts.emit(20);
}

scene("game", () => {
    add([
        pos(0, 600),
        rect(width(), 50),
        area(),
    ]);
    onKeyPress("space", () => {
        woah();
    });

    onMousePress(() => {
        woah();
    });

    add([
        text("press space for particles"),
    ]);
});
