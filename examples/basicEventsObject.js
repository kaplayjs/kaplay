/**
 * @file Object Events
 * @description Handling events on objects
 * @difficulty 0
 * @tags basics, comps
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 40
 */

// Before getting more into components, will see more about Game Objects [💡]

/* 💡 Game Object Raw 💡
It's the serie of methods and properties that are available on all game objects,
like exists(), destroy(),
*/

/* 💡 Game Object Events 💡
Game objects have their own events based on it's lifecycle and state.
*/

kaplay();

loadSprite("bean", "/sprites/bean.png");

const obj = add([
    sprite("bean"),
    anchor("center"),
    pos(100, 100),
]);

// obj.onUpdate() is called every frame while the object exists.
obj.onUpdate(() => {
    debug.log("hi!");
});

// obj.onDestroy() is called when the object is destroyed.
obj.onDestroy(() => {
    debug.log("bye cruel world!");
});

// We can destroy the object using obj.destroy()
obj.onKeyPress("space", () => {
    addKaboom(obj.pos); // addKaboom() is a function that creates an explosion at the given position.
    obj.destroy();
});

// Notice we will use global onKeyPress() to handle the event.
// This is because we want this running even if the object is destroyed.
onKeyPress("enter", () => {
    // We can also if the object exists using obj.exists()
    if (obj.exists()) {
        console.log("The object exists!");
    }
    else {
        console.log("The object doesn't exist!");
    }
});
