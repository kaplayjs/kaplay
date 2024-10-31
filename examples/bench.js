// @ts-config

// Bench marking sprite rendering performance
// We use this example to test and bench the performance of kaplay rendering

kaplay();

loadSprite("bean", "sprites/bean.png");
loadSprite("bag", "sprites/bag.png");
loadSprite("bobo", "sprites/bobo.png");
loadSprite("ghosty", "sprites/ghosty.png");

const scenes = [
    "sprites",
    "objects",
];

scene("sprites", () => {
    debug.log("Rendering 5000 sprites using onDraw");

    // Adds 5 thousand sprites which can be a bean or a bag in random positions
    const sprites = [];

    for (let i = 0; i < 5000; i++) {
        sprites.push({
            sprite: i % 2 === 0 ? "bean" : "bag",
            pos: vec2(rand(0, width()), rand(0, height())),
            anchor: "center",
        });
    }

    onDraw(() => {
        sprites.forEach((sprite) => {
            drawSprite(sprite);
        });
    });

    addFps();
    addSceneNavigation();
});

scene("objects", () => {
    debug.log("Rendering 5000 sprites using game objects");

    // Adds 5 thousand objects which can be a bean or a bag in random positions
    for (let i = 0; i < 5000; i++) {
        add([
            sprite(i % 2 === 0 ? "bobo" : "ghosty"),
            pos(rand(0, width()), rand(0, height())),
            anchor("center"),
        ]).paused = true;
    }

    addFps();
    addSceneNavigation();
});

go("sprites");

function addFps() {
    onDraw(() => {
        drawText({
            // You can get the current fps with debug.fps()
            text: debug.fps(),
            pos: vec2(width() / 2, height() / 2),
            anchor: "center",
            color: rgb(255, 127, 255),
            outline: {
                width: 10,
            },
        });
    });
}

function addSceneNavigation() {
    onKeyPress("1", () => go("sprites"));
    onKeyPress("2", () => go("objects"));

    onTouchStart(() => {
        const currentScene = getSceneName();
        const nextScene =
            scenes[(scenes.indexOf(currentScene) + 1) % scenes.length];

        go(nextScene);
    });
}
