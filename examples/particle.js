// Creating particles using Particle Component

kaplay();

loadSprite("star", "./examples/sprites/particle_star_filled.png");

onLoad(() => {
    go("game")
});

function woah() {
    const parts = add([
        pos(center()),
        particles({
            max: 20,
            speed: [50, 100],
            angle: [0, 360],
            angularVelocity: [45, 90],
            lifeTime: [1.0, 1.5],
            colors: [rgb(128, 128, 255), WHITE],
            opacities: [0.1, 1.0, 0.0],
            scales: [1, 2, 1],
            texture: getSprite("star").data.tex,
            quads: [getSprite("star").data.frames[0]],
        }, {
            lifetime: 1.5,
            rate: 0,
            direction: -90,
            spread: 40,
        }),
    ]);

    parts.emit(20);
}

scene("game", () => {
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

