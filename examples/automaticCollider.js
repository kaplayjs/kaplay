/**
 * @file Shows the outline of a custon sprite collider
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
    })
})

var poly;
onLoad(() => {
    poly = getSpriteOutline("apple");

    apple = add([
        sprite("apple"),
        area(getSpriteOutline("apple")),
        pos(200, 400),
        "gm"
    ]);
});

onDraw(() => {
    const moved = new Polygon(
        poly.pts.map(p => p.add(vec2(200, 400)))
    );

    drawPolygon(moved, {
        color: rgb(255, 0, 0),  // red outline
        filled: false,          // just an outline
        width: 2,               // line thickness
    });
})