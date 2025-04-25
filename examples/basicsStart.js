/**
 * @file Create your first game
 * @description All you need to know to get started
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 * @category basics
 * @group basics
 * @groupOrder 0
 */

// Get started with KAPLAY [💡]

/* 💡 KAPLAY Context 💡
The kaplay() function is the entry point to your game. It sets up the game and
exports all the functions and variables you need to use in your game, like
add(), loadSprite(), debug.log(), pos(), and many more. This is called the context.
*/

// We initialize the context
kaplay({
    // We can optionally pass options to it!
    background: "#5ba675", // Set the background color
});

// Now you have access to the context functions:
debug.log("Hello from game!");
