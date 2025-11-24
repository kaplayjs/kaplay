/**
 * @file Fixed Update
 * @description TBD
 * @difficulty 1
 * @tags ui, input
 * @minver 4000.0
 */
// @ts-check

kaplay();
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

class DtCounter {
    constructor() {
        this.timing = new Array(10).fill(0);
        this.i = 0;
        this.accumulator = 0;
    }
    tick(dt) {
        this.accumulator += dt;
        this.accumulator -= this.timing[this.i];
        this.timing[this.i] = dt;
        this.i = (this.i + 1) % this.timing.length;
    }
    measureFPS() {
        return this.timing.length / this.accumulator;
    }
}

const fixCounter = new DtCounter(), normalCounter = new DtCounter();

onFixedUpdate(() => {
    fixCounter.tick(dt());
});

onUpdate(() => {
    normalCounter.tick(dt());
    debug.log(
        [
            fixedDt(),
            fixCounter.measureFPS(),
            dt(),
            normalCounter.measureFPS(),
        ].map(x => x.toFixed(5)).join(" "),
    );
});
