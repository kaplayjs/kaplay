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
    "uvquads",
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

scene("uvquads", () => {
    debug.log("Rendering 5000 uv quads using onDraw");

    const quads = [];
    const bean = getSprite("bean");
    const bag = getSprite("bag");
    // We only need the bean texture since the bag texture is on the same atlas
    const tex = bean.data.tex;
    const beanQuad = bean.data.frames[0];
    const bagsQuad = bag.data.frames[0];

    for (let i = 0; i < 5000; i++) {
        quads.push({
            tex: tex,
            quad: i % 2 === 0 ? beanQuad : bagsQuad,
            pos: vec2(rand(0, width()), rand(0, height())),
            width: i % 2 === 0 ? bean.data.width : bag.data.width,
            height: i % 2 === 0 ? bean.data.height : bag.data.height,
        });
    }

    onDraw(() => {
        quads.forEach((quad) => {
            drawUVQuad(quad);
        });
    });

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
    onKeyPress("3", () => go("uvquads"));

    onTouchStart(() => {
        const currentScene = getSceneName();
        const nextScene =
            scenes[(scenes.indexOf(currentScene) + 1) % scenes.length];

        go(nextScene);
    });
}
