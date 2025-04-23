/**
 * @file Events
 * @description The lifecycle events in KAPLAY
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 30
 */

// Handling basic events in KAPLAY [💡, 🥊]

/* 💡 Events 💡
The events in KAPLAY are specific points in the game loop.
*/

/* 💡 Event Handlers 💡
The event handlers are functions where you pass needed parameters and a callback
function to run when an specific event happens.
*/

kaplay();

const beanSprite = loadSprite("bean", "/sprites/bean.png"); // we store the sprite data in a variable.

// onLoad() runs once the game loading screen is done.
onLoad(() => {
    // This is a good place to manipulate assets related data, when you know they
    // are loaded (sprites size, etc).
    console.log(beanSprite.data.width, beanSprite.data.height);
});

// onDraw() runs every frame. It's also a good idea use arrow functions for
// the event handler.
onDraw(() => {
    // This is the place to draw things on the screen using
    // drawing functions
    drawText({
        text: "I'm being drawn!",
    });
    // (we will see more about drawing functions later.)
});

// onUpdate() runs every frame. We can store the result in a variable, for example,
// to remove the event later.
const updateEvent = onUpdate(() => {
    debug.log("This will show all the time!");
});

// onKeyPress() runs when a key is pressed.
// This event need to be passed a key name, like "space", "a", "left", etc.
onKeyPress("space", () => {
    // We stop our update event, so it won't run anymore.
    updateEvent.cancel();

    debug.log("Space key pressed!");
});

// There's a lot of other events, like onKeyDown(), onMouseMove(), onFixedUpdate(),
// that you will learn about in the next examples.

/* 🥊 Challenge 🥊
Try creating a new listener using onKeyPress(), where
you will log a message when the "f" key is pressed.

A message like:

debug.log("(F) key pressed!");
*/
