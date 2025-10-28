/**
 * @file Re-Bind Buttons
 * @description How to re-bind button mappings mid-game
 * @difficulty 3
 * @tags ui, input
 * @minver 4000
 * @test
 */

kaplay({
    buttons: {
        hi: {
            keyboard: ["enter"],
        },
    },
    background: "black",
});

onButtonDown("hi", () => {
    add([
        text("hi"),
        pos(rand(vec2(200), vec2(500))),
        lifespan(1),
        opacity(),
    ]);
});

const updateBtn = add([
    rect(300, 50),
    pos(310, 100),
    anchor("center"),
    area(),
]);
const label = updateBtn.add([
    text("", { align: "center" }),
    color(BLACK),
    anchor("center"),
]);
add([
    text("say hi:"),
    pos(0, 100),
    anchor("left"),
]);

// True is the user is currently inputting a button combo
let isInputting = false;
let combo = [];
// record the combo
onKeyPress(key => {
    if (isInputting) combo.push(key);
});
// commit the combo if one was entered
onKeyRelease(() => {
    isInputting = false;
    if (combo.length > 0) {
        setButton("hi", { keyboard: combo.join("+") });
    }
    combo = [];
});
// show the combo entering process on the button
onUpdate(() => {
    if (isInputting) {
        label.color = BLUE;
        label.text = `> ${combo.join("+")} <`;
    }
    else {
        label.color = BLACK;
        label.text = "" + getButton("hi").keyboard;
    }
});
// enter keybinding update mode when clicking the button
updateBtn.onClick(() => {
    combo = [];
    isInputting = !isInputting;
});
