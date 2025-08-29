// Starts a new game
kaplay();

// Load a bean
loadBean();

// Add the bean
const bean = add([
    sprite("bean"), // add sprite
    pos(center()), // set position, center of the screen
    scale(2), // set scale
    anchor("center"), // set anchor, pivot
    rotate(0), // set rotation
    color(0x0000ff),
]);

// Add the text
add([
    text("Hello, KAWORLD!"), // add text
    pos(center().add(0, -130)), // set position
    anchor("center"), // set anchor, pivot
]);
