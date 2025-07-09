/**
 * @file scenepushandpop
 * @description Testing for scene push and pop methods
 * @difficulty 1
 * @tags basics
 * @minver 3001.1
 */

kaplay();

loadBean();

// create two scenes as first test //

scene("first", () => {
    add([
        text("Oh Hi! from first scene, click on the bean", {
            size: 40,
        }),
        pos(center()),
    ]);

    const b = add([
        sprite("bean"),
        pos(64, 64),
        scale(0.5),
        area(),
        stay(),
    ]);

    const bimpostor = add([
        sprite("bean"),
        pos(100, 64),
        scale(0.5),
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

