/**
 * @file Components
 * @description More about components
 * @difficulty 0
 * @tags basics, comps
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 50
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
    // With plain objects, we can store custom data in the Game Obj
    {
        dir: vec2(0, 0), // a direction vector
        speed: 200, // a speed variable
    },
]);

// Modifying the angle of the object (from rotate()):
obj.onUpdate(() => {
    // obj.angle is a property provided by the rotate() component.
    // It represents the angle of the object in degrees. We can modify it
    // to rotate the object.
    obj.angle = obj.angle + 100 * dt();
});

// Moving the object (from pos()):
obj.onUpdate(() => {
    // We reset the direction vector to 0,
    obj.dir.x = 0;
    obj.dir.y = 0;

    // isKeyDown() is a function that checks if a key is held down.
    if (isKeyDown("left")) obj.dir.x = -1;
    if (isKeyDown("right")) obj.dir.x = 1;
    if (isKeyDown("up")) obj.dir.y = -1;
    if (isKeyDown("down")) obj.dir.y = 1;
    // (we will see more about input handling later)

    // .move() is a method provided by the pos() component.
    // It moves the object by a given vector.
    obj.move(
        // We convert the vector to a unit vector. This means that the vector have
        // a length of 1, but the direction is the same. Then we scale it by the
        // speed.
        obj.dir.unit().scale(obj.speed),
    );
});
