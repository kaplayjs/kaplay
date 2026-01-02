// Adjust camera / viewport

// Start game
kaplay();

// Load assets
loadSprite("bean", "/sprites/bean.png");
loadSprite("coin", "/sprites/coin.png");
loadSprite("grass", "/sprites/grass.png");
loadSound("score", "/sounds/score.mp3");

add([
    "score",
    text("Foobar"),
    area(),
    fixed(),
]);

setCamPos(0, 0);
setCamScale(2);

onClick("score", () => {
    debug.log("foobar");
});
