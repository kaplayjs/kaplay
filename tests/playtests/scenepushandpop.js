/**
 * @file scenepushandpop
 * @description Testing for scene push and pop methods
 * @difficulty 1
 * @tags basics
 * @minver 3001.1
 */

kaplay();

loadBean();

add([
    text("(BLUE) Back from last scene\n(YELLOW) push to second scene\n(RED) Force error to a unexistent scene", {
        size: 18,
    }),
    pos(5, height() - 100),
    stay(),
]);

// create two scenes as first test //

scene("first", () => {
    add([
        text("Oh Hi! from first scene, click on the bean", {
            size: 40,
        }),
        pos(center()),
    ]);

    const b = add([
        rect(32, 32),
        pos(64, 64),
        area(),
        stay(),
    ]);

    const bimpostor = add([
        rect(32, 32),
        pos(100, 64),
        color(YELLOW),
        area(),
        stay(),
    ]);

    const berror = add([
        rect(32, 32),
        pos(200, 64),
        color(RED),
        area(),
        stay(),
    ]);

    b.onClick(() => {
        debug.log("adding page")
        pushScene("second")
    });

    bimpostor.onClick(() => {
        debug.log("back page")
        popScene();
    });

    berror.onClick(() => {
        pushScene("unexistent");
    })

    //onKeyDown("1", () => debug.log("aaaa"))
});

scene("second", () => {
    add([
        pos(center()),
        text("Oh Hi! from second scene", {
            size: 40,
        }),
    ]);
});

go("first");

//pushScene()

