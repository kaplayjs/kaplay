/**
 * @file Multiple keys for one button
 * @description Hold Q and W, then release either one. The square should keep moving until both are released.
 * @difficulty 1
 * @minver 4000.0
 */

kaplay({
    width: 800,
    height: 420,
    background: [25, 28, 42],
    buttons: {
        move: { keyboard: ["q", "w"] },
    },
});

add([
    text("Hold Q + W, then release either key", { size: 27 }),
    pos(32, 30),
]);
add([
    text("Movement stops only after the last key is released.", { size: 18 }),
    pos(32, 76),
]);

const player = add([
    rect(48, 48, { radius: 8 }),
    pos(32, 180),
    color(104, 214, 189),
]);
const status = add([
    text("", { size: 22 }),
    pos(32, 290),
]);
let releases = 0;

onButtonDown("move", () => {
    player.move(220, 0);
    if (player.pos.x > width()) player.pos.x = -48;
});
onButtonRelease("move", () => releases++);
onUpdate(() => {
    status.text = `Q: ${isKeyDown("q") ? "held" : "up"}    W: ${
        isKeyDown("w") ? "held" : "up"
    }\nMove: ${isButtonDown("move") ? "DOWN" : "UP"}    Releases: ${releases}`;
});
