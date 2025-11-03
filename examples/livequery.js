/**
 * @file Live query
 * @description How to live update a get() action.
 * @difficulty 1
 * @tags basics
 * @minver 3001.0
 * @category concepts
 * @test
 */

// How to keep a get() always updated

kaplay();

loadSprite("ghosty", "/sprites/ghosty.png");

const q = get("area", { liveUpdate: true });

loop(5, () => {
    if (q.length < 10) {
        const x = rand(0, width());
        const y = rand(0, height());

        const ghost = add([
            sprite("ghosty"),
            pos(x, y),
            area(),
            timer(),
            color(WHITE),
            "touchable",
        ]);
        ghost.wait(5, () => {
            ghost.unuse("area");
            ghost.untag("touchable");
            ghost.use(color(RED));
            ghost.wait(5, () => {
                ghost.use(area());
                ghost.tag("touchable");
                ghost.use(color(WHITE));
            });
        });
    }
});

onClick("touchable", (ghost) => {
    ghost.destroy();
});

loop(1, () => {
    debug.log(`There are ${q.length} touchable ghosts`);
});
