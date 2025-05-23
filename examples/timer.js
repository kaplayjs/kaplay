/**
 * @file Timer
 * @description How to make count time in KAPLAY.
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 * @category concepts
 * @test
 */

kaplay();

loadSprite("bean", "/sprites/bean.png");

// Execute something after every 0.5 seconds.
loop(0.5, () => {
    const bean = add([
        sprite("bean"),
        pos(rand(vec2(0), vec2(width(), height()))),
    ]);

    // Execute something after 3 seconds.
    wait(3, () => {
        destroy(bean);
    });
});
