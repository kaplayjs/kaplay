/**
 * @file Out of Screen
 * @description How to handle objects that are out of screen.
 * @difficulty 1
 * @tags comps
 * @minver 3001.0
 * @category concepts
 * @test
 */

// detect if obj is out of screen

kaplay();

loadSprite("bean", "/sprites/bean.png");

// custom comp
function handleout() {
    return {
        id: "handleout",
        require: ["pos"],
        update() {
            const spos = this.screenPos;
            if (
                spos.x < 0
                || spos.x > width()
                || spos.y < 0
                || spos.y > height()
            ) {
                // triggers a custom event when out
                this.trigger("out");
            }
        },
    };
}

const SPEED = 640;

function shoot() {
    const center = vec2(width() / 2, height() / 2);
    const mpos = mousePos();
    add([
        pos(center),
        sprite("bean"),
        anchor("center"),
        handleout(),
        "bean",
        { dir: mpos.sub(center).unit() },
    ]);
}

onKeyPress("space", shoot);
onClick(shoot);

onUpdate("bean", (m) => {
    m.move(m.dir.scale(SPEED));
});

// binds a custom event "out" to tag group "bean"
on("out", "bean", (m) => {
    addKaboom(m.pos);
    destroy(m);
});
