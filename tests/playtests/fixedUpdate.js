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

class FPSCounter {
    win = 10;
    history = new Array(this.win).fill(0);
    accumulator = 0;
    i = 0;
    fps = 0;
    count = 0;
    tick(dt) {
        this.accumulator += dt - this.history[this.i];
        this.history[this.i] = dt;
        this.i = (this.i + 1) % this.win;
        this.count = Math.min(this.count + 1, this.win);
        this.fps = this.count / this.accumulator;
    }
}

const fixCounter = new FPSCounter(), normalCounter = new FPSCounter();

onFixedUpdate(() => {
    fixCounter.tick(dt());
});

onUpdate(() => {
    normalCounter.tick(dt());
    debug.log(
        [
            fixedDt(),
            fixCounter.fps,
            dt(),
            normalCounter.fps,
        ].map(x => x.toFixed(5)).join(" "),
    );
});

if (!lag) {
    loop(2, () => {
        setFixedSpeed(fixedDt() > 0.01 ? "ludicrous" : "friedPotato");
    });
}
