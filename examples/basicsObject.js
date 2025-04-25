/**
 * @file Add game objects
 * @description How to create game objects
 * @difficulty 0
 * @tags basics, gobj
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 20
 *
 * RIP: add.js, 5year being the first example.
 */

// Adding game objects to screen [💡, 🥊]

/* 💡 Game Objects 💡
A Game Object is the base of all entities in KAPLAY. It's composed by components.
*/

/* 💡 Components 💡
A component is a function that adds behaviour, methods and properties to a
Game Object.
*/

kaplay();

// We load sprites with loadSprite(), it receives the asset name and the path to
// the asset.
loadSprite("bean", "/sprites/bean.png"); // Bean, the frog!

// You can add a game object to the screen using the add() function, which takes
// an array of components. We can store the result object in a variable.
const bean = add([
    sprite("bean"), // sprite() is a rendering component that draws a sprite on the screen.
    // pos(120, 80), // pos() is a component that sets the position of the object on the screen.
]);

debug.log(bean.sprite); // Prints the sprite name

/* 🥊 Challenge 🥊
Try uncommenting the pos() component, it receives and x and y coordinates
and sets the position of the object on the screen.

Then try logging the position coordinates of the object using

debug.log(bean.pos);
*/
