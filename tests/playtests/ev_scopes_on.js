kaplay({
    defaultLifetimeScope: "scene", // Default Option
});

loadBean();

const addAndTriggerDummy = () => {
    const dummy = add([
        sprite("bean"),
        "customTag",
    ]);

    dummy.trigger("customEv");
};

scene("a", () => {
    debug.log("press c to change scene");

    on("customEv", "customTag", (obj) => {
        debug.log(obj.id, "have received", "\"customEv\"");
    });

    addAndTriggerDummy();

    onKeyPress("c", () => {
        go("b");
    });
});

scene("b", () => {
    debug.log("scene changed!");

    addAndTriggerDummy();
});

go("a");
