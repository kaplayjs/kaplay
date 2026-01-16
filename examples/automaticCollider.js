/**
 * @file Create a polygon shape with a sprite
 * @description How to make a collider automaticly
 * @difficulty 0
 * @tags basics, colliders
 * @minver 4000.0 // TODO: Update to actual version
 * @category basics
 * @test
 */

kaplay();

loadSprite("apple", "sprites/apple.png");
loadSprite("tga", "sprites/tga.png");

onDraw("gm", (gm) => {
    drawCircle({
        radius: 1,
    });
});

let poly;
let apple;
onLoad(() => {
    poly = getSpriteOutline("apple", 0, true, 5);

    apple = add([
        sprite("apple"),
        area({ shape: poly }),
        pos(200, 400),
        "gm",
    ]);

    onDraw(() => {
        const moved = poly.pts.map(p => p.add(apple.pos));

        drawPolygon({
            pts: moved,
            fill: false,
            outline: {
                color: BLUE,
                width: 2,
            },
        });
    });
});
