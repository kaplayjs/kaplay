// @ts-check

kaplay();

loadSprite("hexagon", "./examples/sprites/particle_hexagon_filled.png");

onLoad(() => {
    const trail = add([
        pos(),
        particles({
            max: 20,
            speed: [200, 250],
            lifeTime: [0.2, 0.75],
            colors: [WHITE],
            opacities: [1.0, 0.0],
            angle: [0, 360],
            texture: getSprite("hexagon").data.tex,
            quads: [getSprite("hexagon").data.frames[0]],
        }, {
            rate: 5,
            direction: -90,
            spread: 2,
        }),
    ]);

    onMouseMove((pos, delta) => {
        trail.emitter.position = pos;
        trail.emit(1);
    });
});
