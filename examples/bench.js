// @ts-config

// Bench marking sprite rendering performance
// We use this example to test and bench the performance of kaplay rendering

kaplay();

loadSprite("bean", "sprites/bean.png");
loadSprite("bag", "sprites/bag.png");

// Adds 5 thousand objects which can be a bean or a bag in random positions
for (let i = 0; i < 5000; i++) {
    add([
        sprite(i % 2 === 0 ? "bean" : "bag"),
        pos(rand(0, width()), rand(0, height())),
        anchor("center"),
    ]).paused = true;
}

onDraw(() => {
    drawText({
        // You can get the current fps with debug.fps()
        text: debug.fps(),
        pos: vec2(width() / 2, height() / 2),
        anchor: "center",
        color: rgb(255, 127, 255),
    });
});
