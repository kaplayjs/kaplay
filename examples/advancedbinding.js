/**
 * @file Advanced Bindings
 * @description Bind multiple actions to the same key, using modifier keys.
 * @difficulty 3
 * @tags ui, input
 * @minver 4000.0
 */

kaplay({
    buttons: {
        next: {
            keyboard: "tab",
            gamepad: ["south", "dpad-right"],
        },
        prev: {
            keyboard: "shift+tab",
            gamepad: ["rshoulder+south", "dpad-left"],
        },
    },
    font: "happy",
    background: "black",
});
loadHappy();
const friends = [
    "bean",
    "beant",
    "zombean",
    "burpman",
    "skuller",
    "bag",
    "bobo",
    "sukomi",
    "dino",
    "ghosty",
    "mark",
    "kat",
    "tga",
].sort();
for (let friend of friends) {
    loadSprite(friend, `/crew/${friend}.png`);
}

let index = 0;
const picker = add([
    pos(center()),
    sprite(friends[index]),
    anchor("center"),
    scale(3),
    opacity(1),
]);

const pickerText = picker.add([
    pos(0, -50),
    text(friends[index], { align: "center", size: 10 }),
    anchor("bot"),
]);

add([
    text("\\[shift + tab] <-            -> \\[tab]", { size: 30 }),
    pos(center().sub(100, 0)),
    anchor("center"),
]);

const SLIDE = vec2(-100, 0);
const SPEED = 0.1;
function flip(direction) {
    index = (index + direction + friends.length) % friends.length;
    tween(1, 0, SPEED, v => {
        picker.opacity = v;
        picker.pos = lerp(center().add(SLIDE.scale(direction)), center(), v);
    }).then(() => {
        picker.use(sprite(pickerText.text = friends[index]));
        tween(0, 1, SPEED, v => {
            picker.opacity = v;
            picker.pos = lerp(
                center().add(SLIDE.scale(-direction)),
                center(),
                v,
            );
        });
    });
}

onButtonPress("next", () => {
    debug.log("going to next friend");
    flip(1);
});
onButtonRelease("next", () => {
    debug.log("next up");
});
onButtonPress("prev", () => {
    debug.log("going to previous friend");
    flip(-1);
});
onButtonRelease("prev", () => {
    debug.log("prev up");
});
