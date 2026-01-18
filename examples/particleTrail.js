/**
 * @file Particle Trail
 * @description How to do a mouse-following trail with particles()
 * @difficulty 1
 * @tags effects
 * @minver 3001.0
 * @category concepts
 * @group particles
 * @groupOrder 1
 */

kaplay();

loadSprite("hexagon", "./sprites/particle_hexagon_filled.png");

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
            texture: getSprite("hexagon").data.frames[0].tex,
            quads: [getSprite("hexagon").data.frames[0].q],
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
