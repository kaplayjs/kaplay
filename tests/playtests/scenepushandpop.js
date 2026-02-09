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
    // if (getSceneName() === "first")
    //    pushScene("second");
    const scenes = ["first", "second", "third", "fourth"];

    // if (getSceneName())
    //    go(scenes[getSceneName()]);

    switch (getSceneName()) {
        case "first":
            go("second");
        case "second":
            go("third");
        case "third":
            go("fourth");
        case "fourth":
            go("inexistent");
    }
});

scene("first", () => {
    add([
        text("Hello from the first scene"),
        pos(center()),
        anchor("center"),
    ]);

    const movObject = add([
        pos(center()),
        rect(32, 32),
        color(RED),
    ]);

    movObject.onUpdate(() => {
        // movObject.pos.y = wave(center().y - 64, center().y, time() * 20);
        // movObject.pos = movObject.pos.add(0, wave(center().y - 64, center().y, time() * 20));
        movObject.moveTo(
            movObject.pos.x,
            wave(center().y - 128, center().y + 128, time() * 2),
        );
    });
});

scene("second", () => {
});

scene("third", () => {
});

scene("fourth", () => {
});

go("first");

// pushScene()
