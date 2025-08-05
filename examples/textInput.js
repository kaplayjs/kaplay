/**
 * @file Text Input
 * @description How to take input and display it on text
 * @difficulty 0
 * @tags basics, ui
 * @minver 3001.0
 * @category basics
 * @test
 */

// Using textInput() component to catch user text input easily

kaplay({ font: "happy", background: "#a6555f" });

loadHappy();

// We will ask something!
add([
    pos(width() / 2, 50),
    text("What's your favorite KAPLAY Crew member", {
        // Responsive friendly
        align: "center",
        width: width(),
    }),
    anchor("top"),
]);

// This object will catch user input
const crew = add([
    text(""),
    // We pass true so it focus by default. You can also do crew.hasFocus = true;
    textInput(true, 20), // <- 20 chars at max
    pos(width() / 2, height() / 2),
    anchor("center"),
]);

// Our response
const response = add([
    text("", {
        align: "center",
        width: width(),
    }),
    anchor("bot"),
    pos(width() / 2, height() - 50),
]);

// Updating the response, depending on input
response.onUpdate(() => {
    if (crew.text == "") {
        response.text = "...";
    }
    else if (crew.text.toLowerCase() === "mark") {
        response.text = `Yep. Mark the best`;
    }
    else {
        response.text = `I like ${crew.text}, but Mark is better`;
    }
});
