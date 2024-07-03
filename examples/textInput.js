// Start kaboom
kaplay();

setBackground(BLACK)

// Add the game object that asks a question
add([
    anchor("top"),
    pos(width()/2, 0),
    text("Whats your favorite food :D")
]);

// Add the node that you write in
const food = add([
    text(""),
    textInput(true, 10), // make it have focus and only be 20 chars max
    pos(width()/2, height()/2),
    anchor("center"),
]);

// add the response
add([
    text(""),
    anchor("bot"),
    pos(width()/2, height()),
    {
      update(){
        this.text = `wow i didnt know you love ${food.text} so much, but i like it too :D`
      }
    }
])