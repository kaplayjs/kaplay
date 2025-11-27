/**
 * @file Lag Level
 * @description Assess how much lag area() causes. (higher score is better)
 */

kaplay({
    background: "#4a3052",
    font: "happy-o",
    logMax: 1,
});

loadBitmapFont("happy-o", "/crew/happy-o.png", 36, 45);

let count = 0;
let baseFPS = 0;

loop(0.1, () => {
    add([
        pos(rand(width()), rand(height())),
        rect(50, 50),
        opacity(0.8),
        area({ collisionIgnore: ["area"] }),
        "area",
    ]);

    count++;
});

onUpdate(() => {
    if (debug.fps() <= baseFPS - 4) {
        debug.paused = true;

        add([
            anchor("center"),
            pos(center()),
            text(count, { size: 120 }),
        ]);
    }

    debug.log(count, debug.fps());
});

wait(3, () => baseFPS = debug.fps());
