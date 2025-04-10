/**
 * @file Text Input
 * @description How to take input and display it on text.
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 */

// Start kaplay
kaplay();

setBackground(BLACK);

// Add the game object that asks a question
add([
    anchor("top"),
    pos(width() / 2, 0),
    text("Whats your favorite food :D"),
]);

// Add the node that you write in
const food = add([
    text(""),
    textInput(true, 20), // make it have focus and only be 20 chars max
    pos(width() / 2, height() / 2),
    anchor("center"),
]);

// add the response
add([
    text(""),
    anchor("bot"),
    pos(width() / 2, height()),
    {
        update() {
            this.text =
                `wow i didnt know you love ${food.text} so much, but i like it too :D`;
        },
    },
]);
