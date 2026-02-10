/**
 * @file scenepushandpop
 * @description Testing for scene push and pop methods
 * @difficulty 1
 * @tags basics
 * @minver 3001.1
 */

kaplay();

loadBean();

// shared //
const global = add([
    pos(0, height - 64),
    text(
        "Oh Hi!\nUse (UP) key to push a new scene\n(DOWN) to pop to old scene",
    ),
    fixed(),
    stay(),
]);

global.onKeyPress("up", () => {
    const scenes = [
        "first",
        "second",
        "third",
        "fourth",
        "I said you will crash :(",
    ];

    if (getSceneName() === scenes[getSceneIndex()]) {
        pushScene(scenes[getSceneIndex() + 1]);
    }
});

global.onKeyPress("down", () => {
    popScene();
});

function createMovingObject(col, xPos, yPos) {
    const obj = add([
        pos(0, 0),
        rect(32, 32),
        color(col),
    ]);

    obj.onUpdate(() => {
        obj.moveTo(
            wave(xPos.from, xPos.to, time() * xPos.time || 2),
            wave(yPos.from, yPos.to, time() * yPos.time || 2),
        );
    });
}

scene("first", () => {
    add([
        text("Hello from the first scene"),
        pos(center()),
        anchor("center"),
    ]);

    createMovingObject(RED, {
        from: center().x,
        to: center().x,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });
});

scene("second", () => {
    add([
        text("Hello from the second scene, continue pushing!!"),
        pos(center()),
        anchor("center"),
    ]);

    createMovingObject(RED, {
        from: center().x,
        to: center().x,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });

    createMovingObject(BLUE, {
        from: center().x - 128,
        to: center().x + 128,
        time: 2,
    }, {
        from: center().y,
        to: center().y,
    });
});

scene("third", () => {
    add([
        text(
            "Hello from the third scene, we're close to the last one, keep pushing!!",
            {
                size: 34,
            },
        ),
        pos(center()),
        anchor("center"),
    ]);

    createMovingObject(RED, {
        from: center().x,
        to: center().x,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });

    createMovingObject(BLUE, {
        from: center().x - 128,
        to: center().x + 128,
        time: 2,
    }, {
        from: center().y,
        to: center().y,
    });

    createMovingObject(GREEN, {
        from: center().x - 300,
        to: center().x + 300,
        time: 0.75,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });
});

scene("fourth", () => {
    add([
        text(
            "Hello from the fourth scene, we're now at end, if you push you will crash!!",
            {
                size: 30,
            },
        ),
        pos(center()),
        anchor("center"),
    ]);

    createMovingObject(RED, {
        from: center().x,
        to: center().x,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });

    createMovingObject(BLUE, {
        from: center().x - 128,
        to: center().x + 128,
        time: 2,
    }, {
        from: center().y,
        to: center().y,
    });

    createMovingObject(GREEN, {
        from: center().x - 300,
        to: center().x + 300,
        time: 0.75,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });

    createMovingObject(YELLOW, {
        from: center().x + 300,
        to: center().x - 300,
        time: 0.75,
    }, {
        from: center().y - 128,
        to: center().y + 128,
        time: 2,
    });
});

go("first");

// pushScene()
