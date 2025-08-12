/**
 * @file Picture
 * @description How to store static drawing data
 * @difficulty 0
 * @tags effects, optimization, draw
 * @minver 4000.0
 * @category concepts
 * @test
 */

// Optimized drawing using Picture API [💡]

/* 💡 Picture API 💡
The Picture API is a way to store static drawing data. It allows you to
draw a lot of sprites in a single draw call. This is useful for
optimizing performance and reducing draw calls.
*/

kaplay();

loadSprite("bean", "sprites/bean.png");

onLoad(() => {
    // We create the picture
    beginPicture(new Picture());

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            // We draw a sprite at the given position, so we
            // "store" the drawing data in the picture
            drawSprite({
                pos: vec2(64 + i * 32, 64 + j * 32),
                sprite: "bean",
            });
        }
    }

    // We end the picture
    const picture = endPicture();

    // Now all we have to do is draw the picture, this picture is cached
    // by default, so it's the most optimized way to draw a lot of sprites,
    // maps, etc.
    onDraw(() => {
        drawPicture(picture, {
            pos: vec2(400, 0),
            angle: 45,
            scale: vec2(0.5),
        });
    });
});
