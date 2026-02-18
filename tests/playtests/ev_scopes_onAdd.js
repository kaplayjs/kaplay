kaplay({
    defaultLifetimeScope: "scene", // Default Option
});

loadBean();

const addDummy = () => {
    add([
        sprite("bean"),
        pos(randi(0, width() - 40), randi(0, height() + 40)),
        "customTag",
    ]);
};

scene("a", () => {
    debug.log("press c to change scene");

    onAdd("customTag", (obj) => {
        debug.log(obj.id, "was created");
    });

    addDummy();

    onKeyPress("c", () => {
        go("b");
    });
});

scene("b", () => {
    debug.log("scene changed!");

    addDummy();
});

go("a");
