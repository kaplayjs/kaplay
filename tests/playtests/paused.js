kaplay({ scale: 2 });

loadBean();

let countdown = 4;
const bean = add([
    pos(center()),
    sprite("bean"),
    anchor("center"),
    rotate(),
    area(),
]);

// Listeners registered after paused will run regardless
bean.paused = true;

loop(1, () => {
    debug.log("will pause in", countdown -= 1);
}, countdown).then(() => {
    bean.paused = true;
    debug.log("paused, shouldn't spin on space down");
});

bean.onKeyDown("space", () => {
    bean.angle += dt() * 100;
});

bean.onUpdate(() => {
    debug.log("updateee");
});

bean.onClick(() => {
    debug.log("clicked");
});
