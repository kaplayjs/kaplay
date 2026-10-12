/**
 * @file Fixed Update
 * @description TBD
 * @difficulty 1
 * @tags ui, input
 * @minver 4000.0
 */
// @ts-check

kaplay({
    fixedUpdateMode: "ludicrous",
});
debug.inspect = true;

const lag = false;
if (lag) {
    loadBean();
    for (let i = 0; i < 150; i++) {
        add([
            sprite("bean"),
            area(),
            pos(rand(vec2(100))),
        ]);
    }
}

const fixCounter = new (_k.app.state.fpsCounter.constructor)();

onFixedUpdate(() => {
    fixCounter.tick(dt());
});

onUpdate(() => {
    debug.log(
        [
            fixedDt(),
            fixCounter.calculate(),
            dt(),
            _k.app.state.fpsCounter.calculate(),
        ].map(x => x.toFixed(5)).join(" "),
    );
});

if (!lag) {
    loop(2, () => {
        setFixedSpeed(fixedDt() > 0.01 ? "ludicrous" : "friedPotato");
    });
}
