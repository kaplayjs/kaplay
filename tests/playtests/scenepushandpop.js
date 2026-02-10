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
    const scenes = ["first", "second", "third", "fourth", "inexistent"];

    if (getSceneName() === scenes[getSceneIndex()])
        pushScene(scenes[getSceneIndex() + 1]);
});

function createMovingObject(color, xPos, yPos)
{
    const obj = add([
        pos(0, 0),
        rect(32, 32),
        color(GREEN),
    ]);

    obj.onUpdate(() => {
        obj.moveTo(
            wave(xPos.vec.from, xPos.vec.to, time() * xPos.time),
            wave(yPos.vec.from, yPos.vec.to, time() * yPos.time),
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
        time: 0,
    }, {
        from: center().y - 128,
        to: center().y
    });
});

scene("second", () => {
    add([
        text("Hello from the second scene, continue pushing!!"),
        pos(center()),
        anchor("center"),
    ]);

    const ob1 = add([
        pos(center()),
        rect(32, 32),
        color(RED),
    ]);

    const ob2 = add([
        pos(center()),
        rect(32, 32),
        color(BLUE),
    ]);

    onUpdate(() => {
        ob1.moveTo(
            ob1.pos.x,
            wave(center().y - 128, center().y + 128, time() * 2),
        );
        ob2.moveTo(
            wave(center().x - 128, center().x + 128, time() * 2),
            ob2.pos.y
        );
    });
});

scene("third", () => {
    add([
        text("Hello from the third scene, we're close to the last one, keep pushing!!"),
        pos(center()),
        anchor("center"),
    ]);

    const ob1 = add([
        pos(center()),
        rect(32, 32),
        color(RED),
    ]);

    const ob2 = add([
        pos(center()),
        rect(32, 32),
        color(BLUE),
    ]);

    const ob3 = add([
        pos(0, 0),
        rect(32, 32),
        color(GREEN),
    ]);

    onUpdate(() => {
        ob1.moveTo(
            ob1.pos.x,
            wave(center().y - 128, center().y + 128, time() * 2),
        );
        ob2.moveTo(
            wave(center().x - 128, center().x + 128, time() * 2),
            ob2.pos.y
        );
        ob3.moveTo(
            wave(center().x - 300, center().x + 300, time() * 0.6),
            wave(center().y - 128, center().y + 128, time() * 2)
        );
    });
});

scene("fourth", () => {
    add([
        text("Hello from the third scene, we're close to the last one, keep pushing!!"),
        pos(center()),
        anchor("center"),
    ]);

    const ob1 = add([
        pos(center()),
        rect(32, 32),
        color(RED),
    ]);

    const ob2 = add([
        pos(center()),
        rect(32, 32),
        color(BLUE),
    ]);

    const ob3 = add([
        pos(0, 0),
        rect(32, 32),
        color(GREEN),
    ]);

    const ob4 = add([
        pos(0, 0),
        rect(32, 32),
        color(GREEN),
    ]);

    onUpdate(() => {
        ob1.moveTo(
            ob1.pos.x,
            wave(center().y - 128, center().y + 128, time() * 2),
        );
        ob2.moveTo(
            wave(center().x - 128, center().x + 128, time() * 2),
            ob2.pos.y
        );
        ob3.moveTo(
            wave(center().x - 300, center().x + 300, time() * 0.6),
            wave(center().y - 128, center().y + 128, time() * 2)
        );
    });
});

go("first");

// pushScene()
