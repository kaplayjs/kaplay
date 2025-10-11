/**
 * @file Lifetime Scopes
 * @description How to use lifetime scopes
 * @difficulty 0
 * @tags basics, events
 * @minver 3001.0
 * @category basics
 * @test
 */

// Lifetime scopes are a way to define the lifetime of an event handler. [💡]

kaplay({
    defaultLifetimeScope: "scene", // default is "scene", you can change it to "app"
    background: "#a6859f",
});

loadBean();

/* 💡 App Scope 💡
The event handler will be active while the game is running.
*/
app.onKeyPress("a", () => {
    debug.log(
        "A key pressed in app.onKeyPress(), this gonna work while the game is running.",
    );
});

scene("scene1", () => {
    debug.log("entered to game scene");

    const obj = add([
        sprite("bean"),
        anchor("center"),
        pos(center()),
    ]);

    add([
        text("Press A (app), S (scene), D (object) or F (go to scene2)", {
            width: width() - 20,
        }),
        stay(),
    ]);

    /* 💡 Scene Scope 💡
    The event handler will be active while the scene is active.
    */
    scene.onKeyPress("s", () => {
        debug.log(
            "S key pressed in scene.onKeyPress(), this gonna work while the scene is active.",
        );
    });

    /* 💡 Object Scope 💡
    The event handler will be active while the object exists.
    */
    obj.onKeyPress("d", () => {
        debug.log(
            "D key pressed in obj.onKeyPress(), this gonna work while the object exists.",
        );
    });

    /* 💡 Default Scope 💡
    The event handler will be active based on the default scope defined in
    the `defaultLifetimeScope`, which is "scene" by default.
    */
    onKeyPress("f", () => {
        debug.log(
            "F key pressed in onKeyPress() (default scope), going to scene2",
        );
        go("scene2");
    });
});

scene("scene2", (params) => {
    debug.log("entered to gameover scene");
});

go("scene1");
