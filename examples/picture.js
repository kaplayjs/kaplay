/**
 * @file Picture
 * @description How to store static drawing data.
 * @difficulty 2
 * @tags effects
 * @minver 4000.0
 * @locked
 */

kaplay();

loadSprite("bean", "sprites/bean.png");

onLoad(() => {
    beginPicture(new Picture());
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            drawSprite({
                pos: vec2(64 + i * 32, 64 + j * 32),
                sprite: "bean",
            });
        }
    }
    const picture = endPicture();

    onDraw(() => {
        drawPicture(picture, {
            pos: vec2(400, 0),
            angle: 45,
            scale: vec2(0.5),
        });
    });
});
