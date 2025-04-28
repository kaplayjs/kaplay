/**
 * @file Patrol
 * @description How to patrol a sprite.
 * @difficulty 1
 * @tags physics
 * @minver 3001.0
 * @category concepts
 */

kaplay();

loadBean();

const bean = add([
    sprite("bean"),
    pos(40, 30),
    patrol({
        waypoints: [
            vec2(100, 100),
            vec2(120, 170),
            vec2(50, 50),
            vec2(300, 100),
        ],
    }),
]);

bean.onPatrolFinished(gb => {
    debug.log(`Bean reached the end of the patrol at ${gb.pos.x}, ${gb.pos.y}`);
});
