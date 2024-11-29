kaplay();

loadSprite("ghosty", "/sprites/ghosty.png");

const q = get("color", { liveUpdate: true });

loop(5, () => {
    if (q.length < 10) {
        const x = rand(0, width());
        const y = rand(0, height());

        const ghost = add([
            sprite("ghosty"),
            pos(x, y),
            area(),
            timer(),
            color(RED),
            "ghost"
        ]);
        ghost.wait(5, () => {
            ghost.unuse("color");
            ghost.wait(5, () => {
                ghost.use(color(RED));
            })
        })
    }
});

onClick("ghost", (ghost) => {
    ghost.destroy();
});

loop(1, () => {
    debug.log(`There are ${q.length} touchable ghosts`);
});