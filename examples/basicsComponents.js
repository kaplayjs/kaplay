/**
 * @file Components
 * @description More about components
 * @difficulty 0
 * @tags basics, comps
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 40
 */

// Understanding more about components and it's state [💡]

/* 💡 Components 💡
The components compose the Game Objects. Every component expose in the Game Obj
a serie of properties and methods to manipulate it's state.
*/

kaplay();

loadSprite("bean", "/sprites/bean.png");

const obj = add([
    sprite("bean"), // it renders as a sprite
    pos(100, 100), // set the position
    rotate(0), // set the rotation
    anchor("center"), // set the pivot point
]);

// Modifying the angle of the object (from rotate()):

onUpdate(() => {
    // rotate() gives you obj.angle, which is the angle in degrees.
    // We modify it every frame to rotate the object.
    obj.angle = obj.angle + 100 * dt();
});

// Moving the object (from pos()):

// We define a speed variable to move the object
const SPEED = 200;

onUpdate(() => {
    // We will store a direction in a 2D vector.
    const dir = vec2(0, 0);

    // isKeyDown() is a function that checks if a key is held down.
    if (isKeyDown("left")) dir.x = -1;
    if (isKeyDown("right")) dir.x = 1;
    if (isKeyDown("up")) dir.y = -1;
    if (isKeyDown("down")) dir.y = 1;
    // (we will see more about input handling later)

    // We convert the vector to a unit vector. This means that the vector have
    // a length of 1, but the direction is the same. Then we scale it by the
    // speed.
    obj.move(dir.unit().scale(SPEED));
});
